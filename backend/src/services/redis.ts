import { Redis } from '@upstash/redis';
import { env } from '../config/env';

// ─── Upstash Redis Client ─────────────────────────────────────────
// Serverless-friendly HTTP-based Redis client.
// Works in both Node.js and edge runtimes (Vercel, Cloudflare, etc.).
// No persistent TCP connection needed — each call is an HTTP request.
// ───────────────────────────────────────────────────────────────────

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

if (env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Health check helper
export const checkRedisConnection = async (): Promise<boolean> => {
  try {
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
};
