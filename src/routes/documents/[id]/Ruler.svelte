<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import type {
		BaseMetadata,
		BaseUserMeta,
		Json,
		JsonObject,
		LiveObject,
		LsonObject,
		Room
	} from '@liveblocks/client';

	import { DOCUMENT_PADDING, DOCUMENT_WIDTH, MIN_DOCUMENT_CONTENT } from '$lib/data/config';
	import Marker from './Marker.svelte';

	const {
		room,
		onMarginChange
	}: {
		room: Room<JsonObject, LsonObject, BaseUserMeta, Json, BaseMetadata> | null;
		onMarginChange: (newLeftMargin: number, newRightMargin: number) => void;
	} = $props();

	const markers = new Array(83);
	let roomStorage: LiveObject<LsonObject> | null = null;
	let rulerContainerElm: HTMLDivElement;
	let unsubscribeEvents: () => void;

	let leftMargin = $state(DOCUMENT_PADDING);
	let rightMargin = $state(DOCUMENT_PADDING);
	let showMarkers = $state(false);

	let isDraggingLeft = $state(false);
	let isDraggingRight = $state(false);

	$effect(() => {
		if (room)
			untrack(() => {
				room.getStorage().then((storage) => {
					roomStorage = storage.root;

					leftMargin = Number(roomStorage.get('leftMargin') || 0) || DOCUMENT_PADDING;
					rightMargin = Number(roomStorage.get('rightMargin') || 0) || DOCUMENT_PADDING;

					onMarginChange(leftMargin, rightMargin);

					setTimeout(() => (showMarkers = true), 150);
				});

				unsubscribeEvents = room.subscribe('event', ({ event }) => {
					const { type, value } = (event || {}) as { type: string; value: number };

					if (value && (type === 'leftMarginChange' || type === 'rightMarginChange')) {
						if (type === 'leftMarginChange') leftMargin = value;
						else rightMargin = value;
					}
				});
			});
	});

	onDestroy(() => {
		unsubscribeEvents?.();
	});

	const handleLeftMouseDown = () => {
		isDraggingLeft = true;
	};
	const handleRightMouseDown = () => {
		isDraggingRight = true;
	};

	const handleMouseMove = (e: MouseEvent) => {
		if ((!isDraggingLeft && !isDraggingRight) || !rulerContainerElm) return;

		const containerRect = rulerContainerElm.getBoundingClientRect();
		const relativeX = e.clientX - containerRect.left;
		const rawLeftPosition = Math.max(0, Math.min(DOCUMENT_WIDTH, relativeX));

		if (isDraggingLeft) {
			const maxLeftPosition = DOCUMENT_WIDTH - rightMargin - MIN_DOCUMENT_CONTENT;
			leftMargin = Math.min(rawLeftPosition, maxLeftPosition);

			updateMargin('left', leftMargin);
		}

		if (isDraggingRight) {
			const maxRightPosition = DOCUMENT_WIDTH - leftMargin - MIN_DOCUMENT_CONTENT;
			rightMargin = Math.min(DOCUMENT_WIDTH - rawLeftPosition, maxRightPosition);

			updateMargin('right', rightMargin);
		}
	};

	const handleMouseUp = () => {
		isDraggingLeft = isDraggingRight = false;
	};

	const handleLeftDoubleClick = () => {
		leftMargin = DOCUMENT_PADDING;
		updateMargin('left', leftMargin);
	};
	const handleRightDoubleClick = () => {
		rightMargin = DOCUMENT_PADDING;
		updateMargin('right', rightMargin);
	};

	function updateMargin(side: 'left' | 'right', newMargin: number) {
		if (side === 'left') {
			roomStorage?.set('leftMargin', newMargin);
			onMarginChange(newMargin, rightMargin);

			room?.broadcastEvent({ type: 'leftMarginChange', value: newMargin });
		}

		if (side === 'right') {
			roomStorage?.set('rightMargin', newMargin);
			onMarginChange(leftMargin, newMargin);

			room?.broadcastEvent({ type: 'rightMarginChange', value: newMargin });
		}
	}
</script>

<div
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	role="presentation"
	class="relative mx-auto flex h-6 w-[816px] items-end border-b border-gray-300 select-none print:hidden"
>
	<div bind:this={rulerContainerElm} class="relative h-full w-full">
		{#if showMarkers}
			<Marker
				position={leftMargin}
				isLeft={true}
				isDragging={isDraggingLeft}
				onMouseDown={handleLeftMouseDown}
				onDoubleClick={handleLeftDoubleClick}
			/>
			<Marker
				position={rightMargin}
				isDragging={isDraggingRight}
				onMouseDown={handleRightMouseDown}
				onDoubleClick={handleRightDoubleClick}
			/>
		{/if}
		<div class="absolute inset-x-0 bottom-0 h-full">
			<div class="relative h-full w-[816px]">
				{#each markers as _, i (i)}
					{@const position = (i * 816) / 82}
					<div class="absolute bottom-0" style:left={`${position}px`}>
						{#if i % 10 === 0}
							<div class="absolute bottom-0 h-2 w-[1px] bg-neutral-500"></div>
							<span
								class="absolute bottom-2 -translate-x-1/2 transform text-[10px] text-neutral-500"
								>{i / 10 + 1}</span
							>
						{:else if i % 5 === 0}
							<div class="absolute bottom-0 h-1.5 w-[1px] bg-neutral-500"></div>
						{:else}
							<div class="absolute bottom-0 h-1 w-[1px] bg-neutral-500"></div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
