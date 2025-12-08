import { db } from '../../infra/database/db'
import { generateAssistantResponse } from './generate-assistant-response'

export async function startCommand(userId: number) {
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
