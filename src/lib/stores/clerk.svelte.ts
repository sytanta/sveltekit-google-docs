import type { Clerk } from '@clerk/clerk-js';

export const clerkClientStore = $state<{ clerk: Clerk | null }>({ clerk: null });

export const setClerkClientStore = (clerk: Clerk | null) => {
	clerkClientStore.clerk = clerk;
};
