import { createStep, createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import { dailyRagIngest } from '../store/dailyRag.store'

const inputSchema = z.object({
	resourceId: z.string(),
	content: z.string(),
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
		const { resourceId, content } = inputData

		await dailyRagIngest({
			resourceId,
			content: content,
		})

		return { summary: JSON.stringify(inputData) }
	},
})

const ingestWorkflow = createWorkflow({
	id: 'ingest-workflow',
	inputSchema: inputSchema,
	outputSchema: outputSchema,
}).then(oneStep)

ingestWorkflow.commit()

export { ingestWorkflow }
