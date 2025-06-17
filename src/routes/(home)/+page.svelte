<script lang="ts">
	import NavBar from './NavBar.svelte';
	import TemplateGallery from './TemplateGallery.svelte';
	import DocumentsTable from './DocumentsTable.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
</script>

<svelte:head>
	<title>SvelteKit Google Docs</title>
	<meta name="description" content="Google Docs clone with SvelteKit" />
	<meta name="author" content="Ta Sy Tan" />
	<meta name="referrer" content="no-referrer" />
	<meta name="format-detection" content="telephone=no" />
</svelte:head>

<main class="flex min-h-screen flex-col">
	<div class="fixed top-0 right-0 left-0 z-10 h-16 bg-white px-2 py-4 md:px-4"><NavBar /></div>
	<div class="mt-16">
		<TemplateGallery />
		<DocumentsTable
			documents={data.documents.page}
			continueCursor={data.documents.continueCursor}
			isDone={data.documents.isDone}
		/>
	</div>
</main>
