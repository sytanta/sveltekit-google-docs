<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom';
	import type { Editor } from '@tiptap/core';
	import type { Comment } from '../../stores/types';

	interface Props {
		editor: Editor;
		threadId?: string;
		comments: Comment[];
		onAddComment: (
			content: string,
			selection?: { from: number; to: number },
			threadId?: string
		) => void;
		onReplyToComment: (commentId: string, content: string, threadId: string) => void;
		visible: boolean;
		selection?: { from: number; to: number };
	}

	let {
		editor,
		threadId,
		comments = [],
		onAddComment,
		onReplyToComment,
		visible = false,
		selection
	}: Props = $props();

	let floatingElement: HTMLElement;
	let cleanup: (() => void) | null = null;
	let newCommentText = $state('');
	let replyText = $state('');
	let showReplyForm = $state<string | null>(null);

	onMount(() => {
		updatePosition();
	});

	onDestroy(() => {
		if (cleanup) {
			cleanup();
		}
	});

	function updatePosition() {
		if (!visible || !floatingElement) return;

		// Get the selection coordinates from the editor
		const { view } = editor;
		const { from, to } = selection || view.state.selection;

		// Create a virtual reference element based on selection
		const start = view.coordsAtPos(from);
		const end = view.coordsAtPos(to);

		const virtualElement = {
			getBoundingClientRect() {
				return {
					width: end.left - start.left,
					height: start.bottom - start.top,
					x: start.left,
					y: start.top,
					left: start.left,
					right: end.left,
					top: start.top,
					bottom: start.bottom
				};
			}
		};

		if (cleanup) {
			cleanup();
		}

		cleanup = autoUpdate(virtualElement, floatingElement, () => {
			computePosition(virtualElement, floatingElement, {
				placement: 'bottom-start',
				middleware: [offset(10), flip(), shift({ padding: 16 })]
			}).then(({ x, y }) => {
				Object.assign(floatingElement.style, {
					left: `${x}px`,
					top: `${y}px`
				});
			});
		});
	}

	$effect(() => {
		if (visible) {
			updatePosition();
		} else if (cleanup) {
			cleanup();
			cleanup = null;
		}
	});

	function handleAddComment() {
		if (newCommentText.trim()) {
			onAddComment(newCommentText.trim(), selection, threadId);
			newCommentText = '';
			showReplyForm = null;
		}
	}

	function handleReply(commentId: string) {
		if (replyText.trim()) {
			onReplyToComment(commentId, replyText.trim(), threadId!);
			replyText = '';
			showReplyForm = null;
		}
	}

	function formatTimestamp(timestamp: number) {
		return new Date(timestamp).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

{#if visible}
	<div
		bind:this={floatingElement}
		class="comment-floating-menu"
		style="position: absolute; z-index: 1000;"
	>
		<div class="comment-panel">
			<!-- Existing Comments -->
			{#if comments.length > 0}
				<div class="existing-comments max-h-96 overflow-y-auto">
					<h4>Comments</h4>
					{#each comments as comment}
						<div class="comment-item">
							<div class="comment-header">
								<strong>{comment.userName}</strong>
								<span class="timestamp">{formatTimestamp(comment.timestamp)}</span>
							</div>
							<div class="comment-content">{comment.content}</div>

							<!-- Replies -->
							{#if comment.replies.length > 0}
								<div class="replies">
									{#each comment.replies as reply}
										<div class="reply-item">
											<div class="comment-header">
												<strong>{reply.userName}</strong>
												<span class="timestamp">{formatTimestamp(reply.timestamp)}</span>
											</div>
											<div class="comment-content">{reply.content}</div>
										</div>
									{/each}
								</div>
							{/if}

							<!-- Reply Form -->
							{#if showReplyForm === comment.id}
								<div class="reply-form">
									<textarea bind:value={replyText} placeholder="Write a reply..." rows="2"
									></textarea>
									<div class="form-actions">
										<button onclick={() => handleReply(comment.id)}>Reply</button>
										<button onclick={() => (showReplyForm = null)}>Cancel</button>
									</div>
								</div>
							{:else}
								<button class="reply-button" onclick={() => (showReplyForm = comment.id)}>
									Reply
								</button>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			<!-- New Comment Form -->
			<div class="new-comment-form">
				<textarea bind:value={newCommentText} placeholder="Add a comment..." rows="3"></textarea>
				<div class="form-actions">
					<button onclick={handleAddComment}>
						{comments.length > 0 ? 'Add Comment' : 'Comment'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.comment-floating-menu {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 14px;
	}

	.comment-panel {
		width: 320px;
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
		overflow: hidden;
	}

	.existing-comments {
		padding: 16px;
		border-bottom: 1px solid #e1e5e9;
		max-height: 300px;
		overflow-y: auto;
	}

	.existing-comments h4 {
		margin: 0 0 12px 0;
		color: #374151;
		font-size: 16px;
		font-weight: 600;
	}

	.comment-item {
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid #f3f4f6;
	}

	.comment-item:last-child {
		margin-bottom: 0;
		border-bottom: none;
		padding-bottom: 0;
	}

	.comment-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 6px;
	}

	.comment-header strong {
		color: #111827;
		font-size: 13px;
	}

	.timestamp {
		color: #6b7280;
		font-size: 12px;
	}

	.comment-content {
		color: #374151;
		line-height: 1.5;
		margin-bottom: 8px;
	}

	.replies {
		margin-left: 16px;
		padding-left: 12px;
		border-left: 2px solid #e5e7eb;
	}

	.reply-item {
		margin-top: 12px;
		padding-top: 8px;
	}

	.reply-button {
		background: none;
		border: none;
		color: #3b82f6;
		cursor: pointer;
		font-size: 12px;
		padding: 0;
		text-decoration: underline;
	}

	.reply-button:hover {
		color: #2563eb;
	}

	.new-comment-form,
	.reply-form {
		padding: 16px;
	}

	.reply-form {
		padding: 12px 0 0 0;
	}

	textarea {
		width: 100%;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		padding: 8px 12px;
		font-family: inherit;
		font-size: 14px;
		resize: vertical;
		min-height: 60px;
	}

	textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-actions {
		display: flex;
		gap: 8px;
		margin-top: 12px;
		justify-content: flex-end;
	}

	button {
		padding: 8px 16px;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid;
		transition: all 0.15s ease;
	}

	button:first-child {
		background: #3b82f6;
		border-color: #3b82f6;
		color: white;
	}

	button:first-child:hover {
		background: #2563eb;
		border-color: #2563eb;
	}

	button:not(:first-child) {
		background: white;
		border-color: #d1d5db;
		color: #374151;
	}

	button:not(:first-child):hover {
		background: #f9fafb;
		border-color: #9ca3af;
	}
</style>
