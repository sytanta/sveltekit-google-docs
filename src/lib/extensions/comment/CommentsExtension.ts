import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import * as Y from 'yjs';

import { sendNotification } from '$lib/utils/liveblocks/client';
import type { Comment, CommentRange, CommentThread, NotificationData } from '../../stores/types';
import { CommentMark } from './CommentMark';

export interface CommentsOptions {
	yDoc: Y.Doc;
	yProvider: LiveblocksYjsProvider;
	userId: string;
	userName: string;
	roomId: string;
	onShowFloatingMenu?: (params: {
		visible: boolean;
		selection?: { from: number; to: number };
		threadId?: string;
		comments: Comment[];
	}) => void;
	onNotification?: (data: NotificationData) => void;
}

export const CommentsExtension = Extension.create<CommentsOptions>({
	name: 'comments',

	addOptions() {
		return {
			yDoc: null as unknown as Y.Doc,
			yProvider: null as unknown as LiveblocksYjsProvider,
			roomId: '',
			userId: '',
			userName: '',
			onShowFloatingMenu: () => {}
		};
	},

	addExtensions() {
		return [CommentMark];
	},

	addStorage() {
		return {
			threads: new Map<string, CommentThread>(),
			currentThreadId: null as string | null,
			comments: new Map() as Map<string, Comment>,
			commentRanges: [] as CommentRange[],
			syncComments: null as (() => void) | null
		};
	},

	onCreate() {
		if (!this.options.yDoc || !this.options.yProvider) {
			console.warn('CommentsExtension: yDoc and yProvider are required');
			return;
		}

		const { yDoc } = this.options;
		const threadsArr = yDoc.getMap('commentThreads');

		// Sync threads from Yjs
		const syncThreads = () => {
			const threads = new Map<string, CommentThread>();
			threadsArr.forEach((thread, threadId) => {
				threads.set(threadId, thread as CommentThread);
			});
			this.storage.threads = threads;
		};

		threadsArr.observe(syncThreads);
		syncThreads();
	},

	addProseMirrorPlugins() {
		const extension = this;
		const editor = this.editor;

		return [
			new Plugin({
				key: new PluginKey('comments'),

				props: {
					decorations: (state) => {
						const decorations: Decoration[] = [];
						const { doc } = state;

						(extension.storage.threads as Map<string, CommentThread>).forEach(
							(thread, threadId) => {
								if (thread.from < doc.content.size && thread.to <= doc.content.size) {
									decorations.push(
										Decoration.inline(thread.from, thread.to, {
											class: `comment-thread comment-thread-${threadId}`,
											'data-thread-id': threadId
										})
									);
								}
							}
						);

						return DecorationSet.create(doc, decorations);
					},

					handleClick: (view, pos, event) => {
						const target = event.target as HTMLElement;
						const threadId = target.getAttribute('data-thread-id');

						if (threadId) {
							editor.commands.showFloatingMenu(undefined, threadId);
							return true;
						}

						return false;
					}
				},

				view(editorView) {
					const handleMouseUp = () => {
						const { selection } = editorView.state;

						if (selection.empty) editor.commands.hideFloatingMenu();
						else {
							const { from, to } = selection;
							const selectedText = editorView.state.doc.textBetween(from, to);

							if (selectedText.trim()) {
								// Check for overlapping threads
								const overlappingThread = Array.from(
									(extension.storage.threads as Map<string, CommentThread>).values()
								).find(
									(thread) =>
										(from >= thread.from && from <= thread.to) ||
										(to >= thread.from && to <= thread.to) ||
										(from <= thread.from && to >= thread.to)
								);

								editor.commands.showFloatingMenu({ from, to }, overlappingThread?.id);
							}
						}
					};

					const handleKeyUp = (event: KeyboardEvent) => {
						if (event.key === 'Escape') {
							editor.commands.hideFloatingMenu();
							return;
						}

						// Handle selection changes via keyboard (arrow keys, etc.)
						if (
							['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)
						) {
							const { state } = editorView;
							const { selection } = state;

							if (selection.empty) editor.commands.hideFloatingMenu();
						}
					};

					editorView.dom.addEventListener('mouseup', handleMouseUp);
					editorView.dom.addEventListener('keyup', handleKeyUp);

					return {
						destroy() {
							editorView.dom.removeEventListener('mouseup', handleMouseUp);
							editorView.dom.removeEventListener('keyup', handleKeyUp);
							editor.commands.hideFloatingMenu();
						}
					};
				}
			})
		];
	},

	addCommands() {
		const extension = this;

		return {
			addComment:
				(content: string, selection?: { from: number; to: number }, threadId?: string) =>
				({ state, dispatch }) => {
					const { selection: editorSelection } = state;
					const { from, to } =
						selection || (editorSelection ?? ({} as { from: number; to: number }));

					if (from == undefined || to == undefined) return false;

					// Add to Yjs document
					const threadsMap = this.options.yDoc.getMap('commentThreads');
					const currentThreadId = threadId || generateThreadId();

					const commentId = generateCommentId();
					const comment: Comment = {
						id: commentId,
						threadId: currentThreadId,
						userId: this.options.userId,
						userName: this.options.userName,
						content,
						timestamp: Date.now(),
						replies: []
					};

					if (threadId) {
						// Add to existing thread
						const existingThread = threadsMap.get(threadId) as CommentThread;
						if (existingThread) {
							const updatedThread = {
								...existingThread,
								comments: [...existingThread.comments, comment]
							};
							threadsMap.set(threadId, updatedThread);

							if (state) dispatch?.(state.tr);
						}
					} else {
						// Create new thread
						const newThread: CommentThread = {
							id: currentThreadId,
							from,
							to,
							comments: [comment],
							resolved: false
						};
						threadsMap.set(currentThreadId, newThread);

						// Apply comment mark to selection
						if (dispatch) {
							const tr = state.tr.addMark(
								from,
								to,
								state.schema.marks.commentMark.create({ threadId: currentThreadId })
							);
							dispatch(tr);
						}
					}

					// Send notification
					sendNotification(
						{
							kind: '$thread',
							type: 'comment',
							threadId: currentThreadId,
							roomId: extension.options.roomId,
							commentId: comment.id,
							authorId: extension.options.userId,
							authorName: extension.options.userName,
							content,
							timestamp: Date.now()
						},
						extension.options.onNotification
					);

					this.editor.commands.hideFloatingMenu();
					return true;
				},

			replyToComment:
				(commentId: string, content: string, threadId: string) =>
				({ state, dispatch }) => {
					const threadsMap = this.options.yDoc.getMap('commentThreads');
					const thread = threadsMap.get(threadId) as CommentThread;

					const existingCommentIndex = thread.comments.findIndex(({ id }) => id === commentId);
					if (existingCommentIndex < 0) return false;

					const reply: Comment = {
						id: generateCommentId(),
						threadId,
						userId: this.options.userId,
						userName: this.options.userName,
						content,
						timestamp: Date.now(),
						replies: []
					};

					const existingComment = thread.comments[existingCommentIndex];
					const updatedComment = {
						...existingComment,
						replies: [...existingComment.replies, reply]
					};
					thread.comments[existingCommentIndex] = updatedComment;

					threadsMap.set(threadId, thread);

					if (state) dispatch?.(state.tr);

					// Send notification
					sendNotification(
						{
							kind: '$thread',
							type: 'reply',
							threadId,
							roomId: extension.options.roomId,
							commentId,
							authorId: extension.options.userId,
							authorName: extension.options.userName,
							content,
							timestamp: Date.now()
						},
						extension.options.onNotification
					);

					return true;
				},

			resolveThread:
				(threadId: string) =>
				({ state, dispatch }) => {
					const threadsMap = this.options.yDoc.getMap('commentThreads');
					const thread = threadsMap.get(threadId) as CommentThread;

					if (thread) {
						const updatedThread = { ...thread, resolved: true };
						threadsMap.set(threadId, updatedThread);
					}

					if (state) dispatch?.(state.tr);

					// Send notification
					sendNotification(
						{
							kind: '$thread',
							type: 'reply',
							threadId,
							roomId: extension.options.roomId,
							authorId: extension.options.userId,
							authorName: extension.options.userName,
							timestamp: Date.now()
						},
						extension.options.onNotification
					);

					return true;
				},

			deleteThread:
				(threadId: string) =>
				({ state, dispatch }) => {
					const threadsMap = this.options.yDoc.getMap('commentThreads');
					threadsMap.delete(threadId);

					// Remove comment marks from editor
					const tr = state.tr;

					state.doc.descendants((node, pos) => {
						if (node.marks) {
							node.marks.forEach((mark) => {
								if (mark.type.name === 'commentMark' && mark.attrs.threadId === threadId) {
									tr.removeMark(pos, pos + node.nodeSize, mark);
								}
							});
						}
					});

					if (tr.docChanged) dispatch?.(tr);
					return true;
				},

			showFloatingMenu:
				(selection?: { from: number; to: number }, existingThreadId?: string) => () => {
					if (existingThreadId) extension.storage.currentThreadId = existingThreadId;
					const comments = extension.storage.threads.get(existingThreadId)?.comments || [];

					this.options.onShowFloatingMenu?.({
						visible: true,
						selection,
						threadId: existingThreadId,
						comments
					});

					return true;
				},

			hideFloatingMenu: () => () => {
				this.options.onShowFloatingMenu?.({
					visible: false,
					comments: []
				});

				return true;
			}
		};
	}
});

function generateThreadId() {
	return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateCommentId() {
	return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
