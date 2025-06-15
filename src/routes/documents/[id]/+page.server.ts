import { error } from '@sveltejs/kit';

import { DOCUMENT_TYPES, TEMPLATES } from '$lib/data/templates';
import convexHttpClient from '$lib/utils/convex/backend';
import clerkBackendClient from '$lib/utils/clerk/backend';
import colorByUserName from '$lib/utils/nameToColor';
import { api } from '../../../convex/_generated/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends, request, url, params }) => {
	depends('document-details');

	if (params.id === 'new') {
		let documentType = url.searchParams.get('type') || 'blank';
		if (!DOCUMENT_TYPES.includes(documentType as (typeof DOCUMENT_TYPES)[number]))
			documentType = 'blank';

		const initialContent = TEMPLATES.find(({ id }) => id === documentType)?.initialContent;

		return {
			document: { _id: 'new', title: 'Untitled document', initial_content: initialContent || '' }
		};
	}

	const auth = await clerkBackendClient.authenticateRequest(request, {
		acceptsToken: ['session_token', 'oauth_token', 'machine_token', 'api_key']
	});
	if (!auth.isAuthenticated) return error(401, 'Unauthorized');

	const authData = auth.toAuth() as ReturnType<typeof auth.toAuth> & {
		userId: string;
		orgId: string | null;
	};

	const document = await convexHttpClient.query(api.documents.getById, {
		id: params.id,
		user_external_id: authData.userId,
		organization_external_id: authData.orgId ?? undefined
	});
	if (!document) error(404, 'Document not found');

	const clerkUsers = authData.orgId
		? await clerkBackendClient.users.getUserList({ organizationId: [authData.orgId] })
		: { data: [] };

	const users = clerkUsers.data.reduce(
		(acc, { id, fullName, primaryEmailAddress, imageUrl }) => {
			const name = fullName ?? primaryEmailAddress?.emailAddress ?? 'Anonymous';
			acc[id] = {
				id,
				name,
				email: primaryEmailAddress?.emailAddress!,
				avatar: imageUrl,
				color: colorByUserName(name)
			};
			return acc;
		},
		{} as {
			[key: string]: { id: string; name: string; email: string; avatar: string; color: string };
		}
	);

	return {
		document,
		users
	};
};
