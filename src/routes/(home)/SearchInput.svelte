<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import { LoaderIcon, SearchIcon, XIcon } from '@lucide/svelte';

	import { enhance } from '$app/forms';
	import { useURLSearchParam } from '$lib/hooks/urls.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	const [searchparam, setSearchParam] = useURLSearchParam('search');
	let searchTerm = $state(String(searchparam || ''));
	let searching = $state(false);

	const clearInput = () => {
		searching = true;

		searchTerm = '';
		setSearchParam('').finally(() => (searching = false));
	};

	const handleSubmit: SubmitFunction = ({ cancel }) => {
		cancel();

		searching = true;
		setSearchParam(searchTerm).finally(() => (searching = false));
	};
</script>

<div class="flex flex-1 items-center justify-center">
	<form method="post" class="relative w-full max-w-[720px]" use:enhance={handleSubmit}>
		<Input
			bind:value={searchTerm}
			disabled={searching}
			placeholder="Search"
			class="h-[48px] w-full rounded-full border-none bg-[#f0f4f8] px-14 placeholder:text-neutral-800 focus:bg-white focus-visible:shadow-[0_1px_1px_0_rgba(65,69,73,.3),0_1px_3px_1px_rgba(65,69,73,.15)] focus-visible:ring-0 md:text-base"
		/>
		<Button
			type="submit"
			variant="ghost"
			size="icon"
			class="absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer rounded-full [&_svg]:size-5"
		>
			<SearchIcon />
		</Button>
		{#if searchTerm || searching}
			<Button
				type="button"
				variant="ghost"
				size="icon"
				disabled={searching}
				onclick={clearInput}
				class="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full [&_svg]:size-5"
			>
				{#if searching}
					<LoaderIcon class="animate-spin" />
				{:else}
					<XIcon />
				{/if}
			</Button>
		{/if}
	</form>
</div>
