
import '@/server/db/envConfig';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config';
import { getSupabaseAdmin } from '../supabase';
import * as schema from './schema';

// Connection pool configuration
// These settings help prevent "Max client connections reached" errors
const poolConfig = {
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  max_lifetime: 60 * 30, // Close connections after 30 minutes
};

// Create a singleton postgres client with connection pooling
// This ensures we only have one connection pool shared across the application
let postgresClient: postgres.Sql | null = null;

function getPostgresClient(): postgres.Sql {
  if (!postgresClient) {
    const connectionString = config.database.url;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined');
    }

    postgresClient = postgres(connectionString, poolConfig);
  }

  return postgresClient;
}

// For server-side use with Drizzle ORM
// Note: This now uses the singleton client to prevent connection pool exhaustion
export const getDbClient = () => {
  const client = getPostgresClient();
  return drizzle(client, {
    schema,
    casing: 'snake_case'
  });
};

// Lazy singleton – avoids crashing the build when DATABASE_URL is not set
// (e.g. during Next.js static page collection).
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    _db = drizzle(getPostgresClient(), {
      schema,
      casing: 'snake_case',
    });
  }
  return _db;
}

/** @deprecated Use getDb() for lazy initialization. Kept for existing callers. */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

// Export type helper
export type DbClient = ReturnType<typeof getDb>;

// For use in Server Components with Supabase
export const getServerClient = async () => {
  return getSupabaseAdmin();
};

// Lazy migration client – only created when actually needed (CLI scripts).
let _migrationClient: postgres.Sql | null = null;
export function getMigrationClient() {
  if (!_migrationClient) {
    _migrationClient = postgres(config.database.url, { max: 1 });
  }
  return _migrationClient;
} 