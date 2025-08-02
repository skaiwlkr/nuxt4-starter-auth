import type { Database } from './types'
import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'

// Ensure DATABASE_URL environment variable is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is undefined')
}

// Configure PostgreSQL dialect with connection pool
const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,

    // Enable SSL in production environment
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  }),
})

// Initialize Kysely database instance with type-safe database interface
export const db = new Kysely<Database>({
  dialect,
})
