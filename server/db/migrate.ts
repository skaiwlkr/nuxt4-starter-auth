import { createRequire } from 'module'
import { Umzug } from 'umzug'
import 'dotenv/config'
import { db } from './index'
import { KyselyMigrationStorage } from './kysely-storage'

// Create require function for ESM compatibility
const require = createRequire(import.meta.url)

// Initialize the Umzug migrator with configuration
export const migrator = new Umzug({
  migrations: {
    glob: 'server/db/migrations/*.ts',
    resolve: ({ name, path: migrationPath, context }) => {
      const migration = require(migrationPath!)
      return {
        name,
        up: async () => migration.up(context),
        down: async () => migration.down(context),
      }
    },
  },
  context: db,
  storage: new KyselyMigrationStorage(db),
  logger: console,
})

// Script execution detection and command line argument parsing
const isRunDirectly = import.meta.url === `file://${process.argv[1]}`
const direction = ['up', 'down', 'list'].includes(process.argv[2]) ? process.argv[2] : 'up'
const migrationName = process.argv[3]

async function main() {
  if (!isRunDirectly) return

  // Handle 'list' command to show migration status
  if (direction === 'list') {
    try {
      const executed = await migrator.executed()
      const pending = await migrator.pending()

      if (executed.length === 0 && pending.length === 0) {
        console.log('🧠 No migrations have been carried out yet and there are no pending migrations.')
      } else {
        if (executed.length > 0) {
          console.log('📄 Executed migrations:')
          for (const migration of executed) {
            console.log(`✅ ${migration.name}`)
          }
        }

        if (pending.length > 0) {
          console.log('\n⏳ Pending migrations:')
          for (const migration of pending) {
            console.log(`⏳ ${migration.name}`)
          }
        }
      }
      process.exit(0)
    } catch (err) {
      console.error('❌ Error when retrieving the migrations')
      console.error(err)
      process.exit(1)
    }
  } else {
    // Handle up/down migration commands
    try {
      console.log('🧠 Executing migrations')
      let list = direction === 'down' ? await migrator.executed() : await migrator.pending()

      // Filter for specific migration if name is provided
      if (migrationName) {
        list = list.filter(m => m.name === migrationName)
        if (list.length === 0) {
          console.log(`❌ Migration '${migrationName}' not found`)
          process.exit(1)
        }
      }

      if (list.length === 0) {
        console.log(`🧠 No migrations for '${direction}' available`)
        process.exit(0)
      }

      // Execute down migrations
      if (direction === 'down') {
        for (const migration of [...list].reverse()) {
          try {
            await migrator.down({ migrations: [migration.name] })
            console.log(`✅ Migration ${direction} done: ${migration.name}`)
          } catch (err) {
            console.error(`❌ Error when migrating (${direction}): ${migration.name}`)
            console.error(err)
            process.exit(1)
          }
        }
      } else {
        // Execute up migrations
        for (const migration of list) {
          try {
            await migrator.up({ migrations: [migration.name] })
            console.log(`✅ Migration ${direction} done: ${migration.name}`)
          } catch (err) {
            console.error(`❌ Error when migrating (${direction}): ${migration.name}`)
            console.error(err)
            process.exit(1)
          }
        }
      }

      process.exit(0)
    } catch (err) {
      console.error(`❌ Error when executing migrations (${direction})`)
      console.error(err)
      process.exit(1)
    }
  }
}

if (isRunDirectly) {
  main().catch((err) => {
    console.error('Unhandled error:', err)
    process.exit(1)
  })
}
