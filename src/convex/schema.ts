import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	documents: defineTable({
		title: v.string(),
		initial_content: v.optional(v.string()),
		owner_id: v.id('users'),
		owner_external_id: v.string(),
		room_id: v.optional(v.id('rooms')),
		organization_id: v.optional(v.id('organizations'))
	})
		.index('by_owner_id', ['owner_id'])
		.index('by_owner_external_id', ['owner_external_id'])
		.index('by_organization_id', ['organization_id'])
		.searchIndex('search_title', {
			searchField: 'title',
			filterFields: ['owner_id', 'owner_external_id', 'organization_id', 'room_id']
		}),
	users: defineTable({
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
	}).index('by_external_id', ['external_id']),
	organizations: defineTable({
		name: v.string(),
		slug: v.optional(v.string()),
		image_url: v.optional(v.string()),
		external_id: v.string(),
		owner_id: v.id('users'),
		owner_external_id: v.string()
	}).index('by_external_id', ['external_id']),
	organizations_users: defineTable({
		user_id: v.id('users'),
		organization_id: v.id('organizations')
	})
		.index('by_user_id', ['user_id'])
		.index('by_organization_id', ['organization_id'])
		.index('by_user_organization_ids', ['user_id', 'organization_id']),
	rooms: defineTable({
		name: v.string(),
		owner_id: v.id('users')
	})
});
