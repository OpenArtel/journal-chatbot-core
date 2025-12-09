import type { Bot } from 'grammy'
import type { MyContext } from './bot'
import { clearCurrentDay } from './clear-current-day'
import { conversationSummaryJob } from './conversation-summary.job'
import {
	DAILY_COMMAND_NAME,
	dailyBotCommand,
	dailySummaryMenu,
} from './daily.command'
import { START_COMMAND_NAME, startCommand } from './start.command'

export const knownCommands = [
	START_COMMAND_NAME,
	DAILY_COMMAND_NAME,
	'clear_day',
	'test_day_summary',
]

export async function registerBotCommands(bot: Bot<MyContext>) {
	await bot.api.setMyCommands([
		dailyBotCommand,
		{
			command: 'test_clear_day',
			description: 'Очистить на сервере сообщения за этот день',
		},
		{
			command: 'test_day_summary',
			description: 'Получить итоги дня',
		},
	])

	await dailySummaryMenu(bot)
	await startCommand(bot)

	bot.command('test_clear_day', async (ctx) => {
		if (!ctx.from) return

		const userId = ctx.from.id
		const result = await clearCurrentDay(userId)

		await ctx.reply(result)
	})

	bot.command('test_day_summary', async (ctx) => {
		if (!ctx.from) return
		ctx.chatAction = 'typing'

		await conversationSummaryJob.emit({ userId: ctx.from.id, date: new Date() })

		ctx.reply('Подождите, подвожу итоги дня...')
	})
}
