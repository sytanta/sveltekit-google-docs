<script lang="ts">
	import editorStore from '$lib/stores/editor.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import Avatar from './Avatar.svelte';

	const currentUser = $derived(editorStore.collaboratorsStore.me);
	const otherUsers = $derived(editorStore.collaboratorsStore.others);
</script>

<div class="flex items-center">
	{#if otherUsers.length && currentUser}
		<div class="relative ml-2">
			<Avatar name="You" src={currentUser.avatar} />
		</div>
	{/if}
	<div class="flex">
		{#each otherUsers as { id, name, avatar } (id)}
			<Avatar {name} src={avatar} />
		{/each}
	</div>
	{#if otherUsers.length}
		<Separator orientation="vertical" class="ml-2 h-6!" />
	{/if}
</div>
