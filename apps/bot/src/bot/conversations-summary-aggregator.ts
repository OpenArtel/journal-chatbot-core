import { db } from '../../infra/database/db'
import { defineJob } from '../../infra/queue/pg-boss'
import { conversationSummaryJob } from './conversation-summary'

export const conversationSummaryAggregatorJob = defineJob(
	'conversation_summary_aggregator',
)
	.options({ retryLimit: 1 })
	.work(async ([job]) => {
		if (!job) throw new Error('No job data provided')

		// UTC 0
		const todayDateStr = new Date().toISOString().split('T')[0] as string
		const today = new Date(todayDateStr)

		const yesterday = new Date(today)
		yesterday.setUTCDate(yesterday.getUTCDate() - 1)

		const userIds = await db
			.selectFrom('mastra_threads')
			.select('resourceId')
			// не нужен, подразумевается что у каждого пользователя один тренд на каждый день
			// .distinct()
			.where('createdAtZ', '>=', yesterday)
			.where('createdAtZ', '<', today)
			.execute()

		for (const { resourceId } of userIds) {
			await conversationSummaryJob.emit({
				userId: Number(resourceId),
				date: yesterday,
			})
		}
	})
