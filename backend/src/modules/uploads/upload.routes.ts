import { Router } from 'express';
import { uploadController } from './upload.controller';
import { authenticate } from '../../middleware/auth';

// ─── Upload Routes ────────────────────────────────────────────
// POST /uploads/presign              — Generate pre-signed URL
// POST /uploads/confirm              — Confirm upload complete
// GET  /uploads/incident/:incidentId — List media for incident
// ──────────────────────────────────────────────────────────────

const router = Router();

router.use(authenticate);

router.post('/presign', uploadController.presign);
router.post('/confirm', uploadController.confirm);
router.get('/incident/:incidentId', uploadController.listByIncident);

export default router;
