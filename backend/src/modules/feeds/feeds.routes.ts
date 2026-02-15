import { Router, Request, Response } from 'express';
import { crisisFeedsService } from '../../services/crisisFeeds';
import { weatherService } from '../../services/weather';
import { authenticate } from '../../middleware/auth';

// ─── Crisis Feeds Routes ────────────────────────────────────
// Aggregated real-world crisis data from free public APIs.
// ──────────────────────────────────────────────────────────────

const router = Router();

router.use(authenticate);

/**
 * GET /api/feeds/earthquakes?period=day&magnitude=4.5
 * Recent earthquakes from USGS.
 */
router.get('/earthquakes', async (req: Request, res: Response) => {
  const period = (req.query.period as string) || 'day';
  const magnitude = (req.query.magnitude as string) || '4.5';

  const validPeriods = ['hour', 'day', 'week', 'month'];
  const validMagnitudes = ['significant', 'all', '4.5', '2.5', '1.0'];

  if (!validPeriods.includes(period)) {
    res.status(400).json({ error: `Invalid period. Use: ${validPeriods.join(', ')}` });
    return;
  }
  if (!validMagnitudes.includes(magnitude)) {
    res.status(400).json({ error: `Invalid magnitude. Use: ${validMagnitudes.join(', ')}` });
    return;
  }

  const data = await crisisFeedsService.getEarthquakes(
    period as 'hour' | 'day' | 'week' | 'month',
    magnitude as 'significant' | 'all' | '4.5' | '2.5' | '1.0'
  );

  res.json({ earthquakes: data, count: data.length, source: 'USGS' });
});

/**
 * GET /api/feeds/reports?country=India&limit=10
 * Crisis reports from ReliefWeb (UN OCHA).
 */
router.get('/reports', async (req: Request, res: Response) => {
  const country = req.query.country as string | undefined;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

  const data = await crisisFeedsService.getReliefWebReports(country, limit);
  res.json({ reports: data, count: data.length, source: 'ReliefWeb (UN OCHA)' });
});

/**
 * GET /api/feeds/summary?country=India
 * Combined crisis summary.
 */
router.get('/summary', async (req: Request, res: Response) => {
  const country = req.query.country as string | undefined;
  const summary = await crisisFeedsService.getCrisisSummary(country);
  res.json(summary);
});

/**
 * GET /api/feeds/weather?lat=...&lng=...
 * Weather data for a specific location.
 */
router.get('/weather', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);

  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({ error: 'Valid "lat" and "lng" query parameters are required' });
    return;
  }

  if (!weatherService.isAvailable()) {
    res.json({
      weather: null,
      serviceStatus: 'unavailable (set OPENWEATHER_KEY in .env)',
    });
    return;
  }

  const weather = await weatherService.getWeather(lat, lng);
  res.json({
    weather,
    serviceStatus: weather ? 'live' : 'error fetching weather',
  });
});

export default router;
