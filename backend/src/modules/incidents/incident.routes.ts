import { Router } from 'express';
import { incidentController } from './incident.controller';
import { authenticate, authorize } from '../../middleware/auth';

// ─── Incident Routes ──────────────────────────────────────────
// POST   /incidents            — Create incident (any authenticated user)
// GET    /incidents            — List incidents (with filters)
// GET    /incidents/:id        — Get single incident
// PATCH  /incidents/:id/status — Update status (AGENCY/ADMIN)
// PATCH  /incidents/:id/verify — Toggle verified (AGENCY/ADMIN)
// POST   /incidents/:id/vote   — Upvote (any authenticated user)
// ──────────────────────────────────────────────────────────────

const router = Router();

router.use(authenticate);

router.post('/', incidentController.create);
router.get('/', incidentController.list);
router.get('/:id', incidentController.getById);
router.patch('/:id/status', authorize('AGENCY', 'ADMIN'), incidentController.updateStatus);
router.patch('/:id/verify', authorize('AGENCY', 'ADMIN'), incidentController.verify);
router.post('/:id/vote', incidentController.vote);

export default router;
