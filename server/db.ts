import { Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

import { dbConfig } from './config';

neonConfig.webSocketConstructor = ws;

// Create connection pool with validated configuration
export const pool = new Pool({
  connectionString: dbConfig.url,
  ssl: dbConfig.ssl,
});
export const db = drizzle({ client: pool, schema });

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    // Попробуем переподключиться через несколько секунд
    if (error instanceof Error && error.message.includes('connection')) {
      console.log('Attempting to reconnect to database...');
      setTimeout(async () => {
        try {
          await db.execute(sql`SELECT 1`);
          console.log('Database reconnection successful');
        } catch (retryError) {
          console.error('Database reconnection failed:', retryError);
        }
      }, 5000);
    }
    return false;
  }
}
