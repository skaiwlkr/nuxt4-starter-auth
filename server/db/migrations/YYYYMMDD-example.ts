// Name this file like this: YYYYMMDD-description.ts
import type { Kysely } from 'kysely'
import type { Database } from '../types'
import { sql } from 'kysely'

export async function up(db: Kysely<Database>) {
  // Create users table
  await db.schema
    .createTable('users')
    .addColumn('uuid', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('first_name', 'varchar(255)')
    .addColumn('last_name', 'varchar(255)')
    .execute()
}

export async function down(db: Kysely<Database>) {
  // Drop users table
  await db.schema.dropTable('users').execute()
}
