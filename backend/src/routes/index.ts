import { Router } from 'express';
import authRoutes from './auth.routes.js';
import branchRoutes from './branch.routes.js';
import salesRoutes from './sales.routes.js';
import inventoryRoutes from './inventory.routes.js';
import financeRoutes from './finance.routes.js';
import commissionsRoutes from './commissions.routes.js';
import analyticsRoutes from './analytics.routes.js';
import importRoutes from './import.routes.js';
import auditRoutes from './audit.routes.js';
import { checkDatabaseHealth } from '../db/prisma.js';

const router = Router();

// Health Check Endpoint
router.get('/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  res.json({
    status: 'ONLINE',
    system: 'Egypt FMCG Distribution ERP Central Backend',
    timestamp: new Date().toISOString(),
    database: dbHealth
  });
});

// Mounted domain routes
router.use('/auth', authRoutes);
router.use('/org', branchRoutes);
router.use('/sales', salesRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/finance', financeRoutes);
router.use('/commissions', commissionsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/import', importRoutes);
router.use('/audit', auditRoutes);

export default router;
