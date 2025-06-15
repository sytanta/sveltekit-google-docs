import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';

import { mutation, query } from './_generated/server';
import type { Id } from './_generated/dataModel';

export const create = mutation({
	args: {
		title: v.optional(v.string()),
		initial_content: v.optional(v.string()),
		user_external_id: v.string(),
		organization_external_id: v.optional(v.string())
	},
	async handler(ctx, args) {
		const { title, initial_content, user_external_id, organization_external_id } = args;

		// Fetch user & organization
		const [user, organization] = await Promise.all([
			ctx.db
				.query('users')
				.withIndex('by_external_id', (q) => q.eq('external_id', user_external_id))
				.unique(),
			organization_external_id
				? ctx.db
						.query('organizations')
						.withIndex('by_external_id', (q) => q.eq('external_id', organization_external_id))
						.unique()
				: null
		]);
		if (!user) throw new ConvexError("User doesn't exist");

		let owner_id: Id<'users'> = user._id;
		let owner_external_id: string = user_external_id;
		// If user created a document when using an organization owned by another user,
		// this document will belong to that organization's owner
		if (organization && user_external_id !== organization.owner_external_id) {
			owner_id = organization.owner_id;
			owner_external_id = organization.owner_external_id;
		}

		const data: {
			initial_content?: string | undefined;
			room_id?: Id<'rooms'> | undefined;
			organization_id?: Id<'organizations'> | undefined;
			title: string;
			owner_id: Id<'users'>;
			owner_external_id: string;
		} = {
			title: title || 'Untitled document',
			initial_content: initial_content,
			owner_id,
			owner_external_id
		};
		if (organization) data.organization_id = organization._id;

		return await ctx.db.insert('documents', data);
	}
});

export const listByUser = query({
	args: {
		user_external_id: v.string(),
		organization_external_id: v.optional(v.string()),
		paginationOpts: paginationOptsValidator,
		search: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { user_external_id, paginationOpts, organization_external_id, search } = args;

		// Fetch user & organization
		const [user, organization] = await Promise.all([
			ctx.db
				.query('users')
				.withIndex('by_external_id', (q) => q.eq('external_id', user_external_id))
				.unique(),
			organization_external_id
				? ctx.db
						.query('organizations')
						.withIndex('by_external_id', (q) => q.eq('external_id', organization_external_id))
						.unique()
				: null
		]);
		if (!user) throw new ConvexError("User doesn't exist");

		if (search) {
			const results = await ctx.db
				.query('documents')
				.withSearchIndex('search_title', (q) =>
					organization
						? q.search('title', search).eq('organization_id', organization._id)
						: q.search('title', search).eq('owner_id', user._id)
				)
				.paginate(paginationOpts);

			return {
				...results,
				page: results.page
			};
		}

		if (organization) {
			const results = await ctx.db
				.query('documents')
				.withIndex('by_organization_id', (q) => q.eq('organization_id', organization._id))
				.order('desc')
				.paginate(paginationOpts);

			return {
				...results,
				page: results.page
			};
		}

		const results = await ctx.db
			.query('documents')
			.withIndex('by_owner_id', (q) => q.eq('owner_id', user._id))
			.order('desc')
			.paginate(paginationOpts);

		return {
			...results,
			page: results.page
		};
	}
});

export const getById = query({
	args: {
		id: v.string(),
		user_external_id: v.string(),
		organization_external_id: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { id, user_external_id, organization_external_id } = args;

		// Fetch document, user & organization
		const [doc, user, organization] = await Promise.all([
			ctx.db
				.query('documents')
				.filter((q) => q.eq(q.field('_id'), id))
				.unique(),
			ctx.db
				.query('users')
				.withIndex('by_external_id', (q) => q.eq('external_id', user_external_id))
				.unique(),
			organization_external_id
				? ctx.db
						.query('organizations')
						.withIndex('by_external_id', (q) => q.eq('external_id', organization_external_id))
						.unique()
				: null
		]);

		if (!doc) throw new ConvexError('Document not found');
		if (!user) throw new ConvexError('Unauthorized');

		// If the doc belongs to another organization
		if (organization && doc.organization_id !== organization._id)
			throw new ConvexError('Unauthorized');

		// If user is not owner and not a member of the organization
		if (!organization && doc.owner_id !== user._id) throw new ConvexError('Unauthorized');

		return doc;
	}
});

export const getByIdNoAuth = query({
	args: {
		id: v.id('documents')
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	}
});

export const removeById = mutation({
	args: {
		id: v.id('documents'),
		user_external_id: v.string(),
		organization_external_id: v.optional(v.string())
	},
	async handler(ctx, args) {
		const { id, user_external_id, organization_external_id } = args;

		// Fetch document, user & organization
		const [document, user, organization] = await Promise.all([
			ctx.db
				.query('documents')
				.filter((q) => q.eq(q.field('_id'), id))
				.unique(),
			ctx.db
				.query('users')
				.withIndex('by_external_id', (q) => q.eq('external_id', user_external_id))
				.unique(),
			organization_external_id
				? ctx.db
						.query('organizations')
						.withIndex('by_external_id', (q) => q.eq('external_id', organization_external_id))
						.unique()
				: null
		]);

		if (!document) throw new ConvexError('Document not found');
		if (!user) throw new ConvexError('Unauthorized');

		// If the doc belongs to another organization
		if (organization && document.organization_id !== organization._id)
			throw new ConvexError('Unauthorized');

		// If user is not owner
		if (document.owner_id !== user._id) throw new ConvexError('Unauthorized');

		return await ctx.db.delete(args.id);
	}
});

export const updateTitleById = mutation({
	args: {
		id: v.id('documents'),
		title: v.string(),
		user_external_id: v.string(),
		organization_external_id: v.optional(v.string())
	},
	async handler(ctx, args) {
		const { id, user_external_id, organization_external_id } = args;

		// Fetch document, user & organization
		const [document, user, organization] = await Promise.all([
			ctx.db
				.query('documents')
				.filter((q) => q.eq(q.field('_id'), id))
				.unique(),
			ctx.db
				.query('users')
				.withIndex('by_external_id', (q) => q.eq('external_id', user_external_id))
				.unique(),
			organization_external_id
				? ctx.db
						.query('organizations')
						.withIndex('by_external_id', (q) => q.eq('external_id', organization_external_id))
						.unique()
				: null
		]);

		if (!document) throw new ConvexError('Document not found');
		if (!user) throw new ConvexError('Unauthorized');

		// If the document belongs to another organization
		if (organization && document.organization_id !== organization._id)
			throw new ConvexError('Unauthorized');

		// If user is not owner and not a member of the organization
		if (!organization && document.owner_id !== user._id) throw new ConvexError('Unauthorized');

		return await ctx.db.patch(args.id, { title: args.title });
	}
});
