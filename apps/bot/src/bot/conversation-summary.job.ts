import { MastraClient } from '@mastra/client-js'
import z from 'zod'
import { db } from '../../infra/database/db'
import { defineJob } from '../../infra/queue/pg-boss'
import { getThreadId } from '../utils/get-thread-id'
import { env } from '../utils/parse-env'
import { bot } from './bot'

export const conversationSummaryJob = defineJob('conversation_summary')
	.input(z.object({ userId: z.number(), date: z.date() }))
	.options({ retryLimit: 0 })
	.work(async ([job]) => {
		if (!job) throw new Error('No job data provided')

		const { userId, date } = job.data

		try {
			bot.api.sendChatAction(userId, 'typing')
			const summary = await runWorkflow(userId, date)

			bot.api.sendMessage(userId, summary, {
				disable_notification: true,
			})
		} catch {
			bot.api.sendMessage(
				userId,
				'Упс! Произошла ошибка во время подведения итогов',
			)
		}
	})

async function runWorkflow(userId: number | string, date: Date) {
	const mastraClient = new MastraClient({
		baseUrl: env.MASTRA_URL,
	})

	const workflow = mastraClient.getWorkflow('conversationSummaryWorkflow')
	const response = await workflow.createRunAsync()

	const threadId = getThreadId(userId, date)
	const resourceId = String(userId)

	const answer = await response.startAsync({
		inputData: {
			threadId: threadId,
			resourceId: resourceId,
		},
	})

	if (answer.status !== 'success' || !answer.result.summary) {
		throw new Error('Workflow failed')
	}

	return answer.result.summary
}
