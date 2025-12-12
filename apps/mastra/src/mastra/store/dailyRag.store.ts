import { Memory } from '@mastra/memory'
import { intfloatMultilingualE5 } from '../models'
import { postgres, postgresVector } from '../store'

const memory = new Memory({
	storage: postgres,
	vector: postgresVector,
	embedder: intfloatMultilingualE5(),
	options: {
		semanticRecall: {
			topK: 5,
			messageRange: 0,
			scope: 'thread',
		},
		lastMessages: 0,
		workingMemory: { enabled: false },
	},
})

async function ingest({
	resourceId,
	content,
}: {
	resourceId: string
	content: string
}) {
	const threadId = await ensureThread(resourceId)

	return memory.saveMessages({
		messages: [
			{
				threadId,
				resourceId,
				content,

				id: crypto.randomUUID(),
				createdAt: new Date(),
				role: 'assistant',
				type: 'text',
			},
		],
	})
}

async function search({
	resourceId,
	query,
}: {
	resourceId: string
	query: string
}) {
	const threadId = await ensureThread(resourceId)

	const { messages } = await memory.query({
		resourceId,
		threadId,

		selectBy: {
			vectorSearchString: query,
		},

		threadConfig: {
			semanticRecall: true,
		},
	})

	return messages
		.filter(
			(message) => message.role === 'assistant' || message.role === 'user',
		)
		.map((message) => ({
			role: message.role,
			content: message.content,
		}))
}

async function ensureThread(resourceId: string): Promise<string> {
	const threadId = `daily-${resourceId}`

	try {
		const thread = await memory.getThreadById({ threadId })
		if (!thread) {
			await memory.createThread({ threadId, resourceId })
		}
		return threadId
	} catch (error) {
		console.error(`Failed to ensure thread for ${resourceId}:`, error)
		throw error
	}
}

export const dailyRagIngest = ingest
export const dailyRagSearch = search
