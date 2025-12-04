import type { Bot } from 'grammy'

import { clearCurrentDay } from './clear-current-day'
import { conversationSummaryJob } from './conversation-summary'
import { conversationSummaryAggregatorJob } from './conversations-summary-aggregator'
import { generateAssistantResponse } from './generate-assistant-response'

export const knownCommands = ['start', 'clear_day']

export async function registerBotCommands(bot: Bot) {
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

		const text = 'Привет, расскажи зачем ты здесь и что ты умеешь'
		const userId = ctx.from.id

		await ctx.replyWithChatAction('typing')

		const answer = await generateAssistantResponse(text, userId)

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

		await conversationSummaryJob.emit({ userId: ctx.from.id, date: new Date() })

		await ctx.replyWithChatAction('typing')

		ctx.reply('Подождите, подвожу итоги дня...')
	})

	bot.command('test', async (ctx) => {
		if (!ctx.from) return

		console.log('start test command')

		conversationSummaryAggregatorJob.emit({})
	})
}
