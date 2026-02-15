import { Request, Response } from 'express';
import { z } from 'zod';
import { mapService } from './map.service';

// ─── Map Controller ───────────────────────────────────────────
// HTTP layer for map data endpoints.
// ──────────────────────────────────────────────────────────────

const bboxSchema = z.object({
  swLat: z.coerce.number().min(-90).max(90),
  swLng: z.coerce.number().min(-180).max(180),
  neLat: z.coerce.number().min(-90).max(90),
  neLng: z.coerce.number().min(-180).max(180),
});

export const mapController = {
  async getIncidents(req: Request, res: Response) {
    const bbox = bboxSchema.parse(req.query);
    const incidents = await mapService.getIncidentsInBBox(bbox);

    res.json({ status: 'success', data: incidents });
  },

  async getUnits(req: Request, res: Response) {
    const bbox = bboxSchema.parse(req.query);
    const units = await mapService.getUnitsInBBox(bbox);

    res.json({ status: 'success', data: units });
  },

  async getResources(req: Request, res: Response) {
    const bbox = bboxSchema.parse(req.query);
    const resources = await mapService.getResourcesInBBox(bbox);

    res.json({ status: 'success', data: resources });
  },

  async getLayers(req: Request, res: Response) {
    const bbox = bboxSchema.parse(req.query);
    const geojson = await mapService.getLayersAsGeoJSON(bbox);

    res.json({ status: 'success', data: geojson });
  },
};
