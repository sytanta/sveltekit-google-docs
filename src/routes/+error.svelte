<script lang="ts">
	import { AlertTriangleIcon, LoaderIcon } from '@lucide/svelte';

	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';

	let retrying = $state(false);

	const tryAgain = () => {
		retrying = true;
		invalidateAll().finally(() => (retrying = false));
	};
</script>

<svelte:head>
	<title>SvelteKit Google Docs</title>
	<meta name="description" content="Google Docs clone with SvelteKit" />
	<meta name="author" content="Ta Sy Tan" />
	<meta name="referrer" content="no-referrer" />
	<meta name="format-detection" content="telephone=no" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center space-y-6">
	<div class="space-y-4 text-center">
		<div class="flex justify-center">
			<div class="rounded-full bg-rose-100 p-3">
				<AlertTriangleIcon class="size-10 text-rose-600" />
			</div>
		</div>

		<div class="space-y-2">
			<h2 class="text-xl font-semibold text-gray-900">Something went wrong</h2>
			{#if page?.error?.message}
				<p>{page.error.message}</p>
			{/if}
		</div>
	</div>

	<div class="flex items-center gap-x-3">
		<Button disabled={retrying} onclick={tryAgain} class="w-28 px-6 font-medium">
			{#if retrying}
				<LoaderIcon class="size-4 animate-spin" />
			{:else}
				Try again
			{/if}
		</Button>
		<a href="/">
			<Button class="font-medium" variant="ghost">Go back</Button>
		</a>
	</div>
</div>
