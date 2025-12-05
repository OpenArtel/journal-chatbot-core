import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
})

export const llama8 = openrouter('meta-llama/llama-3.1-8b-instruct', {
	extraBody: {
		temperature: 0.3,
		max_tokens: 256,
	},
	provider: {
		sort: 'price',
	},
})

export const llama8withoutMaxTokens = openrouter(
	'meta-llama/llama-3.1-8b-instruct',
	{
		extraBody: {
			temperature: 0,
		},
		provider: {
			sort: 'price',
		},
	},
)
