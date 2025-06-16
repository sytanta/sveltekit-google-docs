<script lang="ts">
	import editorStore from '$lib/stores/editor.svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';

	const colors = [
		'#ffffff',
		'#5f2cdd',
		'#752c53',
		'#3b8456',
		'#a0563d',
		'#5f5850',
		'#c3c3c6',
		'#edf145',
		'#da3855',
		'#eda541',
		'#f5ea5a',
		'#75b85b',
		'#66a5d7',
		'#817799',
		'#e17ea5',
		'#f4cdaf'
	];

	const editor = $derived(editorStore.store.editor);
	let selectedColor = $state('#000000');

	$effect(() => {
		editor?.on('transaction', () => {
			selectedColor = editor?.getAttributes('textStyle').color || '#000000';
		});
	});

	const selectColor = (
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement;
		}
	) => {
		const { color } = e.currentTarget.dataset;
		if (color) editor?.chain().focus().setColor(color).run();
	};
</script>

<DropdownMenu>
	<DropdownMenuTrigger
		class="flex h-7 min-w-7 shrink-0 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm hover:bg-neutral-200/80"
	>
		<span class="text-xs">A</span>
		<div class="h-0.5 w-full" style:background-color={selectedColor}></div>
	</DropdownMenuTrigger>
	<DropdownMenuContent class="p-2.5">
		<div class="grid grid-cols-8 gap-1.5">
			{#each colors as color (color)}
				<button
					onclick={selectColor}
					class="aspect-square w-7 cursor-pointer rounded-sm border"
					data-color={color}
					style:background-color={color}
					style:border-color={color === '#ffffff' ? '#000000' : color}
					aria-label={color}
				></button>
			{/each}
		</div>
	</DropdownMenuContent>
</DropdownMenu>
