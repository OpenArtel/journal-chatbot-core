import { GrammyError, HttpError } from 'grammy'
import { bot } from './bot'

bot.start()
console.log('Start bot')

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
