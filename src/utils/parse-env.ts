import { z } from 'zod'

const envSchema = z.object({
	// PORT: z.coerce.number().int().positive(),
	BOT_TOKEN: z.string().min(1),
})

export type Env = z.infer<typeof envSchema>

const result = envSchema.safeParse(process.env)

if (!result.success) {
	console.error(
		'❌ ENV validation error: failed to parse environment variables',
	)
	console.error('Details:')
	console.error(result?.error)

	// process.exit(1);
}

export const env = result.data as Env
