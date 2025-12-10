import { PgVector, PostgresStore } from '@mastra/pg'

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT } =
	process.env

export const postgres = new PostgresStore({
	connectionString: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:${POSTGRES_PORT}/${POSTGRES_DB}`,
})

export const postgresVector = new PgVector({
	connectionString: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:${POSTGRES_PORT}/${POSTGRES_DB}`,
})
