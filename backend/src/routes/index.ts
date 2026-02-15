import { Router } from 'express';
import { checkDatabaseConnection } from '../services/db';
import { checkRedisConnection } from '../services/redis';

// ─── Module Routers ───────────────────────────────────────────
import authRouter from '../modules/auth/auth.routes';
import incidentRouter from '../modules/incidents/incident.routes';
import mapRouter from '../modules/map/map.routes';
import logisticsRouter from '../modules/logistics/logistics.routes';
import uploadRouter from '../modules/uploads/upload.routes';
import auditRouter from '../modules/audit/audit.routes';
import geoRouter from '../modules/geo/geo.routes';
import etaRouter from '../modules/logistics/eta.routes';
import notificationRouter from '../modules/notifications/notification.routes';
import feedsRouter from '../modules/feeds/feeds.routes';

// ─── API Router ───────────────────────────────────────────────────
// Central mount point for all API sub-routers.
// ──────────────────────────────────────────────────────────────────

const router = Router();

// ─── Health Check ─────────────────────────────────────────────────
router.get('/health', async (_req, res) => {
  const [dbConnected, redisConnected] = await Promise.all([
    checkDatabaseConnection(),
    checkRedisConnection(),
  ]);

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

// ─── Module Route Mounts ──────────────────────────────────────────
router.use('/auth', authRouter);
router.use('/incidents', incidentRouter);
router.use('/map', mapRouter);
router.use('/logistics', logisticsRouter);
router.use('/logistics/eta', etaRouter);
router.use('/uploads', uploadRouter);
router.use('/audit', auditRouter);
router.use('/geo', geoRouter);
router.use('/notifications', notificationRouter);
router.use('/feeds', feedsRouter);

export default router;
