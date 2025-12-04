import { PgBoss } from 'pg-boss'
import { registerQueues } from './queues'
import { registerSchedules } from './schedules'
import { registerWorkers } from './workers'

export const boss = new PgBoss(process.env.DATABASE_URL as string)

export async function initPgBoss() {
	boss.on('error', (err: any) => console.error(err))
	boss.on('warning', (warn: any) => console.warn(warn))

	await boss.start()

	await registerQueues(boss)
	await registerWorkers(boss)
	await registerSchedules(boss)

	console.log('[queue] PgBoss started')
}

export async function stopPgBoss() {
	await boss.stop()
	console.log('[queue] PgBoss stopped')
}
