import type { Kysely } from 'kysely'
import type { MigrationParams, UmzugStorage } from 'umzug'
import { sql } from 'kysely'

export class KyselyMigrationStorage implements UmzugStorage {
  // Creates a new instance of KyselyMigrationStorage.
  constructor(
    private db: Kysely<any>,
    private table = 'migrations',
  ) {}

  // Creates the table if it doesn't exist with the required columns:
  async ensureTable() {
    const result = await this.db
      .selectFrom('pg_tables')
      .select('tablename')
      .where('schemaname', '=', 'public')
      .where('tablename', '=', this.table)
      .execute()

    const exists = result.length > 0

    if (!exists) {
      await this.db.schema
        .createTable(this.table)
        .addColumn('name', 'varchar', col => col.primaryKey())
        .addColumn('executed_at', 'timestamptz', col => col.defaultTo(sql`now()`))
        .execute()
    }
  }

  // Logs a migration as executed in the database.
  async logMigration({ name }: MigrationParams<unknown>) {
    await this.ensureTable()
    await this.db.insertInto(this.table).values({ name }).execute()
  }

  // Removes a migration from the executed migrations list.
  async unlogMigration({ name }: MigrationParams<unknown>) {
    await this.db.deleteFrom(this.table).where('name', '=', name).execute()
  }

  // Retrieves a list of all executed migrations.
  async executed(): Promise<string[]> {
    await this.ensureTable()
    const rows = await this.db.selectFrom(this.table).select('name').execute()
    return rows.map(row => row.name)
  }
}
