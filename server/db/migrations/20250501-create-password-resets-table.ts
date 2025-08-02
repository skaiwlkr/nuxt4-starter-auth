import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Create password_resets table
  await db.schema
    .createTable('password_resets')
    .addColumn('uuid', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('token', 'varchar(255)', col => col.notNull().unique())
    .addColumn('user_uuid', 'uuid', col => col.notNull())
    .addColumn('expires_at', 'timestamptz', col => col.notNull())
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addForeignKeyConstraint(
      'password_resets_user_uuid_fk',
      ['user_uuid'],
      'users',
      ['uuid'],
      cb => cb.onDelete('cascade'),
    )
    .execute()

  // Create indexes
  await db.schema
    .createIndex('idx_password_resets_token')
    .on('password_resets')
    .column('token')
    .execute()

  // Create index
  await db.schema
    .createIndex('idx_password_resets_user_uuid')
    .on('password_resets')
    .column('user_uuid')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop password_resets table
  await db.schema.dropTable('password_resets').execute()
}
