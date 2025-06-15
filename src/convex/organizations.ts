import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const create = mutation({
	args: {
		external_id: v.string(),
		name: v.string(),
		slug: v.optional(v.string()),
		image_url: v.optional(v.string()),
		user_external_id: v.string()
	},
	async handler(ctx, args) {
		let createOrganization = true;

		// Check if the same organization has been created
		const existingOrganization = await ctx.db
			.query('organizations')
			.withIndex('by_external_id', (q) => q.eq('external_id', args.external_id))
			.unique();
		if (existingOrganization) createOrganization = false;

		// Check if user exists
		const { external_id, name, slug, image_url, user_external_id } = args;
		const user = await ctx.db
			.query('users')
			.withIndex('by_external_id', (q) => q.eq('external_id', user_external_id))
			.unique();
		if (!user) throw new ConvexError('Unauthorized');

		// Create a new organization
		const organization = existingOrganization
			? existingOrganization._id
			: await ctx.db.insert('organizations', {
					external_id,
					name,
					slug,
					image_url,
					owner_id: user._id,
					owner_external_id: user_external_id
				});

		// Check if user is a member of the organization
		const membership = createOrganization
			? null
			: await ctx.db
					.query('organizations_users')
					.withIndex('by_user_organization_ids', (q) =>
						q.eq('user_id', user._id).eq('organization_id', organization)
					)
					.unique();

		return !membership
			? await ctx.db.insert('organizations_users', {
					user_id: user._id,
					organization_id: organization
				})
			: undefined;
	}
});
