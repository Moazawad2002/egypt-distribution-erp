import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { commissionsService } from '../services/commissions.service.js';
import { AuthenticatedRequest } from '../types/index.js';

const recalculateSchema = z.object({
  salesRepresentativeId: z.string().min(1, 'Sales representative ID is required'),
  policyCode: z.enum(['POLICY_GROSS', 'POLICY_NET_AFTER_DISCOUNT', 'POLICY_NET_AFTER_RETURNS', 'POLICY_PROFIT_BASED'])
});

const updateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'APPROVED', 'PAID'])
});

export class CommissionsController {
  async getCalculations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await commissionsService.getCalculations(req.scopedBranchId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async recalculate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = recalculateSchema.parse(req.body);
      const result = await commissionsService.recalculateCommission(
        validated.salesRepresentativeId,
        validated.policyCode
      );
      res.json({
        success: true,
        message: 'Commission recalculated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = updateStatusSchema.parse(req.body);
      const result = await commissionsService.updateStatus(id, validated.status, req.user!.id);
      res.json({
        success: true,
        message: 'Commission approval status updated',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export const commissionsController = new CommissionsController();
