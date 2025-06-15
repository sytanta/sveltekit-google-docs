<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { createClient, type JsonObject, type Room } from '@liveblocks/client';
	import { getYjsProviderForRoom, LiveblocksYjsProvider } from '@liveblocks/yjs';
	import * as Y from 'yjs';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Collaboration from '@tiptap/extension-collaboration';
	import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
	import type { SuggestionProps } from '@tiptap/suggestion';
	import Mention from '@tiptap/extension-mention';
	import FontFamily from '@tiptap/extension-font-family';
	import TextStyle from '@tiptap/extension-text-style';
	import Heading from '@tiptap/extension-heading';
	import Underline from '@tiptap/extension-underline';
	import Highlight from '@tiptap/extension-highlight';
	import { Color } from '@tiptap/extension-color';
	import TextAlign from '@tiptap/extension-text-align';
	import Link from '@tiptap/extension-link';
	import Image from '@tiptap/extension-image';
	import ImageResize from 'tiptap-extension-resize-image';
	import TaskItem from '@tiptap/extension-task-item';
	import TaskList from '@tiptap/extension-task-list';
	import Table from '@tiptap/extension-table';
	import TableHeader from '@tiptap/extension-table-header';
	import TableRow from '@tiptap/extension-table-row';
	import TableCell from '@tiptap/extension-table-cell';
	import tippy from 'tippy.js';

	import { page } from '$app/state';
	import { DOCUMENT_PADDING } from '$lib/data/config';
	import { clerkClientStore } from '$lib/stores/clerk.svelte';
	import type { Comment } from '$lib/stores/types';
	import editorStore, { type User } from '$lib/stores/editor.svelte';
	import { sendNotification } from '$lib/utils/liveblocks/client';
	import colorByUserName from '$lib/utils/nameToColor';
	import { FontSizeExtension } from '$lib/extensions/font-size';
	import { LineHeightExtension } from '$lib/extensions/line-height';
	import { CommentsExtension } from '$lib/extensions/comment/CommentsExtension';
	import CommentFloatingMenu from '$lib/extensions/comment/CommentFloatingMenu.svelte';
	import Ruler from './Ruler.svelte';
	import MentionList from './MentionList.svelte';

	interface UserMap {
		[key: string]: User;
	}

	const {
		initialContent = '',
		users = {},
		onLoaded
	}: { initialContent?: string; users?: UserMap; onLoaded?: () => void } = $props();
	let usersList: User[] = Object.values(users);

	let editor: Editor | null = $state.raw(null);
	let leftMargin = DOCUMENT_PADDING;
	let rightMargin = DOCUMENT_PADDING;
	let currentUser: User | null = null;
	let element: Element;

	const documentId = page.params['id'];
	let room: Room | null = $state(null);
	let provider: LiveblocksYjsProvider | null = null;

	let mentionedUsers: ReturnType<typeof searchUsers> = $state.raw([]);
	let mentionEditorCommand: (props: any) => void = $state.raw(() => {});

	let showFloatingMenu = $state(false);
	let floatingMenuSelection = $state<{ from: number; to: number } | undefined>();
	let threadId = $state<string | undefined>();
	let comments = $state<Comment[]>([]);

	onMount(() => {
		const extensions = [
			FontFamily,
			TextStyle,
			FontSizeExtension,
			LineHeightExtension.configure({
				types: ['heading', 'paragraph']
			}),
			Heading,
			Underline,
			Highlight.configure({ multicolor: true }),
			Color,
			TextAlign.configure({
				types: ['heading', 'paragraph']
			}),
			Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
			Image,
			ImageResize,
			TaskList,
			TaskItem.configure({ nested: true }),
			Table,
			TableHeader,
			TableRow,
			TableCell
		];

		let unsubscribeOthers: () => void;
		let unsubscribeEvents: () => void;
		let leaveFunc: () => void;
		if (clerkClientStore?.clerk?.user) {
			const usersMap = new Map(Object.entries(users));
			const usersMapYjs = new Map();

			const name =
				clerkClientStore.clerk.user.fullName ||
				String(clerkClientStore.clerk.user.primaryEmailAddress);
			currentUser = {
				id: clerkClientStore.clerk.user.id,
				name,
				email: String(clerkClientStore.clerk.user.primaryEmailAddress),
				avatar: clerkClientStore.clerk.user.imageUrl,
				color: colorByUserName(name)
			};
			editorStore.setCurrentUser(currentUser);

			const lbClient = createClient({
				authEndpoint: async () => {
					const res = await fetch('/api/liveblocks/auth', {
						method: 'POST',
						body: JSON.stringify({ room: documentId })
					});
					return res.json();
				},
				resolveUsers(args) {
					return args.userIds.map((id) => usersMap.get(id) || users[id]);
				},
				resolveMentionSuggestions({ text }) {
					let filteredUsers = usersList;
					if (text.trim())
						filteredUsers = usersList.filter(({ name }) => name.toLowerCase().includes(text));

					return filteredUsers.map(({ id }) => id);
				}
			});

			editorStore.setLBStore(lbClient);

			// Enter a multiplayer room
			const { room: r, leave } = lbClient.enterRoom(documentId, {
				initialPresence: currentUser as unknown as JsonObject
			});
			room = r;
			leaveFunc = leave;

			editorStore.setEditorRoom(room);

			unsubscribeEvents = room.subscribe('event', ({ event }) => {
				const { type, value } = (event || {}) as { type: string; value: number };

				if (value && (type === 'leftMarginChange' || type === 'rightMarginChange')) {
					if (type === 'leftMarginChange') leftMargin = value;
					else rightMargin = value;

					const newStyle = `padding-left: ${leftMargin}px; padding-right: ${rightMargin}px;`;

					const currentProps = editor?.options.editorProps || {};
					editor?.setOptions({
						editorProps: {
							...currentProps,
							attributes: {
								...(currentProps.attributes || {}),
								style: newStyle
							}
						}
					});
				}
			});

			// If user is authenticated, allow editor usage after liveblocks room's storage finishes loading
			if (documentId !== 'new') {
				const unsubscribe = room.subscribe('storage-status', function (e) {
					if (e === 'synchronized') {
						onLoaded?.();
						unsubscribe();
						editor?.view?.focus();
					}
				});
			}

			// Set up Yjs document and Liveblocks Yjs provider
			provider = getYjsProviderForRoom(room);
			const yDoc = provider.getYDoc();

			provider.on('sync', async (synced: boolean) => {
				if (synced)
					room?.getStorage().then((storage) => {
						if (!storage.root.get('initialized')) {
							editor?.commands.setContent(initialContent);
							storage.root.set('initialized', true);
						}
					});
			});

			unsubscribeOthers = room.subscribe('others', (others) => {
				const collaborators: User[] = [];
				others.forEach((user) => {
					const yjsId = user.presence.__yjs_clientid || '';

					const data = {
						id: user.id!,
						name: user.info?.name || 'Anonymous',
						email: user.info?.email || '',
						color: user.info?.color || '#ff6b6b',
						avatar: user.info?.avatar || '',
						isOnline: !!yjsId
					} as User;

					collaborators.push(data);

					usersMap.set(user.id!, data);
					if (yjsId) usersMapYjs.set(String(yjsId), data);
				});

				editorStore.setOtherCollaborators(collaborators);
			});

			extensions.push(
				StarterKit.configure({
					// The Collaboration extension comes with its own history handling
					history: false
				}),
				Collaboration.configure({
					document: yDoc
				}),
				CollaborationCursor.configure({
					provider,
					render: (user) => {
						// Look up user info from user maps
						const yjsId = user.name.split(' ').at(-1);
						const userInfo = yjsId ? usersMapYjs.get(yjsId) : usersMap.get(user.id);

						const displayName = userInfo?.name || user.name || 'Anonymous';
						const displayColor = userInfo?.color || user.color || '#000';

						const cursor = document.createElement('span');
						cursor.classList.add('collaboration-cursor__caret');

						const label = document.createElement('div');
						label.classList.add('collaboration-cursor__label');
						label.setAttribute('style', `background-color: ${displayColor}`);
						label.textContent = displayName;

						cursor.appendChild(label);
						return cursor;
					}
				}),
				Mention.configure({
					HTMLAttributes: {
						class: 'mention'
					},
					suggestion: {
						items: ({ query }) => {
							return searchUsers(query);
						},
						render: renderMentionSuggestion
					}
				}),
				CommentsExtension.configure({
					yDoc,
					yProvider: provider,
					roomId: documentId,
					userId: currentUser.id,
					userName: currentUser.name,
					onShowFloatingMenu: (params) => {
						showFloatingMenu = params.visible;
						floatingMenuSelection = params.selection;
						threadId = params.threadId;
						comments = params.comments;
					}
				})
			);
		} else {
			extensions.push(StarterKit);
		}

		editor = new Editor({
			element,
			extensions,
			editorProps: {
				attributes: {
					style: `padding-left: ${leftMargin}px; padding-right: ${rightMargin}px;`,
					class:
						'focus:outline-none print:border-0 bg-white border border-[#c7c7c7] flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-14 cursor-text'
				}
			},
			onCreate({ editor }) {
				editorStore.set(editor);

				if (documentId === 'new') {
					editor.commands.setContent(initialContent);

					onLoaded?.();
					editor.view.focus();
				}
			},
			onDestroy() {
				editorStore.set(null);
				editorStore.setLBStore(null);
			}
		});

		return () => {
			leaveFunc?.();
			editor?.destroy();
			provider?.destroy();

			unsubscribeOthers?.();
			unsubscribeEvents?.();

			editorStore.set(null);
			editorStore.setEditorRoom(null);
			editorStore.setLBStore(null);
			editorStore.setOtherCollaborators([]);
		};
	});

	function searchUsers(query: string) {
		if (!query) return usersList.slice(0, 5);

		const filtered = usersList.filter(
			(user) =>
				user.name.toLowerCase().includes(query.toLowerCase()) ||
				(user.email && user.email.toLowerCase().includes(query.toLowerCase()))
		);

		return filtered.slice(0, 10);
	}

	function renderMentionSuggestion() {
		let popup: ReturnType<typeof tippy>;

		return {
			onStart: async (props: SuggestionProps<any, any>) => {
				mentionedUsers = searchUsers(props.query);
				mentionEditorCommand = getOnMentionHandler(props.command);

				if (!props.clientRect) return;

				await tick();

				popup = tippy('body', {
					getReferenceClientRect: props.clientRect!,
					appendTo: () => document.body,
					content: document.getElementById('mention-list') as Element,
					allowHTML: true,
					showOnCreate: true,
					interactive: true,
					trigger: 'manual',
					placement: 'bottom-start',
					onHidden: () => (mentionedUsers = [])
				});
			},

			onUpdate(props: SuggestionProps<any, any>) {
				mentionedUsers = searchUsers(props.query);
				mentionEditorCommand = getOnMentionHandler(props.command);

				if (!props.clientRect) return;

				popup[0].setProps({
					getReferenceClientRect: props.clientRect!
				});
			},

			onKeyDown(props: SuggestionProps) {
				if (props.event?.key === 'Escape') {
					popup[0].hide();
					return true;
				}

				return false;
			},

			onExit() {
				popup[0].destroy();
			}
		};
	}

	function handleAddComment(
		content: string,
		selection?: { from: number; to: number },
		threadId?: string
	) {
		editor?.commands.addComment(content, selection, threadId);
	}

	function handleReplyToComment(commentId: string, content: string, threadId?: string) {
		editor?.commands.replyToComment(commentId, content, threadId);
	}

	function getOnMentionHandler(mentionExtCommand: (props: { id: string; name: string }) => void) {
		return (props: { id: string; name: string }) => {
			mentionExtCommand(props);
			sendNotification({
				kind: '$textMention',
				type: 'mention',
				roomId: documentId,
				threadId: documentId,
				authorId: currentUser!.id,
				authorName: currentUser!.name,
				mentionUserId: props.id,
				mentionUserName: props.name,
				timestamp: Date.now()
			});
		};
	}

	function updateLeftRightMargins(leftMargin: number, rightMargin: number) {
		const currentProps = editor?.options.editorProps || {};
		editor?.setOptions({
			editorProps: {
				...currentProps,
				attributes: {
					...(currentProps.attributes || {}),
					style: `padding-left: ${leftMargin}px; padding-right: ${rightMargin}px;`
				}
			}
		});
	}
</script>

<div
	class="size-full overflow-x-auto bg-[#f9fbfd] px-4 print:overflow-visible print:bg-white print:p-0"
>
	<Ruler
		{room}
		onMarginChange={(leftMargin, rightMargin) => updateLeftRightMargins(leftMargin, rightMargin)}
	/>
	<div
		class="mx-auto flex w-[816px] min-w-max justify-center py-4 print:w-full print:min-w-0 print:py-0"
	>
		<div bind:this={element}></div>
	</div>
</div>

<MentionList items={mentionedUsers} command={mentionEditorCommand} />

{#if editor}
	<CommentFloatingMenu
		{editor}
		{threadId}
		{comments}
		onAddComment={handleAddComment}
		onReplyToComment={handleReplyToComment}
		visible={showFloatingMenu}
		selection={floatingMenuSelection}
	/>
{/if}
