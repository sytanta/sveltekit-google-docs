<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import type { Editor, JSONContent } from '@tiptap/core';
	import {
		BoldIcon,
		FileIcon,
		FileJsonIcon,
		FilePenIcon,
		FilePlusIcon,
		FileTextIcon,
		GlobeIcon,
		ItalicIcon,
		PrinterIcon,
		Redo2Icon,
		RemoveFormattingIcon,
		StrikethroughIcon,
		TableIcon,
		TextIcon,
		TrashIcon,
		UnderlineIcon,
		Undo2Icon
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	import { goto, invalidate } from '$app/navigation';
	import { clerkClientStore } from '$lib/stores/clerk.svelte';
	import editorStore from '$lib/stores/editor.svelte';
	import {
		Menubar,
		MenubarContent,
		MenubarItem,
		MenubarMenu,
		MenubarSeparator,
		MenubarShortcut,
		MenubarSub,
		MenubarSubContent,
		MenubarSubTrigger,
		MenubarTrigger
	} from '$lib/components/ui/menubar';
	import ClerkButtons from '$lib/components/ClerkButtons.svelte';
	import RemoveDocumentDialog from '$lib/components/RemoveDocumentDialog.svelte';
	import RenameDocumentDialog from '$lib/components/RenameDocumentDialog.svelte';
	import DocumentInput from './DocumentInput.svelte';
	import { api } from '../../../convex/_generated/api';
	import { type Id } from '../../../convex/_generated/dataModel';

	type FileTypes = 'JSON' | 'HTML' | 'TEXT';

	const {
		id,
		title = 'Untitled document',
		setEditorLoadingStatus
	}: { id: string; title?: string; setEditorLoadingStatus?: (status: boolean) => void } = $props();

	const convexClient = useConvexClient();
	const clerkClient = $derived(clerkClientStore.clerk);
	const editor = $derived(editorStore.store.editor);
	let docTitle = $state(title);
	let creatingNewDoccument = false;

	const fileFormats: {
		[K in FileTypes]: {
			editorMethodName: keyof Pick<Editor, 'getJSON' | 'getHTML' | 'getText'>;
			type: string;
			extension: string;
		};
	} = {
		JSON: {
			editorMethodName: 'getJSON',
			type: 'application/json',
			extension: 'json'
		},
		HTML: {
			editorMethodName: 'getHTML',
			type: 'text/html',
			extension: 'html'
		},
		TEXT: {
			editorMethodName: 'getText',
			type: 'text/plain',
			extension: 'txt'
		}
	};

	const formatEditorContent = (content: JSONContent | string) =>
		typeof content === 'string' ? content : JSON.stringify(content);

	const insertTable = ({ rows, cols }: { rows: number; cols: number }) => {
		editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: false }).run();
	};

	const onDownload = (blob: Blob, fileName: string) => {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		a.click();
	};

	const onSaveDocument = (fileType: FileTypes) => {
		if (!editor) return;
		const { type, editorMethodName, extension } = fileFormats[fileType];
		const content = editor[editorMethodName]();

		const blob = new Blob([formatEditorContent(content)], { type });
		onDownload(blob, `${title}.${extension}`);
	};

	const createNewDocument = () => {
		if (creatingNewDoccument) return;
		creatingNewDoccument = true;
		setEditorLoadingStatus?.(true);

		convexClient
			.mutation(api.documents.create, {
				title: 'Untitled document',
				initial_content: '',
				user_external_id: clerkClient?.user?.id!,
				organization_external_id: clerkClient?.organization?.id
			})
			.catch(() => toast.error('Failed to create a new document'))
			.then(async (id) => {
				await goto(`/documents/${id}`)
					.then(() => invalidate('document-detail'))
					.then(() => toast.success('New document created'));
			})
			.finally(() => {
				creatingNewDoccument = false;
				setEditorLoadingStatus?.(false);
			});
	};
</script>

<nav class="flex items-center justify-between">
	<div class="flex items-center gap-2">
		<a href="/"><img src="/logo.svg" alt="Logo" width="36px" height="36px" /></a>
		<div class="flex flex-col">
			<DocumentInput {id} title={docTitle} onRename={(newTitle) => (docTitle = newTitle)} />

			<div class="flex">
				<Menubar class="h-auto border-none bg-transparent p-0 shadow-none">
					<MenubarMenu>
						<MenubarTrigger
							class="hover:bg-muted h-auto cursor-pointer rounded-sm px-[7px] py-0.5 text-sm font-normal"
							>File</MenubarTrigger
						>
						<MenubarContent class="print:hidden">
							<MenubarSub>
								<MenubarSubTrigger>
									<FileIcon class="mr-2 size-4" />
									Save
								</MenubarSubTrigger>
								<MenubarSubContent>
									<MenubarItem onSelect={() => onSaveDocument('JSON')}>
										<FileJsonIcon class="size-4" />
										JSON
									</MenubarItem>
									<MenubarItem onSelect={() => onSaveDocument('HTML')}>
										<GlobeIcon class="size-4" />
										HTML
									</MenubarItem>
									<MenubarItem onSelect={() => window.print()}>
										<svg
											stroke="currentColor"
											fill="currentColor"
											stroke-width="0"
											viewBox="0 0 16 16"
											height="16px"
											width="16px"
											xmlns="http://www.w3.org/2000/svg"
											><path
												d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1"
											></path><path
												d="M4.603 12.087a.8.8 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.7 7.7 0 0 1 1.482-.645 20 20 0 0 0 1.062-2.227 7.3 7.3 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.187-.012.395-.047.614-.084.51-.27 1.134-.52 1.794a11 11 0 0 0 .98 1.686 5.8 5.8 0 0 1 1.334.05c.364.065.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.86.86 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.7 5.7 0 0 1-.911-.95 11.6 11.6 0 0 0-1.997.406 11.3 11.3 0 0 1-1.021 1.51c-.29.35-.608.655-.926.787a.8.8 0 0 1-.58.029m1.379-1.901q-.25.115-.459.238c-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361q.016.032.026.044l.035-.012c.137-.056.355-.235.635-.572a8 8 0 0 0 .45-.606m1.64-1.33a13 13 0 0 1 1.01-.193 12 12 0 0 1-.51-.858 21 21 0 0 1-.5 1.05zm2.446.45q.226.244.435.41c.24.19.407.253.498.256a.1.1 0 0 0 .07-.015.3.3 0 0 0 .094-.125.44.44 0 0 0 .059-.2.1.1 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a4 4 0 0 0-.612-.053zM8.078 5.8a7 7 0 0 0 .2-.828q.046-.282.038-.465a.6.6 0 0 0-.032-.198.5.5 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822q.036.167.09.346z"
											></path></svg
										>
										PDF
									</MenubarItem>
									<MenubarItem onSelect={() => onSaveDocument('TEXT')}>
										<FileTextIcon class="size-4" />
										TEXT
									</MenubarItem>
								</MenubarSubContent>
							</MenubarSub>

							<MenubarItem onSelect={createNewDocument}>
								<FilePlusIcon class="size-4" />
								New Document
							</MenubarItem>
							<MenubarSeparator></MenubarSeparator>

							<RenameDocumentDialog
								documentId={id as Id<'documents'>}
								currentTitle={docTitle}
								onRename={(newTitle) => {
									docTitle = newTitle;
								}}
							>
								<MenubarItem onSelect={(event) => event.preventDefault()}>
									<FilePenIcon class="size-4" />
									Rename
								</MenubarItem>
							</RenameDocumentDialog>

							<RemoveDocumentDialog
								documentId={id as Id<'documents'>}
								onDelete={async () => {
									await invalidate('home');
									return goto('/');
								}}
							>
								<MenubarItem onSelect={(event) => event.preventDefault()}>
									<TrashIcon class="size-4" />
									Remove
								</MenubarItem>
							</RemoveDocumentDialog>
							<MenubarSeparator></MenubarSeparator>

							<MenubarItem onSelect={() => window.print()}>
								<PrinterIcon class="size-4" />
								Print <MenubarShortcut class="text-sm">⌘P</MenubarShortcut>
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>

					<MenubarMenu>
						<MenubarTrigger
							class="hover:bg-muted h-auto cursor-pointer rounded-sm px-[7px] py-0.5 text-sm font-normal"
							>Edit</MenubarTrigger
						>
						<MenubarContent class="print:hidden">
							<MenubarItem onSelect={() => editor?.chain().focus().undo().run()}>
								<Undo2Icon class="size-4" />
								Undo <MenubarShortcut class="text-sm">⌘Z</MenubarShortcut>
							</MenubarItem>
							<MenubarItem onSelect={() => editor?.chain().focus().redo().run()}>
								<Redo2Icon class="size-4" />
								Redo <MenubarShortcut class="text-sm">⌘Y</MenubarShortcut>
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>

					<MenubarMenu>
						<MenubarTrigger
							class="hover:bg-muted h-auto cursor-pointer rounded-sm px-[7px] py-0.5 text-sm font-normal"
							>Insert</MenubarTrigger
						>
						<MenubarContent class="print:hidden">
							<MenubarSub>
								<MenubarSubTrigger>
									<TableIcon class="mr-2 size-4" />
									Table
								</MenubarSubTrigger>
								<MenubarSubContent>
									<MenubarItem onSelect={() => insertTable({ rows: 1, cols: 1 })}>1 x 1</MenubarItem
									>
									<MenubarItem onSelect={() => insertTable({ rows: 2, cols: 2 })}>2 x 2</MenubarItem
									>
									<MenubarItem onSelect={() => insertTable({ rows: 3, cols: 3 })}>3 x 3</MenubarItem
									>
								</MenubarSubContent>
							</MenubarSub>
						</MenubarContent>
					</MenubarMenu>

					<MenubarMenu>
						<MenubarTrigger
							class="hover:bg-muted h-auto cursor-pointer rounded-sm px-[7px] py-0.5 text-sm font-normal"
							>Format</MenubarTrigger
						>
						<MenubarContent class="print:hidden">
							<MenubarSub>
								<MenubarSubTrigger>
									<TextIcon class="mr-2 size-4" />
									Text
								</MenubarSubTrigger>
								<MenubarSubContent>
									<MenubarItem onSelect={() => editor?.chain().focus().toggleBold().run()}>
										<BoldIcon class="size-4" />
										Bold <MenubarShortcut class="text-sm">⌘B</MenubarShortcut>
									</MenubarItem>
									<MenubarItem onSelect={() => editor?.chain().focus().toggleItalic().run()}>
										<ItalicIcon class="size-4" />
										Italic <MenubarShortcut class="text-sm">⌘I</MenubarShortcut>
									</MenubarItem>
									<MenubarItem onSelect={() => editor?.chain().focus().toggleUnderline().run()}>
										<UnderlineIcon class="size-4" />
										Underline <MenubarShortcut class="text-sm">⌘U</MenubarShortcut>
									</MenubarItem>
									<MenubarItem onSelect={() => editor?.chain().focus().toggleStrike().run()}>
										<StrikethroughIcon class="size-4" />
										Strike <MenubarShortcut class="text-sm">⌘S</MenubarShortcut>
									</MenubarItem>
								</MenubarSubContent>
							</MenubarSub>

							<MenubarItem onSelect={() => editor?.chain().focus().unsetAllMarks().run()}>
								<RemoveFormattingIcon class="size-4" />
								Clear formatting
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>
				</Menubar>
			</div>
		</div>
	</div>

	<ClerkButtons
		allowSwitchingOrganization={false}
		showCollaborators={true}
		showNotifications={true}
	/>
</nav>
