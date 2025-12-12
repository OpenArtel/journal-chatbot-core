import { createStep, createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import { dailyRagSearch } from '../store/dailyRag.store'

const inputSchema = z.object({
	resourceId: z.string(),
	query: z.string(),
})

const outputSchema = z.object({
	summary: z.string(),
})

const oneStep = createStep({
	id: 'one-step',
	description: 'Does nothing',
	inputSchema: inputSchema,
	outputSchema: outputSchema,
	execute: async ({ inputData }) => {
		const { resourceId, query } = inputData

		const answer = await dailyRagSearch({
			resourceId,
			query,
		})

		return { summary: JSON.stringify(answer) }
	},
})

const searchWorkflow = createWorkflow({
	id: 'search-workflow',
	inputSchema: inputSchema,
	outputSchema: outputSchema,
}).then(oneStep)

searchWorkflow.commit()

export { searchWorkflow }
