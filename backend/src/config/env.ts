import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Validates all required environment variables at startup.
 * App will crash immediately if any variable is missing or invalid.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5001'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(16, 'COOKIE_SECRET must be at least 16 characters'),
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL').default('http://localhost:3000'),
  USER_ID_PREFIX: z.string().default('Bus'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌  Invalid / missing environment variables:\n');
  const errors = parsed.error.flatten().fieldErrors;
  Object.entries(errors).forEach(([key, msgs]) => {
    console.error(`  ${key}: ${(msgs ?? []).join(', ')}`);
  });
  console.error('\nCheck .env.example for required variables.\n');
  process.exit(1);
}

export const env = parsed.data;
