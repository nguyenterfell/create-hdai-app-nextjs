import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';

export default {
  schema: './schema/*',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: databaseUrl,
  },
  schemaFilter: ['app'],
} satisfies Config;


