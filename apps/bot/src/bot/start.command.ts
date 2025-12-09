import type { Bot } from 'grammy'
import { db } from '../../infra/database/db'
import type { MyContext } from './bot'
import { generateAssistantResponse } from './generate-assistant-response'

export const START_COMMAND_NAME = 'start'

export async function startCommand(bot: Bot<MyContext>) {
	bot.command(START_COMMAND_NAME, async (ctx) => {
		if (!ctx.message) return
		ctx.chatAction = 'typing'

		const userId = ctx.from.id

		const answer = await run(userId)

		await ctx.reply(answer)
	})
}

async function run(userId: number) {
	const userIdStr = userId.toString()

	const { isNewUser } = await db.transaction().execute(async (trx) => {
		const inserted = await trx
			.insertInto('users')
			.values({
				id: userIdStr,
			})
			.onConflict((oc) => oc.column('id').doNothing())
			.returning('id')
			.executeTakeFirst()

		return { isNewUser: !!inserted }
	})

	if (isNewUser) {
		const text = 'Привет, расскажи зачем ты здесь и что ты умеешь'
		return await generateAssistantResponse(text, userId)
	}

	const text =
		'Я вернулся к диалогу с тобой спустя время, напомни мне зачем ты здесь и что ты умеешь'
	return await generateAssistantResponse(text, userId)
}
