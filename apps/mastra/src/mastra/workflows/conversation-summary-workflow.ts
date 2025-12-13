import { createStep, createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import { dailyRagIngest } from '../store/dailyRag.store'

const inputSchema = z.object({
	threadId: z.string(),
	resourceId: z.string(),
})

const outputSchema = z.object({
	summary: z.string(),
})

const baseMessageSchema = z.object({
	role: z.enum(['user', 'assistant', 'system']),
	id: z.string(),
	createdAt: z.string(),
	resourceId: z.string(),
	threadId: z.string(),
	type: z.string(),
	content: z.string(),
})

const userMessageSchema = baseMessageSchema.extend({
	role: z.literal('user'),
	content: z.string(),
})

const systemMessageSchema = baseMessageSchema.extend({
	role: z.literal('system'),
	content: z.string(),
})

export const assistantBlockSchema = z.object({
	type: z.enum(['text', 'reasoning']),
	text: z.string(),
	providerMetadata: z.any(),
})

const assistantMessageSchema = baseMessageSchema.extend({
	role: z.literal('assistant'),
	content: z.array(assistantBlockSchema),
})

export const messageSchema = z.discriminatedUnion('role', [
	userMessageSchema,
	systemMessageSchema,
	assistantMessageSchema,
])

type Message = z.infer<typeof messageSchema>

const workflowStateSchema = z.object({
	resourceId: z.string(),
})

const countMessages = createStep({
	id: 'get-messages',
	description: 'Counts the number of messages in the conversation',
	inputSchema: inputSchema,
	outputSchema: z.object({
		messages: z.array(messageSchema),
	}),
	stateSchema: workflowStateSchema,
	execute: async ({ inputData, mastra, state, setState }) => {
		setState({ ...state, resourceId: inputData.resourceId })

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

		const clearMessages = inputData.messages
			.map((message) => {
				if (message.role === 'assistant') {
					return `${message.role}: ${message.content}`
				}

				if (message.role === 'user')
					return `${message.role}: ${message.content}`

				return null
			})
			.filter(Boolean)

		// TODO: добавить обработку если сообщения не помещаются в контекстное окно
		const answer = await agent.generate([
			{
				role: 'user',
				content: `
				ОБРАБОТАЙ ЭТИ СООБЩЕНИЯ С ПОЛЬЗОВАТЕЛЕМ:
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

const saveToRag = createStep({
	id: 'save-to-rag',
	description: 'Saves the conversation summary to the RAG',
	inputSchema: outputSchema,
	outputSchema: outputSchema,
	stateSchema: workflowStateSchema,
	execute: async ({ inputData, state }) => {
		await dailyRagIngest({
			resourceId: state.resourceId,
			content: inputData.summary,
		})

		return inputData
	},
})

const conversationSummaryWorkflow = createWorkflow({
	id: 'conversation-summary-workflow',
	inputSchema: inputSchema,
	outputSchema: outputSchema,
})
	.then(countMessages)
	.then(summary)
	.then(saveToRag)
	.commit()

export { conversationSummaryWorkflow }
