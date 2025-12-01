import { MastraClient } from '@mastra/client-js'
import { env } from './utils/parse-env'

// GMT+0 UTC
const threadId = new Date().toISOString().split('T')[0]

export async function generateAssistantResponse(
	message: string,
	userId: number,
) {
	const mastraClient = new MastraClient({
		baseUrl: env.MASTRA_URL,
	})

	const agent = mastraClient.getAgent('assistantAgent')

	const response = await agent.generate({
		messages: [
			{
				role: 'user',
				content: message,
			},
		],
		threadId: threadId,
		resourceId: userId.toString(),
	})

	return response.text
}
