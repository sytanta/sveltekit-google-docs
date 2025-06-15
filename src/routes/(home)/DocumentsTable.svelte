<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { LoaderIcon } from '@lucide/svelte';

	import { page } from '$app/state';
	import { clerkClientStore } from '$lib/stores/clerk.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import type { Doc } from '../../convex/_generated/dataModel';
	import DocumentRow from './DocumentRow.svelte';
	import type { PageServerData } from './$types';
	import { api } from '../../convex/_generated/api';

	let {
		documents,
		continueCursor,
		isDone
	}: {
		documents: Doc<'documents'>[];
		continueCursor: PageServerData['documents']['continueCursor'];
		isDone: PageServerData['documents']['isDone'];
	} = $props();

	const convexClient = useConvexClient();
	const clerkClient = $derived(clerkClientStore.clerk);

	let loading = $state(false);

	const loadMore = () => {
		if (loading || isDone || !clerkClient?.user) return;
		loading = true;

		convexClient
			.query(api.documents.listByUser, {
				user_external_id: clerkClient?.user.id,
				organization_external_id: clerkClient?.organization?.id,
				search: page.url.searchParams.get('search') || '',
				paginationOpts: {
					numItems: 5,
					cursor: continueCursor
				}
			})
			.then(async (res) => {
				continueCursor = res.continueCursor;
				isDone = res.isDone;

				documents = [...documents, ...res.page];
			})
			.finally(() => {
				loading = false;
			});
	};
</script>

<div class="mx-auto flex max-w-screen-xl flex-col gap-5 px-5 py-6 md:px-16">
	{#if clerkClient?.user}
		<Table>
			<TableHeader>
				<TableRow class="border-none hover:bg-transparent">
					<TableHead>Name</TableHead>
					<TableHead>&nbsp;</TableHead>
					<TableHead class="hidden md:table-cell">Shared</TableHead>
					<TableHead class="hidden md:table-cell">Created at</TableHead>
				</TableRow>
			</TableHeader>

			{#if documents?.length}
				<TableBody>
					{#each documents as document (document._id)}
						<DocumentRow {document} />
					{/each}
				</TableBody>
			{:else}
				<TableBody>
					<TableRow class="hover:bg-transparent">
						<TableCell colspan={4} class="text-muted-foreground h-24 text-center"
							>No documents found</TableCell
						>
					</TableRow>
				</TableBody>
			{/if}
		</Table>

		<div class="flex items-center justify-center">
			<Button
				variant="ghost"
				size="sm"
				disabled={isDone || loading}
				onclick={() => loadMore()}
				class="w-24"
			>
				{#if !isDone}
					{#if loading}
						<LoaderIcon class="siz-4 animate-spin" />
					{:else}
						Load more
					{/if}
				{:else if documents.length}
					End of results
				{/if}
			</Button>
		</div>
	{:else}
		<p class="text-muted-foreground py-18 text-center">
			Select any template to start creating a document.<br />
			If you would like to save your documents for later editing, please sign up.
		</p>
	{/if}
</div>
