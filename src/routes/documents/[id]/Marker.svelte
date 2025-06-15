<script lang="ts">
	import { cn } from '$lib/utils';

	const {
		position,
		isLeft,
		isDragging,
		onMouseDown,
		onDoubleClick
	}: {
		position: number;
		isLeft?: boolean;
		isDragging: boolean;
		onMouseDown?: () => void;
		onDoubleClick?: () => void;
	} = $props();
</script>

<div
	class="group absolute top-0 z-[5] -ml-2 flex h-full w-4 cursor-ew-resize flex-col items-center"
	style:left={isLeft ? `${position}px` : 'unset'}
	style:right={isLeft ? 'unset' : `${position}px`}
	onmousedown={onMouseDown}
	ondblclick={onDoubleClick}
	role="presentation"
>
	<svg
		stroke="currentColor"
		fill="currentColor"
		stroke-width="0"
		viewBox="0 0 320 512"
		width="16"
		xmlns="http://www.w3.org/2000/svg"
		class={cn(
			'absolute top-0 h-full transform fill-blue-500',
			isLeft ? 'left-1/2 -translate-x-1/2' : 'translate-x-1/2'
		)}
		><path
			d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"
		></path></svg
	>
	<div
		class={cn(
			'absolute top-4 h-svh w-[1px] scale-x-50 transform border border-dashed border-[#3b72f6]',
			isLeft ? 'left-2 -translate-x-1/2' : 'right-0 translate-x-1/2',
			isDragging ? 'block' : 'hidden'
		)}
	></div>
</div>
