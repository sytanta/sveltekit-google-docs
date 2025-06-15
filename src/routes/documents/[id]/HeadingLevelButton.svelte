<script lang="ts">
	import { type Level } from '@tiptap/extension-heading';
	import { ChevronDownIcon } from '@lucide/svelte';

	import editorStore from '$lib/stores/editor.svelte';
	import { cn } from '$lib/utils';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { onDestroy } from 'svelte';

	const headings = [
		{ label: 'Normal text', value: 0, fontSize: '16px' },
		{ label: 'Heading 1', value: 1, fontSize: '32px' },
		{ label: 'Heading 2', value: 2, fontSize: '24px' },
		{ label: 'Heading 3', value: 3, fontSize: '20px' },
		{ label: 'Heading 4', value: 4, fontSize: '18px' },
		{ label: 'Heading 5', value: 5, fontSize: '16px' }
	];

	const editor = $derived(editorStore.store.editor);
	let selectedHeading = $state(headings[0].label);

	const onTransaction = () => {
		const currentHeading = editor?.getAttributes('heading');
		if (currentHeading?.level) selectedHeading = `Heading ${currentHeading.level}`;
		else selectedHeading = headings[0].label;
	};

	$effect(() => {
		editor?.on('transaction', onTransaction);
	});

	onDestroy(() => editor?.off('transaction', onTransaction));
</script>

<DropdownMenu>
	<DropdownMenuTrigger
		class="flex h-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm hover:bg-neutral-200/80"
	>
		<span class="truncate">
			{selectedHeading}
		</span>
		<ChevronDownIcon class="ml-2 size-4 shrink-0" />
	</DropdownMenuTrigger>
	<DropdownMenuContent class="flex flex-col gap-y-1 p-1">
		{#each headings as { label, value, fontSize } (value)}
			<button
				onclick={() => {
					if (value === 0) editor?.chain().focus().setParagraph().run();
					else
						editor
							?.chain()
							.focus()
							.setHeading({ level: value as Level })
							.run();
				}}
				class={cn(
					'flex items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-neutral-200/80',
					selectedHeading === label && 'bg-neutral-200/80'
				)}
				style:font-size={fontSize}
			>
				{label}
			</button>
		{/each}
	</DropdownMenuContent>
</DropdownMenu>
