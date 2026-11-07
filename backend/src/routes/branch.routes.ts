import { Router } from 'express';
import { branchController } from '../controllers/branch.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { enforceBranchScope } from '../middleware/branch-scoping.middleware.js';

const router = Router();

router.use(authenticateJwt);
router.use(enforceBranchScope);

router.get('/branches', (req, res, next) => branchController.getBranches(req, res, next));
router.get('/sales-reps', (req, res, next) => branchController.getSalesReps(req, res, next));
router.get('/customers', (req, res, next) => branchController.getCustomers(req, res, next));

export default router;
