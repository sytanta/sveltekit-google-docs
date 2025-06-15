import { setContext } from 'svelte';
import type { ConvexClient } from 'convex/browser';
import type { Clerk } from '@clerk/clerk-js';

import { api } from '../../convex/_generated/api';

export type UsersContext = { [key: string]: 1 };

export const USERS_CONTEXT_NAME = Symbol();

export const createUsersContext = () => {
	const usersContext: UsersContext = {};
	setContext(USERS_CONTEXT_NAME, usersContext);
	return usersContext;
};

export const setUser = (
	user: Clerk['user'],
	usersContext: UsersContext,
	convexClient: ConvexClient
) => {
	if (!user || usersContext[user.id]) return;

	usersContext[user.id] = 1;

	// Create a new record in "users" table
	createConvexUser(user, convexClient);
};

const createConvexUser = (user: Clerk['user'], convexClient: ConvexClient) => {
	if (!user) return;

	const {
		id,
		fullName,
		primaryEmailAddress,
		imageUrl,
		username,
		firstName,
		lastName,
		primaryPhoneNumber,
		hasVerifiedEmailAddress,
		hasVerifiedPhoneNumber,
		updatedAt
	} = user;

	return convexClient.mutation(api.users.create, {
		external_id: id,
		aud: 'convex',
		name: fullName ?? '',
		email: String(primaryEmailAddress ?? ''),
		picture: imageUrl,
		nickname: username ?? '',
		given_name: firstName ?? '',
		updated_at: updatedAt?.getTime() ?? new Date().getTime(),
		family_name: lastName ?? '',
		phone_number: String(primaryPhoneNumber ?? ''),
		email_verified: hasVerifiedEmailAddress,
		phone_number_verified: hasVerifiedPhoneNumber
	});
};
