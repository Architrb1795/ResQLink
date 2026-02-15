import { Request, Response } from 'express';
import { incidentService } from './incident.service';
import { createIncidentSchema, updateStatusSchema, listIncidentsSchema } from './incident.schema';

// ─── Incident Controller ──────────────────────────────────────
// HTTP layer for incident operations.
// ──────────────────────────────────────────────────────────────

export const incidentController = {
  async create(req: Request, res: Response) {
    const data = createIncidentSchema.parse(req.body);
    const incident = await incidentService.create(data, req.user!.userId);

    res.status(201).json({
      status: 'success',
      data: incident,
    });
  },

  async list(req: Request, res: Response) {
    const query = listIncidentsSchema.parse(req.query);
    const result = await incidentService.list(query);

    res.json({
      status: 'success',
      data: result,
    });
  },

  async getById(req: Request, res: Response) {
    const incident = await incidentService.getById(req.params.id);

    res.json({
      status: 'success',
      data: incident,
    });
  },

  async updateStatus(req: Request, res: Response) {
    const data = updateStatusSchema.parse(req.body);
    const incident = await incidentService.updateStatus(
      req.params.id,
      data,
      req.user!.userId
    );

    res.json({
      status: 'success',
      data: incident,
    });
  },

  async verify(req: Request, res: Response) {
    const incident = await incidentService.verify(req.params.id, req.user!.userId);

    res.json({
      status: 'success',
      data: incident,
    });
  },

  async vote(req: Request, res: Response) {
    const incident = await incidentService.vote(req.params.id, req.user!.userId);

    res.json({
      status: 'success',
      data: incident,
    });
  },
};
