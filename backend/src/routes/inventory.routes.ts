import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { enforceBranchScope } from '../middleware/branch-scoping.middleware.js';

const router = Router();

router.use(authenticateJwt);
router.use(enforceBranchScope);

router.get('/products', (req, res, next) => inventoryController.getProducts(req, res, next));
router.get('/movements', (req, res, next) => inventoryController.getMovements(req, res, next));
router.get('/summary', (req, res, next) => inventoryController.getSummary(req, res, next));

export default router;
