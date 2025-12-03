import { MastraClient } from '@mastra/client-js'
import { env } from '../utils/parse-env'

export async function clearCurrentDay() {
	const threadId = new Date().toISOString().split('T')[0] // GMT+0 UTC
	if (!threadId) return 'Ошибка. Попробуйте позже'

	const mastraClient = new MastraClient({
		baseUrl: env.MASTRA_URL,
	})

	const thread = mastraClient.getMemoryThread(threadId, 'assistantAgent')

	const { result } = await thread.delete()

	if (result === 'Thread deleted') {
		return 'Данные за сегодня успешно очищены'
	} else {
		return 'Ошибка. Попробуйте позже'
	}
}
