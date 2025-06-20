// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-client#Typing-your-data
declare global {
	interface Liveblocks {
		// Each user's Presence, for room.getPresence, room.subscribe("others"), etc.
		Presence: {
			// Example, real-time cursor coordinates
			// cursor: { x: number; y: number };
		};

		// The Storage tree for the room, for room.getStorage, room.subscribe(storageItem), etc.
		Storage: {
			// Example, a conflict-free list
			// animals: LiveList<string>;
			leftMargin: number;
			rightMargin: number;
		};

		// Custom user info set when authenticating with a secret key
		UserMeta: {
			id: string;
			info: {
				// Example properties, for room.getSelf, room.subscribe("others"), etc.
				// name: string;
				// avatar: string;
			};
		};

		// Custom events, for room.broadcastEvent, room.subscribe("event")
		RoomEvent: {};
		// Example has two events, using a union
		// | { type: "PLAY" }
		// | { type: "REACTION"; emoji: "🔥" };

		// Custom metadata set on threads, for use in React
		ThreadMetadata: {
			// Example, attaching coordinates to a thread
			// x: number;
			// y: number;
		};

		// Custom room info set with resolveRoomsInfo, for use in React
		RoomInfo: {
			// Example, rooms with a title and url
			// title: string;
			// url: string;
		};
	}
}

export {};
