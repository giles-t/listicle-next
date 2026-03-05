
import '@/server/db/envConfig';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config';
import { supabaseAdmin } from '../supabase';
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

// Lazy database instance - defers initialization until first use to avoid build-time errors
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
function getDb() {
  if (!_db) {
    _db = drizzle(getPostgresClient(), {
      schema,
      casing: 'snake_case'
    });
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

// Export type helper
export type DbClient = ReturnType<typeof drizzle<typeof schema>>;

// For use in Server Components with Supabase
export const getServerClient = async () => {
  return supabaseAdmin;
};

// For migrations and schema generation only - lazy to avoid build-time errors
export const getMigrationClient = () => postgres(config.database.url, { max: 1 }); 