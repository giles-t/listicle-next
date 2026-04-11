
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

// Lazy singleton database instance — must not be created at module scope
// because DATABASE_URL is unavailable during the Next.js build step.
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    _db = drizzle(getPostgresClient(), {
      schema,
      casing: 'snake_case'
    });
  }
  return _db;
}

// Re-export as `db` using a getter so existing imports continue to work
// without requiring changes at every call site.
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
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

// Lazy migration client — only needed for drizzle-kit commands, not during builds
let _migrationClient: postgres.Sql | null = null;
export function getMigrationClient() {
  if (!_migrationClient) {
    _migrationClient = postgres(config.database.url, { max: 1 });
  }
  return _migrationClient;
} 