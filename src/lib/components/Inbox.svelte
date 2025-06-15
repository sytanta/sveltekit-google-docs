<script lang="ts">
	import { untrack } from 'svelte';
	import type { InboxNotificationData } from '@liveblocks/core';
	import { BellIcon } from '@lucide/svelte';

	import type { NotificationData } from '$lib/stores/types';
	import editorStore from '$lib/stores/editor.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';

	type TInboxNotificationData = (InboxNotificationData & {
		activities: { data: NotificationData }[];
	})[];

	let notifications: TInboxNotificationData = $state.raw([]);

	$effect(() => {
		if (editorStore.lbClientStore.value) getNotifications();
		untrack(() => setInterval(getNotifications, 60000)); // Fetch notifications after every minute
	});

	function getNotifications() {
		editorStore.lbClientStore.value?.getInboxNotifications().then((res) => {
			notifications = res.inboxNotifications as TInboxNotificationData;
		});
	}
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		<Button variant="ghost" size="icon" class="relative">
			<BellIcon class="size-5" />
			{#if notifications.length}
				<span
					class="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-sky-500 text-xs text-white"
					>{notifications.length}</span
				>
			{/if}
		</Button>
	</DropdownMenuTrigger>
	<DropdownMenuContent align="end" class="w-auto">
		{#if notifications.length}
			<ul class="py-1">
				{#each notifications as { id, kind, activities } (id)}
					{@const { authorName } = activities[0].data || {}}
					<li class="px-3 py-1">
						{#if kind === '$textMention'}
							<p class="text-xs">{authorName} has just mentioned you</p>
						{:else if kind === '$thread'}
							<p class="text-xs">{authorName} has added a new comment</p>
						{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-muted-foreground w-[400px] p-2 text-center text-sm">No notifications</p>
		{/if}
	</DropdownMenuContent>
</DropdownMenu>
