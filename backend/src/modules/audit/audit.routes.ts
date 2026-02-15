import { Router } from 'express';
import { auditController } from './audit.controller';
import { authenticate, authorize } from '../../middleware/auth';

// ─── Audit Routes ─────────────────────────────────────────────
// GET /audit/logs                        — Query audit trail
// GET /audit/logs/:entityType/:entityId  — Entity-specific logs
// Both require AGENCY or ADMIN role.
// ──────────────────────────────────────────────────────────────

const router = Router();

router.use(authenticate);
router.use(authorize('AGENCY', 'ADMIN'));

router.get('/logs', auditController.queryLogs);
router.get('/logs/:entityType/:entityId', auditController.getEntityLogs);

export default router;
