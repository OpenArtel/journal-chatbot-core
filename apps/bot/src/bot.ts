import { Bot } from 'grammy'
import { env } from './utils/parse-env'

export const bot = new Bot(env.BOT_TOKEN)

bot.command('start', (ctx) =>
	ctx.reply('Добро пожаловать. Запущен и работает!'),
)

bot.on('message', (ctx) => ctx.reply('Получил другое сообщение!'))
