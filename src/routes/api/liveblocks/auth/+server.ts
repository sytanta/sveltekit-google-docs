import { error } from '@sveltejs/kit';

import convexBackendClient from '$lib/utils/convex/backend';
import clerkBackendClient from '$lib/utils/clerk/backend';
import lbBackendClient from '$lib/utils/liveblocks/backend';
import colorByUserName from '$lib/utils/nameToColor';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
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

	const { room }: { room: Id<'documents'> } = await request.json();

	const [user, doc] = await Promise.allSettled([
		clerkBackendClient.users.getUser(authData.userId),
		convexBackendClient.query(api.documents.getById, {
			id: room,
			user_external_id: authData.userId,
			organization_external_id: authData.orgId || undefined
		})
	]);

	if (doc.status === 'rejected') error(404, 'Document not found');
	if (user.status === 'rejected') error(401, 'Unauthorized');

	const name = user.value.fullName ?? user.value.primaryEmailAddress?.emailAddress ?? 'Anonymous';
	const session = lbBackendClient.prepareSession(authData.userId, {
		userInfo: {
			id: authData.userId,
			email: user.value.primaryEmailAddress?.emailAddress,
			name,
			avatar: user.value.imageUrl,
			color: colorByUserName(name)
		}
	});
	session.allow(room, session.FULL_ACCESS);

	const { status, body } = await session.authorize();
	return new Response(body, { status });
};
