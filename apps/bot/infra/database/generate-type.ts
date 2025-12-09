import { spawn } from 'bun'
import { isDev } from '../../src/utils/is-dev'

export async function generateTypes() {
	if (!isDev) return

	console.log('[kysely-codegen] 🔄 Generating types...')

	const proc = spawn(['bun', 'run', 'kysely:generate'], {
		stdout: 'inherit',
		stderr: 'inherit',
	})

	const exitCode = await proc.exited

	if (exitCode === 0) {
		console.log('[kysely-codegen] ✅ Types generated')
	} else {
		throw new Error('[kysely-codegen] ❌ Codegen failed')
	}
}
