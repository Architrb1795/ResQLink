import { Request, Response } from 'express';
import { z } from 'zod';
import { uploadService } from './upload.service';

// ─── Upload Controller ────────────────────────────────────────
// HTTP layer for media upload operations.
// ──────────────────────────────────────────────────────────────

const presignSchema = z.object({
  incidentId: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});

const confirmSchema = z.object({
  incidentId: z.string().min(1),
  url: z.string().url(),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});

export const uploadController = {
  async presign(req: Request, res: Response) {
    const data = presignSchema.parse(req.body);
    const result = await uploadService.generatePresignedUrl(
      data.incidentId,
      data.mimeType,
      data.sizeBytes
    );

    res.json({ status: 'success', data: result });
  },

  async confirm(req: Request, res: Response) {
    const data = confirmSchema.parse(req.body);
    const media = await uploadService.confirmUpload(
      data.incidentId,
      req.user!.userId,
      data.url,
      data.mimeType,
      data.sizeBytes
    );

    res.status(201).json({ status: 'success', data: media });
  },

  async listByIncident(req: Request, res: Response) {
    const media = await uploadService.listByIncident(req.params.incidentId);

    res.json({ status: 'success', data: media });
  },
};
