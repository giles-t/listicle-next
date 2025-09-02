
import '@/server/db/envConfig';
import { config } from '@/server/config';
import { defineConfig } from 'drizzle-kit';

console.log('db url', config.database.url);

export default defineConfig({
  out: './drizzle',
  schema: './src/server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.database.url,
  },
});
