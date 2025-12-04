import { Kysely, PostgresDialect, sql } from 'kysely'
import { Pool } from 'pg'
import type { DB as GeneratedDB } from './generated'

const dialect = new PostgresDialect({
	pool: new Pool({
		database: process.env.POSTGRES_DB,
		host: 'postgres',
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		port: Number(process.env.POSTGRES_PORT),
		max: 10,
	}),
})

export const db = new Kysely<GeneratedDB>({
	dialect,
})

export async function pingDatabase() {
	try {
		const result = await db
			// @ts-expect-error Корректная системная таблица
			.selectFrom('pg_database')
			// @ts-expect-error
			.select([sql`NOW()`.as('current_time')])
			.limit(1)
			.execute()

		console.log('[db] Current time:', result[0]?.current_time)
	} catch (error) {
		console.error('[db] Failed database:', error)
	}
}
