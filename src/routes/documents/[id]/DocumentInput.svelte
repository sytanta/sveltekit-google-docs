<script lang="ts">
	import { untrack } from 'svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { useConvexClient } from 'convex-svelte';
	import type { Status } from '@liveblocks/client';
	import { toast } from 'svelte-sonner';
	import { LoaderIcon } from '@lucide/svelte';

	import { enhance } from '$app/forms';
	import { clerkClientStore } from '$lib/stores/clerk.svelte';
	import editorStore from '$lib/stores/editor.svelte';
	import { newDebounceFunc } from '$lib/utils/debounce';
	import { api } from '../../../convex/_generated/api';
	import type { Id } from '../../../convex/_generated/dataModel';

	let {
		id,
		title,
		onRename
	}: { id: string; title: string; onRename?: (newTitle: string) => void } = $props();

	const clerkClient = $derived(clerkClientStore.clerk);

	// Title editing
	let lastInputValue = title;
	let isEditing = $state(false);
	let isProcessing = $state(false);
	let isSubmitting = $state(false);

	// Liveblocks connection status
	let connectionStatus: Status = $state('initial');
	let unsubscribeStatusChange: () => void;
	$effect(() => {
		if (editorStore.editorRoomStore.room)
			untrack(
				() =>
					(unsubscribeStatusChange = editorStore.editorRoomStore.room!.subscribe(
						'status',
						(status) => {
							connectionStatus = status; // "initial" | "connecting" | "connected" | "reconnecting" | "disconnected"
						}
					))
			);
	});

	const convexClient = useConvexClient();

	const onVisible = (e: HTMLInputElement) => {
		e.focus();
	};

	const saveTitle = newDebounceFunc((newTitle: string) => {
		const title = newTitle.trim();

		if (!title || isSubmitting || !clerkClient?.isSignedIn) return;
		isProcessing = true;

		convexClient
			.mutation(api.documents.updateTitleById, {
				id: id as Id<'documents'>,
				title: newTitle.trim(),
				user_external_id: clerkClient.user!.id
			})
			.catch(() => toast.error('Failed to save title'))
			.then(() => {
				lastInputValue = title;
				onRename?.(title);

				toast.success('New title saved');
			})
			.finally(() => (isProcessing = false));
	}, 1000);

	const handleChange = (
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => saveTitle(e.currentTarget.value);

	const handleSubmit: SubmitFunction = ({ formData, cancel }) => {
		const title = String(formData.get('title') || '').trim();
		if (isSubmitting || !title || !clerkClient?.isSignedIn) return cancel();
		isSubmitting = true;

		cancel();

		convexClient
			.mutation(api.documents.updateTitleById, {
				id: id as Id<'documents'>,
				title,
				user_external_id: clerkClient.user!.id
			})
			.catch(() => toast.error('Failed to save title'))
			.then(() => {
				lastInputValue = title;
				onRename?.(title);
				isEditing = false;

				toast.success('New title saved');
			})
			.finally(() => (isSubmitting = false));
	};
</script>

<div class="flex items-center gap-2">
	{#if isEditing}
		<form method="post" use:enhance={handleSubmit} class="relative w-fit max-w-[50ch]">
			<span class="invisible px-1.5 text-lg whitespace-pre">
				{title || ' '}
			</span>
			<input
				bind:value={title}
				use:onVisible
				name="title"
				oninput={handleChange}
				required
				onblur={() => {
					title = lastInputValue;
					isEditing = false;
				}}
				class="absolute inset-0 truncate bg-transparent px-1.5 text-lg text-black"
			/>
		</form>
	{:else}
		<span
			onclick={() => (isEditing = true)}
			role="presentation"
			class="cursor-pointer truncate px-1.5 text-lg">{title}</span
		>
	{/if}

	{#if !clerkClient?.user || (clerkClient?.user && connectionStatus === 'connected')}
		<svg
			stroke="currentColor"
			fill="currentColor"
			stroke-width="0"
			viewBox="0 0 16 16"
			height="20px"
			width="20px"
			xmlns="http://www.w3.org/2000/svg"
			><path
				fill-rule="evenodd"
				d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"
			></path><path
				d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"
			></path></svg
		>
	{:else if clerkClient?.user && (connectionStatus === 'initial' || connectionStatus === 'connecting' || connectionStatus === 'reconnecting' || isProcessing || isSubmitting)}
		<LoaderIcon class="text-muted-foreground size-4 animate-spin" />
	{:else}
		<svg
			stroke="currentColor"
			fill="currentColor"
			stroke-width="0"
			viewBox="0 0 16 16"
			height="20px"
			width="20px"
			xmlns="http://www.w3.org/2000/svg"
			><path
				fill-rule="evenodd"
				d="M3.112 5.112a3 3 0 0 0-.17.613C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13H11l-1-1H3.781C2.231 12 1 10.785 1 9.318c0-1.365 1.064-2.513 2.46-2.666l.446-.05v-.447q0-.113.018-.231zm2.55-1.45-.725-.725A5.5 5.5 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773a3.2 3.2 0 0 1-1.516 2.711l-.733-.733C14.498 11.378 15 10.626 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3c-.875 0-1.678.26-2.339.661z"
			></path><path d="m13.646 14.354-12-12 .708-.708 12 12z"></path></svg
		>
	{/if}
</div>
