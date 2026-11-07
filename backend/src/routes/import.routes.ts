import { Router } from 'express';
import { importController } from '../controllers/import.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { enforceBranchScope } from '../middleware/branch-scoping.middleware.js';

const router = Router();

router.use(authenticateJwt);
router.use(enforceBranchScope);

router.post('/stage', (req, res, next) => importController.stageFile(req, res, next));
router.post('/commit', (req, res, next) => importController.commit(req, res, next));

export default router;
