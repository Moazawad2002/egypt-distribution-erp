import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', (req, res, next) => authController.login(req, res, next));
router.get('/me', authenticateJwt, (req, res, next) => authController.me(req, res, next));

export default router;
