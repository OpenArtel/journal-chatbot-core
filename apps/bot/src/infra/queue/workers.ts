import type { PgBoss } from 'pg-boss'
import { bot } from '../../bot/bot'
import { conversationSummaryWorkflow } from '../../bot/conversation-summary-workflow'
import { queues } from './queues'

export async function registerWorkers(boss: PgBoss) {
	boss.work(queues.dailySummary, async ([job]) => {
		// console.log('worker:', JSON.stringify(job, null, 2))
		const { userId } = job.data

		bot.api.sendChatAction(userId, 'typing')

		const summary = await conversationSummaryWorkflow(userId).catch((err) => {
			'Упс! ' + err.message
		})

		bot.api.sendMessage(userId, summary)
	})
}
