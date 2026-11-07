import { Router } from 'express';
import { financeController } from '../controllers/finance.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { enforceBranchScope } from '../middleware/branch-scoping.middleware.js';

const router = Router();

router.use(authenticateJwt);
router.use(enforceBranchScope);

router.get('/aging', (req, res, next) => financeController.getReceivablesAging(req, res, next));
router.get('/payments', (req, res, next) => financeController.getPayments(req, res, next));
router.post('/payments', (req, res, next) => financeController.postPayment(req, res, next));
router.get('/expenses', (req, res, next) => financeController.getExpenses(req, res, next));
router.post('/expenses', (req, res, next) => financeController.postExpense(req, res, next));
router.get('/budget-vs-actual', (req, res, next) => financeController.getBudgetVsActual(req, res, next));

export default router;
