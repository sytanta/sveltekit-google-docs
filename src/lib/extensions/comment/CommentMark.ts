import { Mark, markInputRule, markPasteRule, mergeAttributes } from '@tiptap/core';

export interface CommentOptions {
	HTMLAttributes: Record<string, any>;
	onCommentClick?: (commentId: string) => void;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		commentMark: {
			setCommentMark: (threadId: string) => ReturnType;
			toggleCommentMark: (threadId: string) => ReturnType;
			unsetCommentMark: () => ReturnType;
		};
	}
}

export const CommentMark = Mark.create<CommentOptions>({
	name: 'commentMark',

	addOptions() {
		return {
			HTMLAttributes: {},
			onCommentClick: () => {}
		};
	},

	addAttributes() {
		return {
			threadId: {
				default: null,
				parseHTML: (element) => element.getAttribute('data-thread-id'),
				renderHTML: (attributes) => {
					if (!attributes.threadId) {
						return {};
					}
					return {
						'data-thread-id': attributes.threadId
					};
				}
			}
		};
	},

	parseHTML() {
		return [
			{
				tag: 'span[data-thread-id]'
			}
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'span',
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				class: 'comment-highlight'
			}),
			0
		];
	},

	addCommands() {
		return {
			setCommentMark:
				(threadId: string) =>
				({ commands }) => {
					return commands.setMark(this.name, { threadId });
				},
			toggleCommentMark:
				(threadId: string) =>
				({ commands }) => {
					return commands.toggleMark(this.name, { threadId });
				},
			unsetCommentMark:
				() =>
				({ commands }) => {
					return commands.unsetMark(this.name);
				}
		};
	}
});
