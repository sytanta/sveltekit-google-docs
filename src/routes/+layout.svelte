<script lang="ts">
	import { useConvexClient } from 'convex-svelte';

	import { createUsersContext } from '$lib/contexts/user';
	import { createGroupsContext } from '$lib/contexts/organization';
	import { clerkClientStore } from '$lib/stores/clerk.svelte';
	import { setupFrontendClerk } from '$lib/utils/clerk/client';
	import { setupFrontendConvex } from '$lib/utils/convex/client';
	import { appState } from '$lib/stores/appState.svelte';
	import { cn } from '$lib/utils';
	import { Toaster } from '$lib/components/ui/sonner';
	import FullscreenLoader from '$lib/components/FullscreenLoader.svelte';
	import '../app.css';

	let { data, children } = $props();

	const usersContext = createUsersContext();
	const groupsContext = createGroupsContext();

	setupFrontendConvex();
	const convexClient = useConvexClient();

	setupFrontendClerk(data.clerkBackendStatus, convexClient, usersContext, groupsContext);

	const isLoading = $derived(appState.loading || !clerkClientStore.clerk?.loaded);
</script>

<div class={cn('transition-opacity duration-200', isLoading ? 'opacity-0' : 'opacity-100')}>
	{@render children()}
</div>

<Toaster />

{#if isLoading}
	<FullscreenLoader label="Loading app..." />
{/if}
