import { limit } from '@grammyjs/ratelimiter'
import { bot } from './bot'
import { knownCommands } from './bot-commands'

bot.use(
	limit({
		timeFrame: 1000,
		limit: 1,

		onLimitExceeded: async (ctx) => {
			await ctx.reply(
				'Пожалуйста, воздержитесь от отправки слишком большого количества запросов!',
			)
		},

		keyGenerator: (ctx) => {
			return ctx.from?.id.toString()
		},
	}),
)

// Only allow private messages
bot.use((ctx, next) => {
	if (!ctx.chat) return next()

	if (ctx.chat.type !== 'private') return

	return next()
})

// Ensure non-forwarded messages
bot.use(async (ctx, next) => {
	const msg = ctx.message
	if (!msg) return

	const isForwarded =
		'forward_date' in msg || 'forward_from' in msg || 'forward_from_chat' in msg

	if (isForwarded) {
		await ctx.reply(
			'Я не отвечаю на пересланные сообщения, напиши мне напрямую 🙂',
		)
		return
	}

	return next()
})

// Ban non-text messages
bot.use(async (ctx, next) => {
	const msg = ctx.message
	if (!msg) return

	const isSticker = 'sticker' in msg
	if (isSticker) return

	const hasFileOrMedia =
		'document' in msg ||
		'photo' in msg ||
		'video' in msg ||
		'audio' in msg ||
		'voice' in msg ||
		'video_note' in msg ||
		'animation' in msg

	if (hasFileOrMedia) {
		await ctx.reply('Пока что я работаю только с текстом')
		return
	}

	return next()
})

// Guard against unknown commands
bot.use(async (ctx, next) => {
	const msg = ctx.message
	if (!msg || !msg.text) return next()

	const text = msg.text

	if (text.startsWith('/')) {
		const cmd = text.slice(1).split(' ')[0]

		if (cmd && !knownCommands.includes(cmd)) {
			await ctx.reply('Я не знаю такой команды')
			return
		}
	}

	return next()
})
