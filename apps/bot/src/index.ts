import { bot } from './bot/bot'
import { migrateToLatest } from './infra/migrate'

async function main() {
	console.log('\n\n\n')

	await migrateToLatest()

	bot.start({
		drop_pending_updates: true,
		onStart: ({ username }) => {
			console.log(`[grammy] Bot @${username} started without backlog`)
		},
	})
}

main()
