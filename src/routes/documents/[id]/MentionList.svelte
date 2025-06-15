<script lang="ts">
	interface Item {
		id: string;
		name: string;
		email?: string;
		avatar?: string;
		isOnline?: boolean;
	}

	let { items, command }: { items: Item[]; command: (item: Item) => void } = $props();

	let selectedIndex = $state(0);
	$effect(() => {
		if (!items.length) selectedIndex = 0;
		if (selectedIndex && selectedIndex >= items.length) selectedIndex = items.length - 1;
	});

	function onKeyDown(
		event: KeyboardEvent & {
			currentTarget: EventTarget & Window;
		}
	) {
		if (!items.length) return false;

		if (event.key === 'ArrowUp') {
			event.preventDefault();

			upHandler();
			return true;
		}

		if (event.key === 'ArrowDown') {
			downHandler();
			return true;
		}

		if (event.key === 'Enter') {
			enterHandler();
			return true;
		}

		return false;
	}

	function upHandler() {
		selectedIndex = (selectedIndex + items.length - 1) % items.length;
	}

	function downHandler() {
		selectedIndex = (selectedIndex + 1) % items.length;
	}

	function enterHandler() {
		selectItem(selectedIndex);
	}

	function selectItem(index: number) {
		const item = items[index];
		if (item) command({ id: item.id, name: item.name });

		selectedIndex = 0;
		items = [];
	}

	function handleKeyDown(
		event: KeyboardEvent & {
			currentTarget: EventTarget & Window;
		}
	) {
		return onKeyDown(event);
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if items.length > 0}
	<div id="mention-list" class="mention-list">
		{#each items as item, index}
			<button
				class="mention-item"
				class:selected={index === selectedIndex}
				onclick={() => selectItem(index)}
				type="button"
			>
				<div class="mention-avatar">
					{#if item.avatar}
						<img src={item.avatar} alt={item.name} />
					{:else}
						<div class="avatar-placeholder">
							{item.name.charAt(0).toUpperCase()}
						</div>
					{/if}
				</div>
				<div class="mention-info">
					<div class="mention-name">{item.name}</div>
					{#if item.email}
						<div class="mention-email">{item.email}</div>
					{/if}
				</div>
				{#if item.isOnline}
					<div class="online-indicator"></div>
				{/if}
			</button>
		{/each}
	</div>
{/if}

<style>
	.mention-list {
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
		padding: 4px;
		max-height: 200px;
		overflow-y: auto;
		z-index: 1000;
	}

	.mention-item {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 8px 12px;
		border: none;
		background: none;
		border-radius: 4px;
		cursor: pointer;
		text-align: left;
		gap: 8px;
		position: relative;
	}

	.mention-item:hover,
	.mention-item.selected {
		background-color: #f3f4f6;
	}

	.mention-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		overflow: hidden;
		flex-shrink: 0;
	}

	.mention-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 100%;
		height: 100%;
		background-color: #6366f1;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 14px;
	}

	.mention-info {
		flex: 1;
		min-width: 0;
	}

	.mention-name {
		font-weight: 500;
		color: #111827;
		font-size: 14px;
	}

	.mention-email {
		font-size: 12px;
		color: #6b7280;
	}

	.online-indicator {
		width: 8px;
		height: 8px;
		background-color: #10b981;
		border-radius: 50%;
		flex-shrink: 0;
	}
</style>
