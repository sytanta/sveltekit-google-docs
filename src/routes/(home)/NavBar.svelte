<script lang="ts">
	import NavButtons from '$lib/components/NavButtons.svelte';
	import Search from './Search.svelte';
</script>

<nav class="flex size-full items-center justify-between">
	<div class="flex shrink-0 items-center gap-3 pr-2 md:pr-6">
		<a href="/" class="focus:outline-none"
			><img src="/logo.svg" alt="Logo" width="36px" height="36px" /></a
		>
		<h3 class="text-xl">Docs</h3>
	</div>
	<Search />
	<NavButtons />
</nav>
