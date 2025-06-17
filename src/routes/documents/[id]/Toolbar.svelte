<script lang="ts">
	import type { Component } from 'svelte';
	import {
		BoldIcon,
		ItalicIcon,
		ListTodoIcon,
		// MessageSquarePlusIcon,
		PrinterIcon,
		Redo2Icon,
		RemoveFormattingIcon,
		SpellCheckIcon,
		Underline,
		Undo2Icon,
		type IconProps
	} from '@lucide/svelte';

	import editorStore from '$lib/stores/editor.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import ToolbarButton from './ToolbarButton.svelte';
	import FontFamilyButton from './FontFamilyButton.svelte';
	import HeadingLevelButton from './HeadingLevelButton.svelte';
	import TextColorButton from './TextColorButton.svelte';
	import HighlightColorButton from './HighlightColorButton.svelte';
	import LinkButton from './LinkButton.svelte';
	import ImageButton from './ImageButton.svelte';
	import AlignButton from './AlignButton.svelte';
	import ListButton from './ListButton.svelte';
	import FontSizeButton from './FontSizeButton.svelte';
	import LineHeightButton from './LineHeightButton.svelte';

	const editor = $derived(editorStore.store.editor);
	const isSpellcheckActive = $state<{ value: boolean | undefined }>({ value: true });
	const isBoldActive = $state<{ value: boolean | undefined }>({ value: undefined });
	const isItalicActive = $state<{ value: boolean | undefined }>({ value: undefined });
	const isUnderlineActive = $state<{ value: boolean | undefined }>({ value: undefined });
	const isTaskListActive = $state<{ value: boolean | undefined }>({ value: undefined });

	const updateActive = () => {
		const spellcheck = editor?.view.dom.getAttribute('spellcheck');
		if (spellcheck == null) editor?.view.dom.setAttribute('spellcheck', 'true');
		isSpellcheckActive.value = spellcheck == null ? true : spellcheck === 'true';

		isBoldActive.value = editor?.isActive('bold');
		isItalicActive.value = editor?.isActive('italic');
		isUnderlineActive.value = editor?.isActive('underline');
		isTaskListActive.value = editor?.isActive('taskList');
	};

	$effect(() => {
		editor?.on('transaction', updateActive);
	});

	const sections: {
		label: string;
		icon: Component<IconProps, {}, ''>;
		isActive?: { value: boolean | undefined };
		onclick?: () => void;
	}[][] = [
		[
			{
				label: 'Undo',
				icon: Undo2Icon,
				onclick: () => {
					editor?.chain().focus().undo().run();
				}
			},
			{
				label: 'Redo',
				icon: Redo2Icon,
				onclick: () => {
					editor?.chain().focus().redo().run();
				}
			},
			{
				label: 'Print',
				icon: PrinterIcon,
				onclick: () => window?.print()
			},
			{
				label: 'Spell Check',
				icon: SpellCheckIcon,
				isActive: isSpellcheckActive,
				onclick: () => {
					const current = editor?.view.dom.getAttribute('spellcheck');
					const newVal = current === 'true' ? 'false' : 'true';

					editor?.view.dom.setAttribute('spellcheck', newVal);
					isSpellcheckActive.value = newVal === 'true';
					editor?.view.focus();
				}
			}
		],
		[
			{
				label: 'Bold',
				icon: BoldIcon,
				isActive: isBoldActive,
				onclick: () => {
					editor?.chain().focus().toggleBold().run();
					updateActive();
				}
			},
			{
				label: 'Italic',
				icon: ItalicIcon,
				isActive: isItalicActive,
				onclick: () => {
					editor?.chain().focus().toggleItalic().run();
					updateActive();
				}
			},
			{
				label: 'Underline',
				icon: Underline,
				isActive: isUnderlineActive,
				onclick: () => {
					editor?.chain().focus().toggleUnderline().run();
					updateActive();
				}
			}
		],
		[
			// {
			// 	label: 'Comment',
			// 	icon: MessageSquarePlusIcon,
			// 	isActive: { value: false },
			// 	onclick: () => {}
			// },
			{
				label: 'List Todo',
				icon: ListTodoIcon,
				isActive: isTaskListActive,
				onclick: () => {
					editor?.chain().focus().toggleTaskList().run();
					updateActive();
				}
			},
			{
				label: 'Remove Formatting',
				icon: RemoveFormattingIcon,
				onclick: () => {
					editor?.chain().focus().unsetAllMarks().run();
					updateActive();
				}
			}
		]
	];
</script>

<div
	class="flex min-h-[40px] items-center gap-x-0.5 overflow-x-auto rounded-[24px] bg-[#f1f4f9] px-2.5 py-0.5"
>
	{#each sections[0] as { label, icon: Icon, isActive, onclick } (label)}
		<ToolbarButton icon={Icon} isActive={isActive?.value} {onclick} />
	{/each}
	<Separator orientation="vertical" class="h-6! bg-neutral-300" />

	<FontFamilyButton />
	<Separator orientation="vertical" class="h-6! bg-neutral-300" />

	<HeadingLevelButton />
	<Separator orientation="vertical" class="h-6! bg-neutral-300" />

	<FontSizeButton />
	<Separator orientation="vertical" class="h-6! bg-neutral-300" />

	{#each sections[1] as { label, icon: Icon, isActive, onclick } (label)}
		<ToolbarButton icon={Icon} isActive={isActive?.value} {onclick} />
	{/each}
	<Separator orientation="vertical" class="h-6! bg-neutral-300" />

	<TextColorButton />
	<HighlightColorButton />
	<Separator orientation="vertical" class="h-6! bg-neutral-300" />

	<LinkButton />
	<ImageButton />
	<AlignButton />
	<LineHeightButton />
	<ListButton />
	{#each sections[2] as { label, icon: Icon, isActive, onclick } (label)}
		<ToolbarButton icon={Icon} isActive={isActive?.value} {onclick} />
	{/each}
</div>
