<script lang="ts">
	import { ListIcon, ListOrderedIcon } from '@lucide/svelte';

	import editorStore from '$lib/stores/editor.svelte';
	import { cn } from '$lib/utils';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';

	const lists = [
		{
			label: 'Bullet List',
			icon: ListIcon,
			onClick: () => editor?.chain().focus().toggleBulletList().run()
		},
		{
			label: 'Ordered List',
			icon: ListOrderedIcon,
			onClick: () => editor?.chain().focus().toggleOrderedList().run()
		}
	];

	const editor = $derived(editorStore.store.editor);
	let selectedList = $state<(typeof lists)[number] | null>(lists[0]);

	$effect(() => {
		editor?.on('transaction', () => {
			const isBulletList = editor?.isActive('bulletList');
			const isOrderedList = editor?.isActive('orderedList');

			selectedList = isBulletList ? lists[0] : isOrderedList ? lists[1] : null;
		});
	});
</script>

<DropdownMenu>
	<DropdownMenuTrigger
		class={cn(
			'flex h-7 min-w-7 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm hover:bg-neutral-200/80',
			selectedList ? 'bg-neutral-200/80' : ''
		)}
	>
		{#if selectedList}
			<selectedList.icon class="size-4" />
		{:else}
			<ListIcon class="size-4" />
		{/if}
	</DropdownMenuTrigger>
	<DropdownMenuContent class="flex flex-col gap-y-1 p-1">
		{#each lists as { label, icon: Icon, onClick } (label)}
			<button
				onclick={onClick}
				class={cn(
					'flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-neutral-200/80',
					selectedList?.label === label && 'bg-neutral-200/80'
				)}
			>
				<Icon class="size-4" />
				<span class="text-sm">{label}</span>
			</button>
		{/each}
	</DropdownMenuContent>
</DropdownMenu>
