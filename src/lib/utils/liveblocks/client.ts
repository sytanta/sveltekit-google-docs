import type { NotificationData } from '$lib/stores/types';

export async function sendNotification(
	data: NotificationData,
	onNotification?: (data: NotificationData) => void
) {
	onNotification?.(data);

	// Send to backend for push notifications
	try {
		await fetch('/api/liveblocks/notifications', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data
			})
		});
	} catch (error) {
		console.error('Failed to send notification: ', error);
	}
}
