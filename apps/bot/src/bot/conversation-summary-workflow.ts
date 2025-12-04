import { MastraClient } from '@mastra/client-js'
import { env } from '../utils/parse-env'

export async function conversationSummaryWorkflow(userId: number) {
	// GMT+0 UTC
	const threadId = new Date().toISOString().split('T')[0]

	const mastraClient = new MastraClient({
		baseUrl: env.MASTRA_URL,
	})

	const workflow = mastraClient.getWorkflow('conversationSummaryWorkflow')
	const response = await workflow.createRunAsync()

	const answer = await response.startAsync({
		inputData: {
			threadId: threadId,
			resourceId: userId.toString(),
		},
	})

	if (answer.status !== 'success') {
		throw new Error('Workflow failed')
	}

	return answer.result.summary
}
