import convexBackendClient from '$lib/utils/convex/backend';
import clerkBackendClient from '$lib/utils/clerk/backend';
import { api } from '../../convex/_generated/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends, request, url }) => {
	depends('home');

	const auth = await clerkBackendClient.authenticateRequest(request, {
		acceptsToken: ['session_token', 'oauth_token', 'machine_token', 'api_key']
	});
	if (!auth.isAuthenticated)
		return {
			documents: {
				page: [],
				isDone: true,
				continueCursor: null,
				splitCursor: null,
				pageStatus: null
			}
		};

	const authData = auth.toAuth() as ReturnType<typeof auth.toAuth> & {
		userId: string;
		orgId: string | null;
	};

	const documents = await convexBackendClient.query(api.documents.listByUser, {
		user_external_id: authData.userId,
		organization_external_id: authData.orgId ?? undefined,
		search: url.searchParams.get('search') || '',
		paginationOpts: {
			numItems: 5,
			cursor: null
		}
	});

	return {
		documents
	};
};
