import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const __dirname = dirname(fileURLToPath(import.meta.url));

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set');
  console.error('Please set DATABASE_URL in your .env file with your Neon connection string');
  process.exit(1);
}

console.log('Attempting to connect to database...');
console.log('Connection string:', process.env.DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

// Create Neon client
const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('Database connection test successful:', result);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

function splitSQLStatements(sqlContent: string): string[] {
  // Split on semicolons that are not inside quotes or comments
  const statements = sqlContent
    .split(';')
    .map(statement => statement.trim())
    .filter(statement => statement.length > 0);
  return statements;
}

async function runMigrations() {
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    console.log('Starting migrations...');

    // Read migration file
    const migrationPath = join(__dirname, '../migrations/001_initial_schema.sql');
    console.log(`Reading migration file from: ${migrationPath}`);
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Split into individual statements
    const statements = splitSQLStatements(migrationSQL);
    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}`);
      try {
        await sql(statement);
        console.log(`Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        throw error;
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

runMigrations()
  .then(() => {
    console.log('Migrations completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 