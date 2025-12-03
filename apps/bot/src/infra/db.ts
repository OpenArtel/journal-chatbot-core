import { Kysely, PostgresDialect } from 'kysely'
import type { DB as GeneratedDB } from 'kysely-codegen'
import { Pool } from 'pg'

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
