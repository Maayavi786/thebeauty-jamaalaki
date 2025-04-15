import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  VITE_API_BASE_URL: z.string().url(),
  VITE_WS_URL: z.string().url().optional(),
  ENABLE_SENTRY: z.boolean().default(false),
  SENTRY_DSN: z.string().url().optional(),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
  VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,
  VITE_WS_URL: process.env.VITE_WS_URL,
  ENABLE_SENTRY: process.env.ENABLE_SENTRY === 'true',
  SENTRY_DSN: process.env.SENTRY_DSN,
});
