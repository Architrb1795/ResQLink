import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';

// ─── Global Error Handler ─────────────────────────────────────────
// Catches all errors thrown in route handlers / middleware.
// Handles Zod validation errors with 400 status.
// In production, strips stack traces to avoid leaking internals.
// ───────────────────────────────────────────────────────────────────

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ─── Zod Validation Errors ────────────────────────────────
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // ─── Application Errors ───────────────────────────────────
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${statusCode} — ${message}`);
  if (env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
