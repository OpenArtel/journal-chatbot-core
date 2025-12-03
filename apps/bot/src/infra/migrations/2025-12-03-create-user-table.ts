import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('user')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
		.addColumn('name', 'varchar(255)', (col) => col.notNull())
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('user').execute()
}
