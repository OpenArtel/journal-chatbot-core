import { z } from 'zod'

const envSchema = z.object({
	OPENROUTER_API_KEY: z.string().min(1),

	BOT_TOKEN: z.string().min(1),
	MASTRA_URL: z.string().min(1),
	MASTRA_PORT: z.coerce.number().min(1),

	POSTGRES_USER: z.string().min(1),
	POSTGRES_PASSWORD: z.string().min(1),
	POSTGRES_PORT: z.coerce.number().min(1),
	POSTGRES_DB: z.string().min(1),
})

export type Env = z.infer<typeof envSchema>

const result = envSchema.safeParse(process.env)

if (!result.success) {
	console.error(
		'❌ ENV validation error: failed to parse environment variables',
	)
	console.error('Details:')
	console.error(result?.error)
}

export const env = result.data as Env
