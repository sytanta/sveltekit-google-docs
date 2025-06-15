<script lang="ts">
	let { children } = $props();
</script>

<div class="fixed top-0 right-0 left-0 z-10 h-16 bg-white p-4">
	<nav class="flex size-full items-center justify-between">
		<div class="flex shrink-0 items-center gap-3 pr-6">
			<a href="/"><img src="/logo.svg" alt="Logo" width="36px" height="36px" /></a>
			<h3 class="text-xl">Docs</h3>
		</div>
	</nav>
</div>
{@render children()}
