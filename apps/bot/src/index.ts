import { PgBoss } from 'pg-boss'
import { pingDatabase } from '../infra/database/db'
import { generateTypes } from '../infra/database/generate-type'
import { migrateToLatest } from '../infra/database/migrate'
import { JobManager } from '../infra/queue/pg-boss'
import { bot } from './bot/bot'
import { conversationSummaryJob } from './bot/conversation-summary.job'
import { conversationSummaryAggregatorJob } from './bot/conversations-summary-aggregator.job'
import { env } from './utils/parse-env'

async function main() {
	console.log('\n\n\n')

	await pingDatabase()

	await generateTypes()

	await migrateToLatest()

	const boss = new PgBoss(env.DATABASE_URL)
	const jobs = new JobManager(boss).register(
		conversationSummaryJob,
		conversationSummaryAggregatorJob,
	)

	await jobs.start()

	await conversationSummaryAggregatorJob.schedule({}, '0 0 * * *')

	bot.start({
		drop_pending_updates: true,
		onStart: ({ username }) => {
			console.log(`[grammy] Bot @${username} started without backlog`)
		},
	})

	process.on('SIGTERM', async () => {
		process.exit(0)
	})
}

await main()
