import { Bot, GrammyError, HttpError } from 'grammy'
import { env } from '../utils/parse-env'
import { clearCurrentDay } from './clear-current-day'
import { generateAssistantResponse } from './generate-assistant-response'

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

bot.catch(async (err) => {
	const ctx = err.ctx
	const e = err.error

	console.error(`Ошибка при обработке update ${ctx.update.update_id}:`, e)

	try {
		if (e instanceof GrammyError) {
			console.error('Ошибка Telegram API:', e.description)
		} else if (e instanceof HttpError) {
			console.error('Ошибка сети:', e)
		} else {
			console.error('Неизвестная ошибка:', e)
			await ctx.reply(
				'Упс, что-то пошло не так. Попробуйте еще раз через минуту',
			)
		}
	} catch (notifyErr) {
		console.error('Не удалось уведомить пользователя об ошибке:', notifyErr)
	}
})
