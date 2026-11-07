import { Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class InventoryController {
  async getProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const products = await inventoryService.getProducts();
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async getMovements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.query.productId as string;
      const movements = await inventoryService.getMovements(productId, req.scopedBranchId);
      res.json({ success: true, data: movements });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const summary = await inventoryService.getInventorySummary(req.scopedBranchId);
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryController = new InventoryController();
