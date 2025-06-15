export interface CommentThread {
	id: string;
	from: number;
	to: number;
	comments: Comment[];
	resolved: boolean;
}

export interface Comment {
	id: string;
	threadId: string;
	userId: string;
	userName: string;
	content: string;
	timestamp: number;
	replies: Comment[];
}

export interface CommentRange {
	from: number;
	to: number;
	commentId: string;
}

export interface NotificationData {
	kind: `$${string}`;
	type: 'mention' | 'comment' | 'reply' | 'resolve';
	roomId: string;
	threadId: string;
	commentId?: string;
	authorId: string;
	authorName: string;
	mentionUserId?: string;
	mentionUserName?: string;
	content?: string;
	timestamp: number;
}
