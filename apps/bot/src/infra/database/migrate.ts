// migrate.ts

import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { FileMigrationProvider, Migrator } from 'kysely'
import { db } from './db'
import { generateTypes } from './generate-type'

const MIGRATION_FOLDER = path.join(__dirname, 'migrations')

export async function migrateToLatest() {
	console.log('[migrate] Starting migrations...')

	const migrator = new Migrator({
		db,
		provider: new FileMigrationProvider({
			fs,
			path,
			migrationFolder: MIGRATION_FOLDER,
		}),
	})

	const { error, results } = await migrator.migrateToLatest()

	results?.forEach((res) => {
		if (res.status === 'Success') {
			console.log(
				`[migrate] Migration "${res.migrationName}" executed successfully`,
			)
			generateTypes()
		} else if (res.status === 'Error') {
			console.error(
				`[migrate] Failed to execute migration "${res.migrationName}"`,
			)
			console.error(res)
		}
	})

	if (error) {
		console.error('[migrate] Migration failed')
		console.error(error)
		await db.destroy()
		process.exit(1)
	}

	if (!error && results?.length === 0) {
		console.log('[migrate] No migrations found')
	}

	await db.destroy()
}
