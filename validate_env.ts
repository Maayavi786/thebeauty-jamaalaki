import { z } from 'zod';
import * as dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
dotenv.config();

// Define validation schema
const envSchema = z.object({
  // Required variables
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(64),
  JWT_SECRET: z.string().min(32),
  VITE_API_BASE_URL: z.string().url(),
  VITE_WS_URL: z.string().url(),

  // Optional variables
  PORT: z.string().default('5000'),
});

async function validateDatabaseConnection(url: string) {
  try {
    const sql = neon(url);
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

async function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');

  // Validate schema
  try {
    const env = envSchema.parse(process.env);
    console.log('✅ Environment variables schema validation passed');

    // Validate database connection
    console.log('\n🔌 Testing database connection...');
    const dbValid = await validateDatabaseConnection(env.DATABASE_URL);
    if (dbValid) {
      console.log('✅ Database connection successful');
    } else {
      console.error('❌ Database connection failed');
    }

    // Validate URLs
    console.log('\n🌐 Validating API URLs...');
    if (env.VITE_API_BASE_URL.startsWith('https://')) {
      console.log('✅ VITE_API_BASE_URL is valid');
    } else {
      console.error('❌ VITE_API_BASE_URL must start with https://');
    }

    if (env.VITE_WS_URL.startsWith('wss://')) {
      console.log('✅ VITE_WS_URL is valid');
    } else {
      console.error('❌ VITE_WS_URL must start with wss://');
    }

    // Check for production settings
    if (env.NODE_ENV === 'production') {
      console.log('\n🏭 Checking production settings...');
      if (env.SESSION_SECRET !== 'development_secret_key_change_in_production') {
        console.log('✅ SESSION_SECRET is properly set for production');
      } else {
        console.error('❌ SESSION_SECRET is using development value');
      }
    }

    console.log('\n✨ Environment validation complete!');
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('\n❌ Validation errors:');
      error.errors.forEach((err) => {
        console.error(`- ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('\n❌ Unexpected error:', error);
    }
    return false;
  }
}

// Run validation
validateEnvironment().then((success) => {
  process.exit(success ? 0 : 1);
}); 