import { spawn } from 'bun'

export async function generateTypes() {
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
