<script lang="ts">
	import { Link2Icon } from '@lucide/svelte';

	import editorStore from '$lib/stores/editor.svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	const editor = $derived(editorStore.store.editor);
	let href = $state('');

	$effect(() => {
		editor?.on('transaction', () => {
			href = editor?.getAttributes('link').href || '';
		});
	});

	const applyLink = () => {
		editor
			?.chain()
			.focus()
			.extendMarkRange('link')
			.setLink({
				href
			})
			.run();
		href = '';
	};
</script>

<DropdownMenu>
	<DropdownMenuTrigger
		class="flex h-7 min-w-7 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm hover:bg-neutral-200/80"
	>
		<Link2Icon class="size-4" />
	</DropdownMenuTrigger>
	<DropdownMenuContent class="flex items-center gap-x-2 p-2.5">
		<form class="flex items-center gap-x-2 p-2.5">
			<Input
				type="url"
				value={href}
				placeholder="https://example.com"
				onchange={(e) => (href = e.target?.value || '')}
			/>
			<Button type="button" onclick={() => applyLink()} class="cursor-pointer">Apply</Button>
		</form>
	</DropdownMenuContent>
</DropdownMenu>
