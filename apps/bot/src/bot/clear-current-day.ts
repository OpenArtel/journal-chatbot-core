import { MastraClient } from '@mastra/client-js'
import { getThreadId } from '../utils/get-thread-id'
import { env } from '../utils/parse-env'

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
