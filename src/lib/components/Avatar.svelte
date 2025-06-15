<script lang="ts">
	const AVATAR_SIZE = 36;

	const { name, src }: { name: string; src: string } = $props();
</script>

<div
	style:width={`${AVATAR_SIZE}px`}
	style:height={`${AVATAR_SIZE}px`}
	class="group relative -ml-2 flex shrink-0 place-content-center rounded-full border-4 border-white bg-gray-400"
>
	<div
		class="absolute top-full z-10 mt-2.5 rounded-lg bg-black px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100"
	>
		{name}
	</div>
	<img {src} alt={name} class="size-full rounded-full" />
</div>
