<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { LoaderIcon } from '@lucide/svelte';

	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { TEMPLATES } from '$lib/data/templates';
	import { clerkClientStore } from '$lib/stores/clerk.svelte';
	import { cn } from '$lib/utils';
	import { Carousel, CarouselContent, CarouselItem } from '$lib/components/ui/carousel';
	import CarouselNext from '$lib/components/ui/carousel/carousel-next.svelte';
	import CarouselPrevious from '$lib/components/ui/carousel/carousel-previous.svelte';
	import { api } from '../../convex/_generated/api';

	const convexClient = useConvexClient();
	const clerkClient = $derived(clerkClientStore.clerk);

	let selectedTemplate = $state('');
	let isCreating = $state(false);

	$effect(() => {
		if (browser) {
			const userBtnElm: HTMLDivElement | null = document.getElementById(
				'user-button'
			) as HTMLDivElement;
			if (userBtnElm) clerkClient?.mountUserButton(userBtnElm);
		}
	});

	const createDocument = (documentType: string, title: string, initialContent: string) => {
		isCreating = true;
		selectedTemplate = documentType;

		if (!clerkClient?.isSignedIn)
			return goto(`/documents/new?type=${documentType}`).finally(() => (isCreating = false));

		convexClient
			.mutation(api.documents.create, {
				title: title,
				user_external_id: clerkClient?.user?.id!,
				organization_external_id: clerkClient?.organization?.id,
				initial_content: initialContent
			})
			.then((id) => goto(`/documents/${id}`).finally(() => (isCreating = false)));
	};
</script>

<div class="bg-[#f1f3f4]">
	<div class="mx-auto flex max-w-screen-xl flex-col gap-y-4 px-16 py-6">
		<h3 class="font-medium">Start a new document</h3>
		<Carousel>
			<CarouselContent class="-ml-4">
				{#each TEMPLATES as { id, label, imageUrl, initialContent } (id)}
					<CarouselItem
						class="basis-1/2 pl-4 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-[calc(1/7*100%)]"
					>
						<div
							class={cn(
								'relative flex aspect-[3/4] flex-col gap-y-2.5',
								isCreating ? 'pointer-events-none opacity-50' : ''
							)}
						>
							<button
								disabled={isCreating}
								onclick={() => createDocument(id, label, initialContent)}
								style:background-image={`url(${imageUrl})`}
								class="flex size-full cursor-pointer flex-col items-center justify-center gap-y-4 rounded-sm border bg-white bg-cover bg-center bg-no-repeat transition hover:border-blue-500 hover:bg-blue-50"
								aria-label={label}
							>
							</button>
							<p class="truncate text-sm font-medium">{label}</p>
							{#if isCreating && selectedTemplate === id}
								<div class="absolute top-0 left-0 flex size-full items-center justify-center pb-10">
									<LoaderIcon class="size-5 animate-spin" />
								</div>
							{/if}
						</div>
					</CarouselItem>
				{/each}
			</CarouselContent>

			<CarouselPrevious class="cursor-pointer" />
			<CarouselNext class="cursor-pointer" />
		</Carousel>
	</div>
</div>
