import { bot } from './bot/bot'
import { migrateToLatest } from './infra/database/migrate'
import { initPgBoss, stopPgBoss } from './infra/queue/pg-boss'

async function main() {
	console.log('\n\n\n')

	await migrateToLatest()

	await initPgBoss().catch(console.error)

	bot.start({
		drop_pending_updates: true,
		onStart: ({ username }) => {
			console.log(`[grammy] Bot @${username} started without backlog`)
		},
	})

	process.on('SIGTERM', async () => {
		await stopPgBoss()
		process.exit(0)
	})
}

main()
