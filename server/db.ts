import { sql } from 'drizzle-orm';
import * as schema from "@shared/schema";

// Conditional imports based on which database we're using
const isSupabase = !!process.env.SUPABASE_DATABASE_URL;

let pool: any;
let db: any;

if (isSupabase) {
  // Use standard PostgreSQL for Supabase
  const { Pool } = await import('pg');
  const { drizzle } = await import('drizzle-orm/node-postgres');
  
  const databaseUrl = process.env.SUPABASE_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("SUPABASE_DATABASE_URL must be set.");
  }
  
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle(pool, { schema });
} else {
  // Use Neon for other databases
  const { Pool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-serverless');
  const ws = await import('ws');
  
  neonConfig.webSocketConstructor = ws.default;
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be set.");
  }
  
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
}

export { pool, db };

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await db.execute(sql`SELECT 1`);
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