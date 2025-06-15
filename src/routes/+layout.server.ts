import clerkBackendClient from '$lib/utils/clerk/backend';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request }) => {
	const auth = await clerkBackendClient.authenticateRequest(request, {
		acceptsToken: ['session_token', 'oauth_token', 'machine_token', 'api_key']
	});

	return { clerkBackendStatus: auth.status };
};
