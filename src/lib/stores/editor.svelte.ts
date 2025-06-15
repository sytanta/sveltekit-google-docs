import { Editor } from '@tiptap/core';
import type { BaseMetadata, BaseUserMeta, Client, Room } from '@liveblocks/client';

export interface User {
	id: string;
	name: string;
	email: string;
	avatar: string;
	color?: string;
	isOnline?: boolean;
}

export interface Comment {
	id: string;
	userId: string;
	content: string;
	createdAt: string;
	resolved?: boolean;
}

export interface Thread {
	id: string;
	comments: Comment[];
	resolved: boolean;
	metadata: {
		quote?: string;
		time?: number;
	};
}

const store = $state<{ editor: Editor | null }>({
	editor: null
});

const editorRoomStore = $state<{ room: Room | null }>({
	room: null
});

const collaboratorsStore = $state<{ me: User | null; others: User[] }>({
	me: null,
	others: []
});

const lbClientStore = $state<{ value: Client<BaseUserMeta, BaseMetadata> | null }>({
	value: null
});

const setEditor = (editor: Editor | null) => {
	store.editor = editor;
};

const setEditorRoom = (room: Room | null) => {
	editorRoomStore.room = room;
};

const setLBStore = (value: Client<BaseUserMeta, BaseMetadata> | null) => {
	lbClientStore.value = value;
};

const setCurrentUser = (user: User | null) => {
	collaboratorsStore.me = user;
};

const setOtherCollaborators = (others: User[]) => {
	collaboratorsStore.others = others;
};

export default {
	store,
	editorRoomStore,
	lbClientStore,
	collaboratorsStore,
	set: setEditor,
	setEditorRoom,
	setLBStore,
	setCurrentUser,
	setOtherCollaborators
};
