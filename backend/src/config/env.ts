import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env from the backend directory
dotenv.config();

// ─── Schema ───────────────────────────────────────────────────────
// Validates and types every required environment variable at startup.
// If anything is missing or malformed, the server crashes immediately
// with a clear error — no silent failures at runtime.
// ──────────────────────────────────────────────────────────────────

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database (Neon Postgres)
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid Postgres connection string'),

  // Redis (Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL is required'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required'),

  // Auth
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(16).default('refresh-secret-change-me-in-production'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // External APIs — all optional, services degrade gracefully
  OPENWEATHER_KEY: z.string().optional(),
  ORS_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  FCM_SERVICE_ACCOUNT_JSON: z.string().optional(),

  // Legacy — kept for backward compat
  OPENAI_KEY: z.string().optional(),
});

// ─── Parse & Export ───────────────────────────────────────────────
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
