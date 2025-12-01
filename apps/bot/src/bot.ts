import { Bot } from 'grammy'
import { clearCurrentDay } from './clear-current-day'
import { generateAssistantResponse } from './generate-assistant-response'
import { env } from './utils/parse-env'

export const bot = new Bot(env.BOT_TOKEN)

export const knownCommands = ['start', 'clear_day']
await bot.api.setMyCommands([
	{
		command: 'clear_day',
		description: 'Очистить на сервере сообщения за этот день',
	},
])

bot.command('start', (ctx) => ctx.reply('Добро пожаловать'))

bot.command('clear_day', async (ctx) => {
	const result = await clearCurrentDay()

	await ctx.reply(result)
})

bot.on(':text', async (ctx) => {
	if (!ctx.message) return

	const text = ctx.message.text
	const userId = ctx.message.from.id

	await ctx.replyWithChatAction('typing')

	const answer = await generateAssistantResponse(text, userId)

	await ctx.reply(answer)
})
