<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { toast } from 'svelte-sonner';
	import { LoaderIcon } from '@lucide/svelte';

	import { clerkClientStore } from '$lib/stores/clerk.svelte';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogTrigger
	} from './ui/alert-dialog';
	import type { Id } from '../../convex/_generated/dataModel';
	import { api } from '../../convex/_generated/api';

	const {
		documentId,
		onDelete,
		children
	}: { documentId: Id<'documents'>; onDelete?: () => Promise<void> | void; children: Snippet } =
		$props();

	const convexClient = useConvexClient();
	const clerkClient = $derived(clerkClientStore.clerk);
	let deleting = $state(false);

	const deleteDoc = () => {
		if (deleting || !clerkClient?.user) return;
		deleting = true;

		convexClient
			.mutation(api.documents.removeById, {
				id: documentId,
				user_external_id: clerkClient?.user?.id,
				organization_external_id: clerkClient?.organization?.id
			})
			.then(async () => {
				await onDelete?.();
				toast.success('Document removed');
			})
			.catch((e) => {
				const message =
					String(e)?.split('Uncaught ConvexError:').at(-1)?.split('at handler')[0]?.trim() ||
					'Error removing document';
				toast.error(message);
			})
			.finally(() => (deleting = false));
	};
</script>

<AlertDialog>
	<AlertDialogTrigger class="w-full">{@render children()}</AlertDialogTrigger>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Are you sure?</AlertDialogTitle>
			<AlertDialogDescription
				>This action cannot be undone. This will permanently delete your document.</AlertDialogDescription
			>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
			<AlertDialogAction disabled={deleting} onclick={(e) => deleteDoc()} class="w-20">
				{#if deleting}
					<LoaderIcon class="siz-4 animate-spin" />
				{:else}
					Delete
				{/if}
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
