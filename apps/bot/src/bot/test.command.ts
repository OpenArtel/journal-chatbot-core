import type { Bot } from 'grammy'
import { db } from '../../infra/database/db'
import type { MyContext } from './bot'
import { conversationSummaryJob } from './conversation-summary.job'

export const TEST_COMMAND_NAME = 'fix_daily_summary'

export async function testCommand(bot: Bot<MyContext>) {
	bot.command(TEST_COMMAND_NAME, async (ctx) => {
		if (!ctx.from) return

		// find all daily threads
		const result = await db
			.selectFrom('mastra_threads')
			.selectAll()
			.where('id', 'like', 'daily-%')
			.execute()

		console.log('>', JSON.stringify({ result }, null, 2))

		if (result.length) {
			// delete threads
			await db
				.deleteFrom('mastra_threads')
				.where('id', 'like', 'daily-%')
				.execute()

			// delete messages
			await db
				.deleteFrom('mastra_messages')
				.where('thread_id', 'like', 'daily-%')
				.execute()
		}

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
			.where('id', 'not like', 'daily-%')
			.where('createdAtZ', '>=', yesterday)
			.where('createdAtZ', '<', today)
			.execute()

		console.log('>', JSON.stringify({ userIds }, null, 2))

		for (const { resourceId } of userIds) {
			await conversationSummaryJob.emit({
				userId: Number(resourceId),
				date: yesterday,
			})
		}

		await ctx.reply('test')
	})
}
