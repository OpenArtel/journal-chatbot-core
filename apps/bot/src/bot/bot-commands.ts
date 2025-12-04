import type { Bot } from 'grammy'
import { boss } from '../infra/queue/pg-boss'
import { queues } from '../infra/queue/queues'
import { clearCurrentDay } from './clear-current-day'
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
		const userId = ctx.message.from.id

		await ctx.replyWithChatAction('typing')

		const answer = await generateAssistantResponse(text, userId)

		await ctx.reply(answer)
	})

	bot.command('clear_day', async (ctx) => {
		const result = await clearCurrentDay()

		await ctx.reply(result)
	})

	bot.command('day_summary', async (ctx) => {
		if (!ctx.from) return

		boss.send(queues.dailySummary, {
			userId: ctx.from.id,
		})

		await ctx.replyWithChatAction('typing')

		ctx.reply('Подождите, итоги дня генерируются...')
	})
}
