import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		fontSize: {
			setFontSize: (size: string) => ReturnType;
			unsetFontSize: () => ReturnType;
		};
	}
}

export const FontSizeExtension = Extension.create({
	name: 'fontSize',
	addOptions() {
		return {
			types: ['textStyle']
		};
	},
	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					fontSize: {
						default: null,
						parseHTML: (elm) => elm.style.fontSize,
						renderHTML: (attributes) => {
							if (!attributes.fontSize) return {};

							return { style: `font-size: ${attributes.fontSize}` };
						}
					}
				}
			}
		];
	},
	addCommands() {
		return {
			setFontSize:
				(fontSize: string) =>
				({ chain }) =>
					chain().setMark('textStyle', { fontSize }).run(),
			unsetFontSize:
				() =>
				({ chain }) =>
					chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
		};
	}
});
