import { Router } from 'express';
import { auditController } from '../controllers/audit.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { enforceBranchScope } from '../middleware/branch-scoping.middleware.js';

const router = Router();

router.use(authenticateJwt);
router.use(enforceBranchScope);

router.get('/logs', (req, res, next) => auditController.getAuditLogs(req, res, next));

export default router;
