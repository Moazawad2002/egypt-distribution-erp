import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../types/index.js';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.authenticate(validated.username, validated.password);
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Authentication failed'
      });
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthenticated' });
        return;
      }
      const user = await authService.getCurrentUser(req.user.id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
