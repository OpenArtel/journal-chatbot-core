import type { Bot } from 'grammy'
import type { MyContext } from './bot'
import { clearCurrentDay } from './clear-current-day'
import { conversationSummaryJob } from './conversation-summary'
import { startCommand } from './start-command'

export const knownCommands = ['start', 'clear_day', 'day_summary']

export async function registerBotCommands(bot: Bot<MyContext>) {
	await bot.api.setMyCommands([
		{
			command: 'clear_day',
			description: 'Очистить на сервере сообщения за этот день',
		},
		{
			command: 'day_summary',
			description: 'Получить итоги дня',
		},
	])

	bot.command('start', async (ctx) => {
		if (!ctx.message) return
		ctx.chatAction = 'typing'

		const userId = ctx.from.id

		const answer = await startCommand(userId)

		await ctx.reply(answer)
	})

	bot.command('clear_day', async (ctx) => {
		if (!ctx.from) return

		const userId = ctx.from.id
		const result = await clearCurrentDay(userId)

		await ctx.reply(result)
	})

	bot.command('day_summary', async (ctx) => {
		if (!ctx.from) return
		ctx.chatAction = 'typing'

		await conversationSummaryJob.emit({ userId: ctx.from.id, date: new Date() })

		ctx.reply('Подождите, подвожу итоги дня...')
	})

	bot.command('test', async (ctx) => {
		if (!ctx.from) return

		console.log('start test command')
	})
}
