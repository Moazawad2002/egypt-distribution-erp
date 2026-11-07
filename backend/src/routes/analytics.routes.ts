import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { enforceBranchScope } from '../middleware/branch-scoping.middleware.js';

const router = Router();

router.use(authenticateJwt);
router.use(enforceBranchScope);

router.get('/ceo-overview', (req, res, next) => analyticsController.getCeoOverview(req, res, next));
router.get('/branch-comparison', (req, res, next) => analyticsController.getBranchComparison(req, res, next));
router.get('/sales-reps', (req, res, next) => analyticsController.getSalesReps(req, res, next));
router.get('/product-profitability', (req, res, next) => analyticsController.getProductProfitability(req, res, next));
router.get('/data-quality-alerts', (req, res, next) => analyticsController.getDataQualityAlerts(req, res, next));

export default router;
