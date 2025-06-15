<script lang="ts">
	import { MinusIcon, PlusIcon } from '@lucide/svelte';

	import editorStore from '$lib/stores/editor.svelte';

	const defaultFontSize = 16;
	const maxFontSize = 200;

	const editor = $derived(editorStore.store.editor);
	let currentFontSize = $state(String(defaultFontSize));
	let inputFontSize = $state(String(defaultFontSize));
	let isEditing = $state(false);

	$effect(() => {
		editor?.on('transaction', () => {
			currentFontSize =
				editor?.getAttributes('textStyle').fontSize?.replace('px', '') || String(defaultFontSize);
		});
	});

	const startEditing = () => {
		inputFontSize = currentFontSize;
		isEditing = true;
	};

	// When clicking on the button, the editor blurs and nothing else happens
	// this will focus the input
	const handleFocus = (e: HTMLInputElement) => {
		e.focus();
	};

	const updateFontSize = (newSize: string) => {
		let size = parseInt(newSize);
		if (isNaN(size) || size <= 0 || size > maxFontSize) size = Number(currentFontSize);

		if (size === defaultFontSize) editor?.chain().focus().unsetFontSize().run();
		else editor?.chain().focus().setFontSize(`${size}px`).run();

		isEditing = false;
	};

	const handleBur = () => {
		updateFontSize(inputFontSize);
		editor?.commands.focus();
	};

	const handleKeydown = (
		e: KeyboardEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		if (e.key !== 'Enter') return;
		e.preventDefault();

		updateFontSize(inputFontSize);
		editor?.commands.focus();
	};

	const increment = () => {
		updateFontSize(String(parseInt(currentFontSize) + 1));
	};
	const decrement = () => {
		updateFontSize(String(parseInt(currentFontSize) - 1));
	};
</script>

<div class="flex items-center gap-x-0.5">
	<button
		onclick={decrement}
		class="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-sm hover:bg-neutral-200/80"
	>
		<MinusIcon class="size-4" />
	</button>
	{#if isEditing}
		<input
			bind:value={inputFontSize}
			use:handleFocus
			onblur={handleBur}
			onkeydown={handleKeydown}
			class="h-7 w-11 shrink-0 rounded-sm border border-neutral-400 bg-transparent px-2 text-center text-sm focus:ring-0 focus:outline-none"
		/>
	{:else}
		<button
			onclick={startEditing}
			class="flex h-7 w-11 shrink-0 cursor-text items-center justify-center rounded-sm border border-neutral-400 bg-transparent px-2 text-sm"
			>{currentFontSize}</button
		>
	{/if}
	<button
		onclick={increment}
		class="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-sm hover:bg-neutral-200/80"
	>
		<PlusIcon class="size-4" />
	</button>
</div>
