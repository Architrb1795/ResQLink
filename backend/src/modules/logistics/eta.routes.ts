import { Router, Request, Response } from 'express';
import { routingService } from '../../services/routing';
import { prisma } from '../../services/db';
import { authenticate } from '../../middleware/auth';

// ─── ETA Routes ─────────────────────────────────────────────
// Calculate estimated time of arrival between units and incidents.
// ──────────────────────────────────────────────────────────────

const router = Router();

router.use(authenticate);

/**
 * GET /api/logistics/eta?unitId=...&incidentId=...
 * Calculate ETA from a volunteer unit to an incident.
 */
router.get('/', async (req: Request, res: Response) => {
  const { unitId, incidentId, fromLat, fromLng, toLat, toLng } = req.query;

  let from: { lat: number; lng: number };
  let to: { lat: number; lng: number };

  // Option 1: Use unitId + incidentId (looks up coords from DB)
  if (unitId && incidentId) {
    const [volunteer, incident] = await Promise.all([
      prisma.volunteer.findUnique({ where: { id: unitId as string } }),
      prisma.incident.findUnique({ where: { id: incidentId as string } }),
    ]);

    if (!volunteer) {
      res.status(404).json({ error: 'Volunteer unit not found' });
      return;
    }
    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    from = { lat: volunteer.lat, lng: volunteer.lng };
    to = { lat: incident.lat, lng: incident.lng };
  }
  // Option 2: Direct coordinates
  else if (fromLat && fromLng && toLat && toLng) {
    from = { lat: parseFloat(fromLat as string), lng: parseFloat(fromLng as string) };
    to = { lat: parseFloat(toLat as string), lng: parseFloat(toLng as string) };

    if (isNaN(from.lat) || isNaN(from.lng) || isNaN(to.lat) || isNaN(to.lng)) {
      res.status(400).json({ error: 'Invalid coordinates. All must be valid numbers.' });
      return;
    }
  } else {
    res.status(400).json({
      error: 'Provide either (unitId + incidentId) or (fromLat + fromLng + toLat + toLng)',
    });
    return;
  }

  const route = await routingService.getRoute(from.lat, from.lng, to.lat, to.lng);

  res.json({
    route,
    from,
    to,
    serviceStatus: routingService.isAvailable() ? 'live' : 'estimated (no ORS key)',
  });
});

export default router;
