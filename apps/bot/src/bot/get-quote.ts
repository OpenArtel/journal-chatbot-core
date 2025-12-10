import type { MyContext } from './bot'

export function getQuote(ctx: MyContext) {
	let botQuote: string | null = null
	let userQuote: string | null = null

	const userId = ctx.message?.from.id
	const replied = ctx.message?.reply_to_message
	const quote = ctx.message?.quote
	const botUsername = ctx.me.username

	const isBotQuote = replied?.from?.username === botUsername
	if (isBotQuote && quote?.text.trim().length) {
		botQuote = quote.text
	}

	const isUserQuote = replied?.from?.id === userId
	if (isUserQuote && quote?.text?.trim().length) {
		userQuote = quote.text
	}

	return {
		botQuote,
		userQuote,
	}
}
