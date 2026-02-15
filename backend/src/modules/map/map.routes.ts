import { Router } from 'express';
import { mapController } from './map.controller';
import { authenticate } from '../../middleware/auth';

// ─── Map Routes ───────────────────────────────────────────────
// GET /map/incidents  — Incidents within bounding box
// GET /map/units      — Volunteers within bounding box
// GET /map/resources  — Resources within bounding box
// GET /map/layers     — All layers as GeoJSON FeatureCollection
// ──────────────────────────────────────────────────────────────

const router = Router();

router.use(authenticate);

router.get('/incidents', mapController.getIncidents);
router.get('/units', mapController.getUnits);
router.get('/resources', mapController.getResources);
router.get('/layers', mapController.getLayers);

export default router;
