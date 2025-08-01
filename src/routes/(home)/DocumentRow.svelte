<script lang="ts">
	import { format } from 'date-fns';
	import { Building2Icon, CircleUserIcon, LoaderIcon } from '@lucide/svelte';

	import { goto } from '$app/navigation';
	import { TableCell, TableRow } from '$lib/components/ui/table';
	import type { Doc } from '../../convex/_generated/dataModel';
	import DocumentMenu from './DocumentMenu.svelte';

	const { document }: { document: Doc<'documents'> } = $props();

	let loadingDoc = $state(false);

	const openDocument = () => {
		if (loadingDoc) return;
		loadingDoc = true;

		goto(`/documents/${document._id}`).finally(() => (loadingDoc = false));
	};

	const onDocumentInANewTab = () => {
		window.open(`/documents/${document._id}`, '_blank');
	};
</script>

<TableRow class="cursor-pointer" onclick={() => openDocument()}>
	<TableCell>
		{#if loadingDoc}
			<div class="flex size-6 items-center justify-center">
				<LoaderIcon class="size-4 animate-spin text-blue-500" />
			</div>
		{:else}
			<svg
				stroke="currentColor"
				stroke-width="0"
				role="img"
				viewBox="0 0 24 24"
				class="size-6 fill-blue-500"
				xmlns="http://www.w3.org/2000/svg"
				><path
					d="M14.727 6.727H14V0H4.91c-.905 0-1.637.732-1.637 1.636v20.728c0 .904.732 1.636 1.636 1.636h14.182c.904 0 1.636-.732 1.636-1.636V6.727h-6zm-.545 10.455H7.09v-1.364h7.09v1.364zm2.727-3.273H7.091v-1.364h9.818v1.364zm0-3.273H7.091V9.273h9.818v1.363zM14.727 6h6l-6-6v6z"
				></path></svg
			>
		{/if}
	</TableCell>
	<TableCell>
		<p class="w-[45vw] truncate md:w-[40vw]">{document.title}</p>
	</TableCell>
	<TableCell class="text-muted-foreground hidden items-center gap-2 md:flex">
		{#if document.organization_id}
			<Building2Icon class="size-4 shrink-0" />
		{:else}
			<CircleUserIcon class="size-4 shrink-0" />
		{/if}
		{document.organization_id ? 'Organization' : 'Personal'}
	</TableCell>
	<TableCell class="text-muted-foreground hidden md:table-cell">
		{format(new Date(document._creationTime), 'MMM dd, yyyy')}
	</TableCell>
	<TableCell class="flex justify-end">
		<DocumentMenu documentId={document._id} title={document.title} onNewTab={onDocumentInANewTab} />
	</TableCell>
</TableRow>
