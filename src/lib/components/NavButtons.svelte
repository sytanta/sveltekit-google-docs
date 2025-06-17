<script lang="ts">
	import { LogInIcon } from '@lucide/svelte';

	import { browser } from '$app/environment';
	import { clerkClientStore } from '$lib/stores/clerk.svelte';
	import Avatars from './Avatars.svelte';
	import Inbox from './Inbox.svelte';

	const {
		allowSwitchingOrganization = true,
		showNotifications,
		showCollaborators
	}: {
		allowSwitchingOrganization?: boolean;
		showNotifications?: boolean;
		showCollaborators?: boolean;
	} = $props();

	const clerkClient = $derived(clerkClientStore.clerk);
	const isLoaded = $derived(clerkClient?.loaded);
	const isSignedIn = $derived(clerkClient?.isSignedIn);

	$effect(() => {
		if (browser && clerkClient) {
			const organizationBtnElm: HTMLDivElement | null = document.getElementById(
				'organization-switcher'
			) as HTMLDivElement;
			const userBtnElm: HTMLDivElement | null = document.getElementById(
				'user-button'
			) as HTMLDivElement;

			if (organizationBtnElm) clerkClient?.mountOrganizationSwitcher(organizationBtnElm);
			if (userBtnElm) clerkClient?.mountUserButton(userBtnElm);
		}
	});
</script>

{#if isLoaded && isSignedIn}
	<div class="flex items-center gap-2 md:ml-6 md:gap-3">
		{#if showCollaborators}
			<Avatars />
		{/if}
		{#if showNotifications}
			<Inbox />
		{/if}
		{#if allowSwitchingOrganization}
			<div id="organization-switcher"></div>
		{/if}
		<div id="user-button"></div>
	</div>
{/if}

{#if isLoaded && !isSignedIn}
	<a
		href="/auth/sign-in"
		title="Sign in"
		class="ml-2 flex aspect-square w-7 items-center justify-center rounded-full bg-neutral-200 text-neutral-800 hover:bg-neutral-200/80 md:ml-6"
	>
		<LogInIcon class="size-4" />
	</a>
{/if}
