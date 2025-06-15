<script lang="ts">
	import type { Component } from 'svelte';
	import { type IconProps } from '@lucide/svelte';

	import { cn } from '$lib/utils';

	const {
		icon: Icon,
		isActive = false,
		onclick
	}: { icon: Component<IconProps, {}, ''>; isActive?: boolean; onclick?: () => void } = $props();
</script>

<button
	{onclick}
	class={cn(
		'flex h-7 min-w-7 cursor-pointer items-center justify-center rounded-sm text-sm hover:bg-neutral-200/80',
		isActive && 'bg-neutral-200/80'
	)}
>
	<Icon class="size-4" />
</button>
