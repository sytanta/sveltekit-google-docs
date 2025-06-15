import { error, json } from '@sveltejs/kit';

import clerkBackendClient from '$lib/utils/clerk/backend';
import colorByUserName from '$lib/utils/nameToColor';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
	const auth = await clerkBackendClient.authenticateRequest(request, {
		acceptsToken: ['session_token', 'oauth_token', 'machine_token', 'api_key']
	});
	if (!auth.isAuthenticated) error(401, 'Unauthorized');

	const authData = auth.toAuth() as ReturnType<typeof auth.toAuth> & {
		userId: string;
		orgId: string | null;
	};

	const clerkUsers = authData.orgId
		? await clerkBackendClient.users.getUserList({ organizationId: [authData.orgId] })
		: { data: [] };

	const users = clerkUsers.data.reduce(
		(acc, { id, fullName, primaryEmailAddress, imageUrl }) => {
			const name = fullName ?? primaryEmailAddress?.emailAddress ?? 'Anonymous';
			acc[id] = {
				id,
				name: name,
				avatar: imageUrl,
				color: colorByUserName(name)
			};
			return acc;
		},
		{} as { [key: string]: { id: string; name: string; avatar: string; color: string } }
	);

	return json(users);
};
