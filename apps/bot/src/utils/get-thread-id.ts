export function getThreadId(userId: number | string, date?: Date) {
	// GMT+0 UTC
	const threadId = date
		? new Date(date).toISOString().split('T')[0]
		: new Date().toISOString().split('T')[0]

	return `${threadId}-${userId}`
}
