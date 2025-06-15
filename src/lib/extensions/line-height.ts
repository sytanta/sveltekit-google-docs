import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		lineHeight: {
			setLineHeight: (lineHeight: string) => ReturnType;
			unsetLineHeight: () => ReturnType;
		};
	}
}

export const LineHeightExtension = Extension.create({
	name: 'lineHeight',
	addOptions() {
		return {
			types: ['heading', 'paragraph'],
			defaultLineHeight: 'normal'
		};
	},
	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					lineHeight: {
						default: this.options.defaultLineHeight,
						parseHTML: (elm) => elm.style.lineHeight || this.options.defaultLineHeight,
						renderHTML: (attributes) => {
							if (!attributes.lineHeight) return {};

							return { style: `line-height: ${attributes.lineHeight}` };
						}
					}
				}
			}
		];
	},
	addCommands() {
		return {
			setLineHeight:
				(lineHeight: string) =>
				({ tr, state, dispatch }) => {
					const { selection } = state;
					tr = tr.setSelection(selection);

					const { from, to } = selection;
					state.doc.nodesBetween(from, to, (node, pos) => {
						if (this.options.types.includes(node.type.name)) {
							tr = tr.setNodeMarkup(pos, undefined, {
								...node.attrs,
								lineHeight
							});
						}
					});

					dispatch?.(tr);
					return true;
				},
			unsetLineHeight:
				() =>
				({ tr, state, dispatch }) => {
					const { selection } = state;
					tr = tr.setSelection(selection);

					const { from, to } = selection;
					state.doc.nodesBetween(from, to, (node, pos) => {
						if (this.options.types.includes(node.type.name)) {
							tr = tr.setNodeMarkup(pos, undefined, {
								...node.attrs,
								lineHeight: this.options.defaultLineHeight
							});
						}
					});

					dispatch?.(tr);
					return true;
				}
		};
	}
});
