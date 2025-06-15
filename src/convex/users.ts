import { ConvexError, v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const create = mutation({
	args: {
		external_id: v.string(),
		aud: v.string(),
		name: v.string(),
		email: v.string(),
		picture: v.optional(v.string()),
		nickname: v.optional(v.string()),
		given_name: v.optional(v.string()),
		updated_at: v.number(),
		family_name: v.optional(v.string()),
		phone_number: v.optional(v.string()),
		email_verified: v.optional(v.boolean()),
		phone_number_verified: v.optional(v.boolean())
	},
	async handler(ctx, args) {
		// Check if the same user has been created
		const existingUser = await ctx.db
			.query('users')
			.withIndex('by_external_id', (q) => q.eq('external_id', args.external_id))
			.unique();
		if (existingUser) return existingUser._id;

		return await ctx.db.insert('users', args);
	}
});

export const getByClerkId = query({
	args: {
		user_clerk_id: v.string()
	},
	handler: async (ctx, args) => {
		const { user_clerk_id } = args;

		const user = await ctx.db
			.query('users')
			.withIndex('by_external_id', (q) => q.eq('external_id', user_clerk_id))
			.unique();

		if (!user) throw new ConvexError('User not found');

		return user;
	}
});
