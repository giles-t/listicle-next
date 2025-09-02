
import '@/server/db/envConfig';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config';
import { supabaseAdmin } from '../supabase';
import * as schema from './schema';

// For server-side use with Drizzle ORM
export const getDbClient = () => {
  const connectionString = config.database.url;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  // Connect to Postgres
  const client = postgres(connectionString);
  // Initialize drizzle with the client and schema
  return drizzle(client, { 
    schema,
    casing: 'snake_case'
  });
};

// Create database instance
const client = postgres(config.database.url);
export const db = drizzle(client);

// Export type helper
export type DbClient = typeof db;

// For use in Server Components with Supabase
export const getServerClient = async () => {
  return supabaseAdmin;
};

// For migrations and schema generation only
export const migrationClient = postgres(config.database.url, { max: 1 }); 