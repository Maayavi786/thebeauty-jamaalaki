import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";
import { env } from './config';

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });