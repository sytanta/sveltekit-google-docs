<script lang="ts">
	import { LoaderIcon } from '@lucide/svelte';

	import Editor from './Editor.svelte';
	import NavBar from './NavBar.svelte';
	import Toolbar from './Toolbar.svelte';

	const { data } = $props();

	let editorLoading = $state(true);
</script>

<svelte:head>
	<title>{data.document.title} - SvelteKit Google Docs</title>
	<meta name="description" content="Google Docs clone with SvelteKit" />
	<meta name="author" content="Ta Sy Tan" />
	<meta name="referrer" content="no-referrer" />
	<meta name="format-detection" content="telephone=no" />
</svelte:head>

<div class="min-h-screen bg-[#fafbfd]">
	<div
		class="fixed top-0 right-0 left-0 z-10 flex flex-col gap-y-2 bg-[#fafbfd] px-4 pt-2 print:hidden"
	>
		<NavBar
			id={data.document._id}
			title={data.document?.title}
			setEditorLoadingStatus={(status) => (editorLoading = status)}
		/>
		<Toolbar />
	</div>
	<div class="relative pt-[114px] print:pt-0">
		<Editor
			initialContent={data.document.initial_content}
			users={data.users}
			onLoaded={() => (editorLoading = false)}
		/>

		{#if editorLoading}
			<div
				class="absolute top-0 left-0 z-5 flex min-h-screen w-full flex-col items-center justify-center gap-2 bg-white/70"
			>
				<LoaderIcon class="text-muted-foreground relative z-10 size-6 animate-spin" />
			</div>
		{/if}
	</div>
</div>
