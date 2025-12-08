import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('daily_summary')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn('user_id', 'text', (col) =>
			col.notNull().references('users.id').onDelete('cascade'),
		)
		.addColumn('summary_date', 'date', (col) => col.notNull())
		.addColumn('summary', 'text', (col) => col.notNull())
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.execute()

	await db.schema
		.alterTable('daily_summary')
		.addUniqueConstraint('daily_summary_user_date_unique', [
			'user_id',
			'summary_date',
		])
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('daily_summary').execute()
}
