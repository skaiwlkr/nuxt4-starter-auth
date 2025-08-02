import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Create email_verifications table
  await db.schema
    .createTable('email_verifications')
    .addColumn('uuid', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_uuid', 'uuid', col => col.notNull())
    .addColumn('token', 'varchar(255)', col => col.notNull())
    .addColumn('expires_at', 'timestamptz', col => col.notNull())
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addForeignKeyConstraint(
      'email_verifications_user_uuid_fk',
      ['user_uuid'],
      'users',
      ['uuid'],
      cb => cb.onDelete('cascade'),
    )
    .execute()

  // Create indexes
  await db.schema
    .createIndex('idx_email_verifications_token')
    .on('email_verifications')
    .column('token')
    .execute()

  await db.schema
    .createIndex('idx_email_verifications_user_uuid')
    .on('email_verifications')
    .column('user_uuid')
    .execute()

  // Drop old columns (without data migration)
  try {
    await db.schema
      .alterTable('users')
      .dropColumn('email_verification_token')
      .dropColumn('email_verification_expires')
      .execute()
  }
  catch {
    // Ignore error if columns do not exist
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  // Add old columns
  await db.schema
    .alterTable('users')
    .addColumn('email_verification_token', 'varchar(255)')
    .addColumn('email_verification_expires', 'timestamptz')
    .execute()

  // Drop email_verifications table
  await db.schema.dropTable('email_verifications').execute()
}
