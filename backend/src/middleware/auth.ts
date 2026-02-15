import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// ─── Auth Middleware ──────────────────────────────────────────────
// Verifies JWT from the Authorization header.
// Attaches decoded user payload to `req.user` for downstream use.
// This is a skeleton that will be fleshed out in Subtask 2.
// ──────────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  role: 'AGENCY' | 'VOLUNTEER' | 'CIVILIAN' | 'ADMIN';
  iat?: number;
  exp?: number;
}

// Extend Express Request to include the user payload
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
};

// Role-based guard factory — use after `authenticate`
export const authorize = (...allowedRoles: JwtPayload['role'][]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ status: 'error', message: 'Insufficient permissions' });
      return;
    }
    next();
  };
};
