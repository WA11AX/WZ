import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await db.execute('SELECT 1');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    // Попробуем переподключиться через несколько секунд
    if (error instanceof Error && error.message.includes('connection')) {
      console.log('Attempting to reconnect to database...');
      setTimeout(async () => {
        try {
          await db.execute('SELECT 1');
          console.log('Database reconnection successful');
        } catch (retryError) {
          console.error('Database reconnection failed:', retryError);
        }
      }, 5000);
    }
    return false;
  }
}