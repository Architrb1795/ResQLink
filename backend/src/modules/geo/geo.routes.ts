import { Router, Request, Response } from 'express';
import { geocodingService } from '../../services/geocoding';
import { authenticate } from '../../middleware/auth';

// ─── Geocoding Routes ────────────────────────────────────────
// Proxy to Nominatim — avoids CORS issues for the frontend.
// ──────────────────────────────────────────────────────────────

const router = Router();

// All geo routes require authentication
router.use(authenticate);

/**
 * GET /api/geo/search?q=...
 * Forward geocode: text query → coordinates
 */
router.get('/search', async (req: Request, res: Response) => {
  const q = req.query.q as string;
  if (!q || q.trim().length < 2) {
    res.status(400).json({ error: 'Query parameter "q" must be at least 2 characters' });
    return;
  }

  const results = await geocodingService.geocode(q.trim());
  res.json({ results, count: results.length });
});

/**
 * GET /api/geo/reverse?lat=...&lng=...
 * Reverse geocode: coordinates → address
 */
router.get('/reverse', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);

  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({ error: 'Valid "lat" and "lng" query parameters are required' });
    return;
  }

  const result = await geocodingService.reverseGeocode(lat, lng);
  if (!result) {
    res.status(404).json({ error: 'No address found for these coordinates' });
    return;
  }

  res.json({ result });
});

export default router;
