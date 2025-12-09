import type { AutoChatActionFlavor } from '@grammyjs/auto-chat-action'
import { Bot, type Context, GrammyError, HttpError } from 'grammy'
import { env } from '../utils/parse-env'
import { registerBotCommands } from './bot-commands'
import { registerBotMiddleware } from './bot-middleware'

import { generateAssistantResponse } from './generate-assistant-response'

export type MyContext = Context & AutoChatActionFlavor

export const bot = new Bot<MyContext>(env.BOT_TOKEN)

await registerBotMiddleware(bot)
await registerBotCommands(bot)

bot.on(':text', async (ctx) => {
	ctx.chatAction = 'typing'

	if (!ctx.message) return

	const text = ctx.message.text
	const userId = ctx.message.from.id

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
