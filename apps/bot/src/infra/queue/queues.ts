import type { PgBoss } from 'pg-boss'

export const queues = {
	dailySummary: 'daily-summary',
}

export async function registerQueues(boss: PgBoss) {
	await boss.createQueue(queues.dailySummary)
}
