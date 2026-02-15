import { Request, Response } from 'express';
import { logisticsService } from './logistics.service';
import {
  updateVolunteerSchema,
  assignVolunteerSchema,
  updateResourceSchema,
} from './logistics.schema';

// ─── Logistics Controller ─────────────────────────────────────
// HTTP layer for logistics operations.
// ──────────────────────────────────────────────────────────────

export const logisticsController = {
  async listVolunteers(_req: Request, res: Response) {
    const volunteers = await logisticsService.listVolunteers();

    res.json({ status: 'success', data: volunteers });
  },

  async updateVolunteer(req: Request, res: Response) {
    const data = updateVolunteerSchema.parse(req.body);
    const volunteer = await logisticsService.updateVolunteer(
      req.params.id,
      data,
      req.user!.userId
    );

    res.json({ status: 'success', data: volunteer });
  },

  async assign(req: Request, res: Response) {
    const data = assignVolunteerSchema.parse(req.body);
    const assignment = await logisticsService.assignVolunteer(data, req.user!.userId);

    res.status(201).json({ status: 'success', data: assignment });
  },

  async listResources(_req: Request, res: Response) {
    const resources = await logisticsService.listResources();

    res.json({ status: 'success', data: resources });
  },

  async updateResource(req: Request, res: Response) {
    const data = updateResourceSchema.parse(req.body);
    const resource = await logisticsService.updateResource(
      req.params.id,
      data,
      req.user!.userId
    );

    res.json({ status: 'success', data: resource });
  },
};
