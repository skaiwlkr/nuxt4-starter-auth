import type { Kysely } from 'kysely'
import type { Database } from '../types'
import { sql } from 'kysely'

export async function up(db: Kysely<Database>) {
  // Create users table
  await db.schema
    .createTable('users')
    .addColumn('uuid', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('email', 'varchar(255)', col => col.notNull().unique())
    .addColumn('email_verified', 'timestamptz')
    .addColumn('password', 'varchar(255)', col => col.notNull())
    .addColumn('first_name', 'varchar(255)')
    .addColumn('last_name', 'varchar(255)')
    .addColumn('terms_of_service', 'timestamptz')
    .addColumn('privacy_policy', 'timestamptz')
    .addColumn('flags', 'text')
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz')
    .execute()
}

export async function down(db: Kysely<Database>) {
  // Drop users table
  await db.schema.dropTable('users').execute()
}
