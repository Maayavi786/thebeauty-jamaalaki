import { db } from './server/db';
import { users } from '@shared/schema';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await db.select().from(users);
    console.log('Successfully connected to database');
    console.log('Users:', result);
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

testConnection();
