<script lang="ts">
	import { ExternalLinkIcon, FilePenIcon, MoreVerticalIcon, TrashIcon } from '@lucide/svelte';

	import { invalidate } from '$app/navigation';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import RemoveDocumentDialog from '$lib/components/RemoveDocumentDialog.svelte';
	import RenameDocumentDialog from '$lib/components/RenameDocumentDialog.svelte';
	import type { Id } from '../../convex/_generated/dataModel';

	const {
		documentId,
		title,
		onNewTab
	}: {
		documentId: Id<'documents'>;
		title: string;
		onNewTab: () => void;
	} = $props();
</script>

<DropdownMenu>
	<DropdownMenuTrigger
		class="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
	>
		<MoreVerticalIcon onclick={(e) => console.log('eee')} class="size-4" />
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<RenameDocumentDialog {documentId} currentTitle={title} onRename={() => invalidate('home')}>
			<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
				<FilePenIcon class="size-4" />
				Rename
			</DropdownMenuItem>
		</RenameDocumentDialog>

		<RemoveDocumentDialog {documentId} onDelete={() => invalidate('home')}>
			<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
				<TrashIcon class="size-4" />
				Delete
			</DropdownMenuItem>
		</RemoveDocumentDialog>

		<DropdownMenuItem onSelect={onNewTab}>
			<ExternalLinkIcon class="size-4" />
			Open in a new tab
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
