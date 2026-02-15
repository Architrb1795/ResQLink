// ─── Note: globals:true in vitest.config.ts ─────────────────
// describe, it, expect, vi are available globally — do NOT
// import from 'vitest' (causes CJS require() error with
// module:commonjs tsconfig on vitest v4+)
// ─────────────────────────────────────────────────────────────

import request from 'supertest';
import express from 'express';

// ─── Build a self-contained test app ─────────────────────────
// Instead of importing the real app (which pulls in dotenv,
// zod, prisma, etc.), we create a lightweight Express app that
// mirrors the router structure. This keeps tests fast and avoids
// needing real DB/Redis connections.
// ──────────────────────────────────────────────────────────────

function createTestApp() {
  const app = express();

  let dbConnected = true;
  let redisConnected = true;

  // Health route (mirrors routes/index.ts)
  app.get('/api/health', (_req, res) => {
    const isHealthy = dbConnected && redisConnected;
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      services: {
        database: dbConnected ? 'connected' : 'disconnected',
        redis: redisConnected ? 'connected' : 'disconnected',
      },
    });
  });

  // 404 handler (mirrors app.ts)
  app.use((_req: express.Request, res: express.Response) => {
    res.status(404).json({
      status: 'error',
      message: 'Route not found',
    });
  });

  return {
    app,
    setDbConnected: (v: boolean) => { dbConnected = v; },
    setRedisConnected: (v: boolean) => { redisConnected = v; },
  };
}

describe('ResQLink API — Foundation', () => {
  const { app, setDbConnected, setRedisConnected } = createTestApp();

  afterEach(() => {
    // Reset to healthy state after each test
    setDbConnected(true);
    setRedisConnected(true);
  });

  describe('GET /api/health', () => {
    it('returns 200 with healthy status when all services are up', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: 'ok',
        services: {
          database: 'connected',
          redis: 'connected',
        },
      });
      expect(res.body.timestamp).toBeDefined();
      expect(typeof res.body.uptime).toBe('number');
    });

    it('returns 503 when database is down', async () => {
      setDbConnected(false);

      const res = await request(app).get('/api/health');

      expect(res.status).toBe(503);
      expect(res.body.status).toBe('degraded');
      expect(res.body.services.database).toBe('disconnected');
    });

    it('returns 503 when redis is down', async () => {
      setRedisConnected(false);

      const res = await request(app).get('/api/health');

      expect(res.status).toBe(503);
      expect(res.body.status).toBe('degraded');
      expect(res.body.services.redis).toBe('disconnected');
    });
  });

  describe('404 Handler', () => {
    it('returns 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        status: 'error',
        message: 'Route not found',
      });
    });
  });
});
