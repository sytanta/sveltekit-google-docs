<script lang="ts">
	import { ImageIcon, SearchIcon, UploadIcon } from '@lucide/svelte';

	import editorStore from '$lib/stores/editor.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';

	const editor = $derived(editorStore.store.editor);
	let dialogOpen = $state(false);
	let imageUrl = $state('');

	$effect(() => {
		editor?.on('transaction', () => {
			imageUrl = editor?.getAttributes('link').href || '';
		});
	});

	const applyImageUrl = () => {
		editor
			?.chain()
			.focus()
			.setImage({
				src: imageUrl
			})
			.run();
	};

	const onUpload = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';

		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement)?.files?.[0];
			if (!file) return;

			imageUrl = URL.createObjectURL(file);
			applyImageUrl();
		};

		input.click();
	};

	const handleImageUrlSubmit = () => {
		if (!imageUrl) return;

		applyImageUrl();
		imageUrl = '';
		dialogOpen = false;
	};
</script>

<DropdownMenu>
	<DropdownMenuTrigger
		class="flex h-7 min-w-7 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm hover:bg-neutral-200/80"
	>
		<ImageIcon class="size-4" />
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<DropdownMenuItem onclick={onUpload}>
			<UploadIcon class="mr-2 size-4" />
			Upload
		</DropdownMenuItem>
		<DropdownMenuItem onclick={() => (dialogOpen = true)}>
			<SearchIcon class="mr-2 size-4" />
			Paste image url
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>

<Dialog open={dialogOpen} onOpenChange={(open) => (dialogOpen = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Insert image URL</DialogTitle>
		</DialogHeader>
		<Input
			bind:value={imageUrl}
			placeholder="Image URL"
			onkeydown={(e) => {
				if (e.key === 'Enter') handleImageUrlSubmit();
			}}
		/>
		<DialogFooter>
			<Button onclick={handleImageUrlSubmit}>Insert</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
