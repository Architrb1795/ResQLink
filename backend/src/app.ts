import 'express-async-errors'; // Must be imported before any routes
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import apiRouter from './routes/index';

// ─── Express App ──────────────────────────────────────────────────
// This file only creates and configures the Express app.
// It does NOT call app.listen() — that's done in index.ts.
// This separation allows tests to import the app without starting a server.
// ──────────────────────────────────────────────────────────────────

const app = express();

// ─── Security & Parsing ───────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === 'production'
    ? ['https://resqlink.vercel.app'] // Update with your prod frontend URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ───────────────────────────────────────────────────
app.use('/api', apiRouter);

// ─── 404 Handler ──────────────────────────────────────────────────
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// ─── Global Error Handler ─────────────────────────────────────────
app.use(errorHandler);

export { app };
