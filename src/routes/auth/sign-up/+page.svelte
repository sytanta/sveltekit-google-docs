<script lang="ts">
	import { browser } from '$app/environment';
	import { clerkClientStore } from '$lib/stores/clerk.svelte';

	const clerkClient = $derived(clerkClientStore.clerk);

	$effect(() => {
		if (browser) {
			const signUpElm: HTMLDivElement | null = document.getElementById('sign-up') as HTMLDivElement;
			if (signUpElm) clerkClient?.mountSignUp(signUpElm);
		}
	});
</script>

<div class="flex min-h-screen flex-col items-center justify-center">
	<div id="sign-up"></div>
</div>
