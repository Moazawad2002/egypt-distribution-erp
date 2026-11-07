import { Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AnalyticsController {
  async getCeoOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getCeoOverview(req.scopedBranchId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getBranchComparison(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // If branch restricted, can only view own branch
      const data = await analyticsService.getBranchComparison();
      const filtered = req.scopedBranchId ? data.filter(b => b.id === req.scopedBranchId) : data;
      res.json({ success: true, data: filtered });
    } catch (error) {
      next(error);
    }
  }

  async getSalesReps(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getSalesRepsPerformance(req.scopedBranchId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProductProfitability(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getProductProfitability();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getDataQualityAlerts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getDataQualityAlerts(req.scopedBranchId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
