import { Request, Response } from 'express';
import { z } from 'zod';
import { auditService } from './audit.service';

// ─── Audit Controller ─────────────────────────────────────────
// HTTP layer for querying audit trail.
// Only accessible to AGENCY and ADMIN roles.
// ──────────────────────────────────────────────────────────────

const querySchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const auditController = {
  async queryLogs(req: Request, res: Response) {
    const filters = querySchema.parse(req.query);
    const result = await auditService.queryLogs(filters);

    res.json({ status: 'success', data: result });
  },

  async getEntityLogs(req: Request, res: Response) {
    const { entityType, entityId } = req.params;
    const logs = await auditService.getEntityLogs(entityType, entityId);

    res.json({ status: 'success', data: logs });
  },
};
