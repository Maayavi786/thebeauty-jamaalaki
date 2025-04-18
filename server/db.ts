import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema.js';
import { env } from './config.js';

// Export each table directly for correct typing
export const { users, salons, services, bookings, reviews } = schema;

export const db = drizzle(env.DATABASE_URL, { schema });