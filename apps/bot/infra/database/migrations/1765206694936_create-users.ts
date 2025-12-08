import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('users')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('user').execute()
}
