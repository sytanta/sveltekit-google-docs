<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { useConvexClient } from 'convex-svelte';
	import { toast } from 'svelte-sonner';
	import { LoaderIcon } from '@lucide/svelte';

	import { enhance } from '$app/forms';
	import { clerkClientStore } from '$lib/stores/clerk.svelte';
	import { Button } from './ui/button';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from './ui/dialog';
	import { Input } from './ui/input';
	import type { Id } from '../../convex/_generated/dataModel';
	import { api } from '../../convex/_generated/api';

	const {
		documentId,
		currentTitle,
		children,
		onRename
	}: {
		documentId: Id<'documents'>;
		currentTitle: string;
		children: Snippet;
		onRename?: (title: string) => Promise<void> | void;
	} = $props();

	const convexClient = useConvexClient();
	const clerkClient = $derived(clerkClientStore.clerk);
	let open = $state(false);
	let renaming = $state(false);

	const renameDoc: SubmitFunction = ({ cancel, formData }) => {
		const newTitle = String(formData.get('title')).trim();
		if (renaming || !newTitle || !clerkClient?.user) return cancel();
		renaming = true;

		cancel();

		convexClient
			.mutation(api.documents.updateTitleById, {
				id: documentId,
				title: newTitle,
				user_external_id: clerkClient?.user?.id,
				organization_external_id: clerkClient?.organization?.id
			})
			.then(async () => {
				await onRename?.(newTitle);
				open = false;

				toast.success('Document renamed');
			})
			.catch((e) => {
				const message =
					String(e)?.split('Uncaught ConvexError:').at(-1)?.split('at handler')[0]?.trim() ||
					'Error renaming document';
				toast.error(message);
			})
			.finally(() => {
				renaming = false;
			});
	};
</script>

<Dialog {open} onOpenChange={(isOpen) => (open = isOpen)}>
	<DialogTrigger class="w-full">{@render children()}</DialogTrigger>
	<DialogContent>
		<form method="post" use:enhance={renameDoc}>
			<DialogHeader>
				<DialogTitle>Rename document</DialogTitle>
				<DialogDescription>Enter a new name for this document</DialogDescription>
			</DialogHeader>
			<div class="my-4">
				<Input name="title" value={currentTitle} placeholder="Document name" />
			</div>
			<DialogFooter>
				<Button
					type="button"
					variant="outline"
					disabled={renaming}
					onclick={() => (open = false)}
					class="cursor-pointer">Cancel</Button
				>
				<Button type="submit" disabled={renaming} class="w-16 cursor-pointer">
					{#if renaming}
						<LoaderIcon class="siz-4 animate-spin" />
					{:else}
						Save
					{/if}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
