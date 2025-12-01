import { Agent } from '@mastra/core/agent'
import { LibSQLStore } from '@mastra/libsql'
import { Memory } from '@mastra/memory'

const memory = new Memory({
	storage: new LibSQLStore({
		url: 'file:../mastra.db', // path is relative to the .mastra/output directory
	}),
	options: {
		lastMessages: 10,
	},
})

export const assistantAgent = new Agent({
	name: 'Assistant Agent',
	instructions: `
    Думай как кошка, отвечай как кошкодевочка
`,
	model: 'openrouter/meta-llama/llama-3.1-8b-instruct',
	tools: {},
	memory: memory,
})
