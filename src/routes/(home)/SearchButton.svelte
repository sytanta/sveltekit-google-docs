<script lang="ts">
	import { SearchIcon } from '@lucide/svelte';

	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import SearchForm from './SearchForm.svelte';
</script>

<Drawer.Root direction="top">
	<Drawer.Trigger class="mr-2 ml-auto md:mr-0 md:hidden">
		<SearchIcon class="size-5" />
	</Drawer.Trigger>
	<Drawer.Content class="!rounded-none p-2">
		<SearchForm />

		<Drawer.Footer class="mt-2 !flex-row justify-end !p-0">
			<Drawer.Close class="text-muted-foreground rounded-md border-2 px-4 py-1 text-sm"
				>Close</Drawer.Close
			>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
