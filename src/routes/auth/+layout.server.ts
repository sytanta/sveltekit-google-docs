import { redirect } from '@sveltejs/kit';

import clerkBackendClient from '$lib/utils/clerk/backend';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request }) => {
	const auth = await clerkBackendClient.authenticateRequest(request);
	if (auth.isAuthenticated) redirect(301, '/');
};
