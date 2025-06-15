import type { ConvexClient } from 'convex/browser';
import type { Clerk } from '@clerk/clerk-js';

import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';
import { browser } from '$app/environment';
import { invalidateAll } from '$app/navigation';
import { setUser, type UsersContext } from '$lib/contexts/user';
import { setOrganization, type OrganizationsContext } from '$lib/contexts/organization';
import { setAppLoading } from '$lib/stores/appState.svelte';
import { setClerkClientStore } from '$lib/stores/clerk.svelte';

export const setupFrontendClerk = (
	clerkBackendStatus: 'signed-in' | 'signed-out' | 'handshake',
	convexClient: ConvexClient,
	usersContext: UsersContext,
	organizationsContext: OrganizationsContext
) => {
	if (browser) {
		import('@clerk/clerk-js').then(({ Clerk }) => {
			const clerk = new Clerk(PUBLIC_CLERK_PUBLISHABLE_KEY);
			clerk.load({ signInUrl: '/auth/sign-in', signUpUrl: '/auth/sign-up' }).then(() => {
				if (clerkBackendStatus === 'handshake') {
					console.log('--------- handle "handshake" from clerkBackendStatus');
					invalidateAll().then(() => {
						setupClerk(clerk, convexClient, usersContext, organizationsContext);
					});
				} else {
					setupClerk(clerk, convexClient, usersContext, organizationsContext);
				}
			});
		});
	}
};

function setupClerk(
	clerk: Clerk,
	convexClient: ConvexClient,
	usersContext: UsersContext,
	organizationsContext: OrganizationsContext
) {
	setClerkClientStore(clerk);

	let currentUserId: string | undefined = clerk.user?.id;
	let currentOrgId: string | undefined = clerk.organization?.id;
	let shouldInvalidate = false;

	clerk.addListener((emission) => {
		if (emission.user) {
			setUser(emission.user, usersContext, convexClient);
		}
		if (clerk.user && emission.organization) {
			setOrganization(emission.organization, clerk.user.id, organizationsContext, convexClient);
		}

		if (currentUserId !== emission.user?.id) {
			shouldInvalidate = true;
			currentUserId = emission.user?.id;
		}

		if (currentOrgId !== emission.organization?.id) {
			shouldInvalidate = true;
			currentOrgId = emission.organization?.id;
		}

		if (shouldInvalidate) {
			setAppLoading(true);
			shouldInvalidate = false;
			invalidateAll().finally(() => setAppLoading(false));
		}
	});
}
