import { Router } from 'express';
import { salesController } from '../controllers/sales.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { enforceBranchScope } from '../middleware/branch-scoping.middleware.js';

const router = Router();

router.use(authenticateJwt);
router.use(enforceBranchScope);

router.get('/invoices', (req, res, next) => salesController.getInvoices(req, res, next));
router.get('/invoices/:id', (req, res, next) => salesController.getInvoiceById(req, res, next));
router.post('/invoices', (req, res, next) => salesController.createInvoice(req, res, next));
router.get('/returns', (req, res, next) => salesController.getReturns(req, res, next));
router.post('/returns', (req, res, next) => salesController.createReturn(req, res, next));

export default router;
