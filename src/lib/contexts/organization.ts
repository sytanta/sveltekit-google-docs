import { setContext } from 'svelte';
import type { ConvexClient } from 'convex/browser';

import { api } from '../../convex/_generated/api';

export type OrganizationsContext = { [key: string]: 1 };
type Organization = { id: string; name: string; slug?: string | null; imageUrl?: string } | null;

export const ORGANIZATIONS_CONTEXT_NAME = Symbol();

export const createGroupsContext = () => {
	const organizationsContext: OrganizationsContext = {};
	setContext(ORGANIZATIONS_CONTEXT_NAME, organizationsContext);
	return organizationsContext;
};

export const setOrganization = (
	org: Organization,
	userExternalId: string,
	organizationsContext: OrganizationsContext,
	convexClient: ConvexClient
) => {
	const key = [userExternalId, org?.id].join(':');
	if (!org || organizationsContext[key]) return;

	organizationsContext[key] = 1;

	// Create a new record in "groups" table
	createOrganization(org, convexClient, userExternalId);
};

const createOrganization = (
	org: Organization,
	convexClient: ConvexClient,
	userExternalId: string
) => {
	if (!org) return;

	const { id, name, slug, imageUrl } = org;

	return convexClient.mutation(api.organizations.create, {
		external_id: id,
		name,
		slug: slug ?? '',
		image_url: imageUrl,
		user_external_id: userExternalId
	});
};
