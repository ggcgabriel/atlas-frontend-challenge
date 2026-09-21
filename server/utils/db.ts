import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../database/schema'

type Database = ReturnType<typeof drizzle<typeof schema>>

let _client: ReturnType<typeof postgres> | undefined
let _db: Database | undefined

/**
 * Lazily-created, process-wide Drizzle instance.
 *
 * The singleton is the point: on a serverless host a fresh pool per invocation
 * exhausts Postgres' connection slots long before traffic does. `max: 10` keeps
 * a warm container well inside the default limit of 100.
 */
export function useDatabase(): Database {
  if (_db) return _db

  const url = useRuntimeConfig().databaseUrl
  if (!url) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'databaseUrl is not configured. Set NUXT_DATABASE_URL (see .env.example).',
    })
  }

  _client = postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  })
  _db = drizzle(_client, { schema })

  return _db
}

export { schema }
