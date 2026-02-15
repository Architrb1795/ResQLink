import { createServer } from 'http';
import morgan from 'morgan';
import { app } from './app';
import { env } from './config/env';
import { initializeSocket } from './modules/realtime/socket';
import { startAIWorker } from './workers/aiWorker';

// ─── Logging ──────────────────────────────────────────────────
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Server Start ─────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  const httpServer = createServer(app);

  // Attach Socket.IO to HTTP server
  initializeSocket(httpServer);

  // Start AI confidence worker (listens for incident events)
  startAIWorker();

  httpServer.listen(env.PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════╗
    ║   ResQLink API Server                    ║
    ║   Port: ${env.PORT}                            ║
    ║   Env:  ${env.NODE_ENV.padEnd(30)}║
    ║   Health: http://localhost:${env.PORT}/api/health ║
    ║   Socket.IO: ws://localhost:${env.PORT}          ║
    ╚══════════════════════════════════════════╝
    `);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
    httpServer.close(() => {
      console.log('✅ HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

export { app };
