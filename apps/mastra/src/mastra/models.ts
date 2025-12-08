import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
})

export const llama8 = (extraBody?: object) =>
	openrouter('meta-llama/llama-3.1-8b-instruct', {
		extraBody: Object.assign(
			{
				temperature: 0.3,
				max_tokens: 256,
			},
			extraBody,
		),
		provider: {
			sort: 'price',
		},
	})

export const gptOss120 = (extraBody?: object) =>
	openrouter('openai/gpt-oss-120b', {
		extraBody: Object.assign(
			{
				temperature: 0.3,
				max_tokens: 256,
			},
			extraBody,
		),
		provider: {
			sort: 'price',
		},
	})
