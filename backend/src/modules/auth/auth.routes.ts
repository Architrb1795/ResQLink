import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';

// ─── Auth Routes ──────────────────────────────────────────────
// POST /auth/register  — Create a new account
// POST /auth/login     — Authenticate and get tokens
// POST /auth/refresh   — Rotate refresh token
// POST /auth/logout    — Revoke refresh token
// GET  /auth/me        — Get current user profile
// ──────────────────────────────────────────────────────────────

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
