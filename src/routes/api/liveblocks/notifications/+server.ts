import { error, json } from '@sveltejs/kit';

import clerkBackendClient from '$lib/utils/clerk/backend';
import lbBackendClient from '$lib/utils/liveblocks/backend';
import type { NotificationData } from '$lib/stores/types';
import type { RequestHandler } from '../$types';

export const POST: RequestHandler = async ({ request }) => {
	const auth = await clerkBackendClient.authenticateRequest(request, {
		acceptsToken: ['session_token', 'oauth_token', 'machine_token', 'api_key']
	});
	if (!auth.isAuthenticated) error(401, 'Unauthorized');

	const authData = auth.toAuth() as ReturnType<typeof auth.toAuth> & {
		userId: string;
		orgId: string | null;
	};

	const [requestData, clerkUsersData] = await Promise.allSettled([
		request.json(),
		authData.orgId
			? await clerkBackendClient.users.getUserList({ organizationId: [authData.orgId] })
			: { data: [] }
	]);

	const { data: notificationData } =
		requestData.status === 'fulfilled'
			? (requestData.value as { data: NotificationData })
			: { data: null };

	const { data: allUsersData } =
		clerkUsersData.status === 'fulfilled' ? clerkUsersData.value : { data: [] };

	if (!notificationData) error(400, 'Invalid notification data');

	const {
		kind,
		type,
		roomId,
		threadId,
		commentId,
		authorId,
		authorName,
		mentionUserId,
		mentionUserName,
		content,
		timestamp
	} = notificationData;

	// Create notification for filtered users
	let receivers = allUsersData.filter((user) => user.id !== authorId);
	if (type === 'mention') receivers = receivers.filter((user) => user.id === mentionUserId);

	const notifications = receivers.map((user) => ({
		kind: kind as `$${string}`,
		userId: user.id!,
		roomId,
		subjectId: threadId,
		activityData: {
			type,
			commentId,
			authorId,
			authorName,
			mentionUserId,
			mentionUserName,
			content,
			timestamp
		}
	}));
	console.log('aaaaaaaaaaaaaaaaa', notifications);

	await lbBackendClient.deleteAllInboxNotifications({ userId: receivers[0].id! });

	// Send notifications using Liveblocks
	await Promise.all(
		notifications.map((notification) => lbBackendClient.triggerInboxNotification(notification))
	);

	return json({ success: true });
};
