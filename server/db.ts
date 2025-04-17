import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema';
import { env } from './config';

export const db = drizzle(env.DATABASE_URL, { schema });