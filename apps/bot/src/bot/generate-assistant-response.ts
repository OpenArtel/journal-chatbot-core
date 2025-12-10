import { MastraClient } from '@mastra/client-js'
import { getThreadId } from '../utils/get-thread-id'
import { env } from '../utils/parse-env'

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
		threadId: getThreadId(userId),
		resourceId: userId.toString(),
	})

	const formatedAnswer = response.text
		.replace(/\*\*/g, '')
		.replace(/\*/g, '')
		.replace(/\n /g, '\n')

	if (formatedAnswer.length === 0) {
		throw new Error("Assistant didn't respond")
	}

	return formatedAnswer
}
