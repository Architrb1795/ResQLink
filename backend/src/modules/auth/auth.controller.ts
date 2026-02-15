import { Request, Response } from 'express';
import { authService } from './auth.service';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema';

// ─── Auth Controller ──────────────────────────────────────────
// Handles HTTP request/response for auth endpoints.
// Validates input with Zod, delegates to auth service, returns JSON.
// ──────────────────────────────────────────────────────────────

export const authController = {
  async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);

    res.status(201).json({
      status: 'success',
      data: result,
    });
  },

  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);

    res.json({
      status: 'success',
      data: result,
    });
  },

  async refresh(req: Request, res: Response) {
    const data = refreshSchema.parse(req.body);
    const result = await authService.refresh(data.refreshToken);

    res.json({
      status: 'success',
      data: result,
    });
  },

  async logout(req: Request, res: Response) {
    const data = refreshSchema.parse(req.body);
    await authService.logout(data.refreshToken);

    res.json({
      status: 'success',
      message: 'Logged out successfully',
    });
  },

  async me(req: Request, res: Response) {
    const user = await authService.getMe(req.user!.userId);

    res.json({
      status: 'success',
      data: user,
    });
  },
};
