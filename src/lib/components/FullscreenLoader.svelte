<script lang="ts">
	import { LoaderIcon } from '@lucide/svelte';

	const { label }: { label?: string } = $props();
</script>

<div
	class="fixed top-0 left-0 z-50 flex min-h-screen min-w-screen flex-col items-center justify-center gap-2 bg-white"
>
	<LoaderIcon class="text-muted-foreground relative z-10 size-6 animate-spin" />
	{#if label}
		<p class="text-muted-foreground text-sm">{label}</p>
	{/if}
</div>
