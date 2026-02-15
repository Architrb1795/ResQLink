// ─── Test Setup ───────────────────────────────────────────────────
// Sets environment variables BEFORE any application code loads.
// This ensures Zod validation in env.ts passes during tests.
// ──────────────────────────────────────────────────────────────

process.env.PORT = '4000';
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token-placeholder';
process.env.JWT_SECRET = 'test-secret-minimum-16-chars';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret-16-chars';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
