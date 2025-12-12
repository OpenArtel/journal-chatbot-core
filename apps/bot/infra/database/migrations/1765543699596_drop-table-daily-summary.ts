import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	db.schema.dropTable('daily_summary').execute()
}

export async function down(db: Kysely<any>): Promise<void> {}
