import { Router } from 'express';
import { logisticsController } from './logistics.controller';
import { authenticate, authorize } from '../../middleware/auth';

// ─── Logistics Routes ─────────────────────────────────────────
// GET    /logistics/volunteers      — List all volunteers
// PATCH  /logistics/volunteers/:id  — Update volunteer (AGENCY/ADMIN)
// POST   /logistics/assign          — Assign volunteer to incident (AGENCY/ADMIN)
// GET    /logistics/resources       — List all resources
// PATCH  /logistics/resources/:id   — Update resource (AGENCY/ADMIN)
// ──────────────────────────────────────────────────────────────

const router = Router();

router.use(authenticate);

// Volunteers
router.get('/volunteers', logisticsController.listVolunteers);
router.patch('/volunteers/:id', authorize('AGENCY', 'ADMIN'), logisticsController.updateVolunteer);

// Assignments
router.post('/assign', authorize('AGENCY', 'ADMIN'), logisticsController.assign);

// Resources
router.get('/resources', logisticsController.listResources);
router.patch('/resources/:id', authorize('AGENCY', 'ADMIN'), logisticsController.updateResource);

export default router;
