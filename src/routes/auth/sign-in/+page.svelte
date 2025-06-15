<script lang="ts">
	import { browser } from '$app/environment';
	import { clerkClientStore } from '$lib/stores/clerk.svelte';

	const clerkClient = $derived(clerkClientStore.clerk);

	$effect(() => {
		if (browser) {
			const signInElm: HTMLDivElement | null = document.getElementById('sign-in') as HTMLDivElement;
			if (signInElm) clerkClient?.mountSignIn(signInElm);
		}
	});
</script>

<div class="flex min-h-screen flex-col items-center justify-center">
	<div id="sign-in"></div>
</div>
