import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { dailyRagSearch } from '../store/dailyRag.store'

export const dailyTool = createTool({
	id: 'daily-tool',
	description: `
Семантический поиск по итогам прошлых дней. 
Вызывай, когда есть ссылка на прошлое или не уверен в контексте.
`,
	inputSchema: z.object({
		input: z.string(),
	}),
	outputSchema: z.object({
		output: z.string(),
	}),
	execute: async ({ mastra, context: { input }, resourceId }) => {
		if (!mastra || !resourceId) throw new Error('Missing mastra or threadId')

		const messages = await dailyRagSearch({
			resourceId,
			query: input,
		})

		return {
			output: messages.map((m) => `${m.role}: ${m.content}`).join('\n'),
		}
	},
})
