import { Router } from 'express';
import { commissionsController } from '../controllers/commissions.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { enforceBranchScope } from '../middleware/branch-scoping.middleware.js';

const router = Router();

router.use(authenticateJwt);
router.use(enforceBranchScope);

router.get('/calculations', (req, res, next) => commissionsController.getCalculations(req, res, next));
router.post('/recalculate', (req, res, next) => commissionsController.recalculate(req, res, next));
router.patch('/calculations/:id/status', (req, res, next) => commissionsController.updateStatus(req, res, next));

export default router;
