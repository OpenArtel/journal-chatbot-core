import { MastraClient } from '@mastra/client-js'
import type { Bot } from 'grammy'
import { getThreadId } from '../utils/get-thread-id'
import { env } from '../utils/parse-env'
import type { MyContext } from './bot'

export const CLEAR_CURRENT_DAY_COMMAND_NAME = 'test_clear_today'

export const clearCurrentDayCommandDescription = {
	command: CLEAR_CURRENT_DAY_COMMAND_NAME,
	description: 'Очистить на сервере сообщения за этот день',
}

export async function clearCurrentDayCommand(bot: Bot<MyContext>) {
	bot.command(CLEAR_CURRENT_DAY_COMMAND_NAME, async (ctx) => {
		if (!ctx.from) return

		const userId = ctx.from.id
		const result = await clearCurrentDay(userId)

		await ctx.reply(result)
	})
}

export async function clearCurrentDay(userId: number) {
	const mastraClient = new MastraClient({
		baseUrl: env.MASTRA_URL,
	})

	const thread = mastraClient.getMemoryThread(
		getThreadId(userId),
		'assistantAgent',
	)

	const { result } = await thread.delete()

	if (result === 'Thread deleted') {
		return 'Данные за сегодня успешно очищены'
	} else {
		return 'Ошибка. Попробуйте позже'
	}
}
