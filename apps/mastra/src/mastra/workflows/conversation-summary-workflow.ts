import { createStep, createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'

const inputSchema = z.object({
	threadId: z.string(),
	resourceId: z.string(),
})

const outputSchema = z.object({
	summary: z.string(),
})

const messageSchema = z.object({
	role: z.enum(['user', 'assistant', 'system']),
	id: z.string(),
	createdAt: z.string(),
	resourceId: z.string(),
	threadId: z.string(),
	type: z.string(),
	content: z.string(),
})

type Message = z.infer<typeof messageSchema>

const countMessages = createStep({
	id: 'get-messages',
	description: 'Counts the number of messages in the conversation',
	inputSchema: inputSchema,
	outputSchema: z.object({
		messages: z.array(messageSchema),
	}),
	execute: async ({ inputData, mastra }) => {
		const agent = mastra.getAgent('assistantAgent')

		const memory = await agent.getMemory()
		if (!memory) throw new Error('Memory not found')

		const { messages } = await memory.query({
			threadId: inputData.threadId,
			resourceId: inputData.resourceId,
		})

		if (messages.length === 0) throw new Error('No messages found')

		return {
			// переопределяю тип т.к. нет возможности вытащить схему из библиотеки
			messages: messages as Message[],
		}
	},
})

const summary = createStep({
	id: 'summary',
	description: 'Generates a summary of the conversation',
	inputSchema: z.object({
		messages: z.array(messageSchema),
	}),
	outputSchema: outputSchema,
	execute: async ({ inputData, mastra }) => {
		const agent = mastra.getAgent('conversationSummaryAgent')

		const clearMessages = inputData.messages.map((message) => {
			return `${message.role}: ${message.content}`
		})

		// TODO: добавить обработку если сообщения не помещаются в контекстное окно
		const answer = await agent.generate([
			{
				role: 'user',
				content: `
				ОБРАБОТАЙ ЭТУ ПЕРЕПИСКУ:
				${clearMessages.join('\n')}
				`,
			},
		])

		const formatedAnswer = answer.text.replace(/\*\*/g, '')

		return {
			summary: formatedAnswer,
		}
	},
})

const conversationSummaryWorkflow = createWorkflow({
	id: 'conversation-summary-workflow',
	inputSchema: inputSchema,
	outputSchema: outputSchema,
})
	.then(countMessages)
	.then(summary)

conversationSummaryWorkflow.commit()

export { conversationSummaryWorkflow }
