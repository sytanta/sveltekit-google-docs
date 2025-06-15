<script lang="ts">
	import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from '@lucide/svelte';

	import editorStore from '$lib/stores/editor.svelte';
	import { cn } from '$lib/utils';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';

	const alignments = [
		{ label: 'Align Left', value: 'left', icon: AlignLeftIcon },
		{ label: 'Align Center', value: 'center', icon: AlignCenterIcon },
		{ label: 'Align Right', value: 'right', icon: AlignRightIcon },
		{ label: 'Align Justify', value: 'justify', icon: AlignJustifyIcon }
	];

	const editor = $derived(editorStore.store.editor);
	let selectedAlign = $state(alignments[0]);

	$effect(() => {
		editor?.on('transaction', () => {
			const currentAlignment = alignments.find(({ value }) =>
				editor?.isActive({ textAlign: value })
			);

			if (currentAlignment) selectedAlign = currentAlignment;
			else selectedAlign = alignments[0];
		});
	});
</script>

<DropdownMenu>
	<DropdownMenuTrigger
		class={cn(
			'flex h-7 min-w-7 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm hover:bg-neutral-200/80',
			selectedAlign.value !== 'left' ? 'bg-neutral-200/80' : ''
		)}
	>
		<selectedAlign.icon class="size-4" />
	</DropdownMenuTrigger>
	<DropdownMenuContent class="flex flex-col gap-y-1 p-1">
		{#each alignments as { value, label, icon: Icon } (value)}
			<button
				onclick={() =>
					value === 'left'
						? editor?.chain().focus().unsetTextAlign().run()
						: editor?.chain().focus().setTextAlign(value).run()}
				class={cn(
					'flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-neutral-200/80',
					selectedAlign.value === value && 'bg-neutral-200/80'
				)}
			>
				<Icon class="size-4" />
				<span class="text-sm">{label}</span>
			</button>
		{/each}
	</DropdownMenuContent>
</DropdownMenu>
