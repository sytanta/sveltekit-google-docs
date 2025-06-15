<script lang="ts">
	import { ListCollapseIcon } from '@lucide/svelte';

	import editorStore from '$lib/stores/editor.svelte';
	import { cn } from '$lib/utils';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';

	const lineHeights = [
		{ label: 'Default', value: 'normal' },
		{ label: 'Single', value: '1' },
		{ label: '1.15', value: '1.15' },
		{ label: '1.5', value: '1.5' },
		{ label: 'Double', value: '2' }
	];

	const editor = $derived(editorStore.store.editor);
	let selectedLineHeight = $state(lineHeights[0]);

	$effect(() => {
		editor?.on('transaction', () => {
			const currentLineHeightValue = editor?.getAttributes('paragraph').lineHeight;
			const currentLineHeight =
				lineHeights.find(({ value }) => value === currentLineHeightValue) || lineHeights[0];

			selectedLineHeight = currentLineHeight;
		});
	});
</script>

<DropdownMenu>
	<DropdownMenuTrigger
		class={cn(
			'flex h-7 min-w-7 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm hover:bg-neutral-200/80',
			selectedLineHeight.value !== 'normal' ? 'bg-neutral-200/80' : ''
		)}
	>
		<ListCollapseIcon class="size-4" />
	</DropdownMenuTrigger>
	<DropdownMenuContent class="flex flex-col gap-y-1 p-1">
		{#each lineHeights as { value, label } (value)}
			<button
				onclick={() =>
					value === 'normal'
						? editor?.chain().focus().unsetLineHeight().run()
						: editor?.chain().focus().setLineHeight(value).run()}
				class={cn(
					'flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-neutral-200/80',
					selectedLineHeight.value === value && 'bg-neutral-200/80'
				)}
			>
				<span class="text-sm">{label}</span>
			</button>
		{/each}
	</DropdownMenuContent>
</DropdownMenu>
