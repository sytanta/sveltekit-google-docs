<script lang="ts">
	import { ChevronDownIcon } from '@lucide/svelte';

	import editorStore from '$lib/stores/editor.svelte';
	import { cn } from '$lib/utils';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';

	const fonts = [
		{ label: 'Arial', value: 'Arial' },
		{ label: 'Times New Roman', value: 'Times New Roman' },
		{ label: 'Courier New', value: 'Courier New' },
		{ label: 'Georgia', value: 'Georgia' },
		{ label: 'Vernada', value: 'Vernada' }
	];

	const editor = $derived(editorStore.store.editor);
	let selectedFont = $state(fonts[0].label);

	$effect(() => {
		editor?.on('transaction', () => {
			selectedFont = editor?.getAttributes('textStyle').fontFamily || fonts[0].label;
		});
	});
</script>

<DropdownMenu>
	<DropdownMenuTrigger
		class="flex h-7 w-[120px] shrink-0 items-center justify-between overflow-hidden rounded-sm px-1.5 text-sm hover:bg-neutral-200/80"
	>
		<span class="truncate">
			{selectedFont}
		</span>
		<ChevronDownIcon class="ml-2 size-4 shrink-0" />
	</DropdownMenuTrigger>
	<DropdownMenuContent class="flex flex-col gap-y-1 p-1">
		{#each fonts as { label, value } (value)}
			<button
				onclick={() => {
					selectedFont = label;
					editor?.chain().focus().setFontFamily(value).run();
				}}
				class={cn(
					'flex items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-neutral-200/80',
					selectedFont === value && 'bg-neutral-200/80'
				)}
				style:font-family={value}
			>
				<span class="text-sm">{label}</span>
			</button>
		{/each}
	</DropdownMenuContent>
</DropdownMenu>
