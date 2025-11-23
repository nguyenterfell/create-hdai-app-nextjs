import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/schema/users';

let cachedClient: postgres.Sql | null = null;
let cachedDb: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Reuse connection if it exists
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  // Create new connection
  const client = postgres(databaseUrl, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  });

  cachedClient = client;
  cachedDb = drizzle(client, { schema });

  return cachedDb;
}

export async function closeDatabase() {
  if (cachedClient) {
    await cachedClient.end();
    cachedClient = null;
    cachedDb = null;
  }
}


