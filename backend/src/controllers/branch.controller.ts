import { Response, NextFunction } from 'express';
import { memoryStore } from '../db/memory-store.js';
import { AuthenticatedRequest } from '../types/index.js';

export class BranchController {
  async getBranches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let branches = memoryStore.branches;
      if (req.scopedBranchId) {
        branches = branches.filter(b => b.id === req.scopedBranchId);
      }
      res.json({
        success: true,
        data: branches
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalesReps(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let reps = memoryStore.salesReps;
      if (req.scopedBranchId) {
        reps = reps.filter(r => r.branchId === req.scopedBranchId);
      }
      const enriched = reps.map(rep => {
        const branch = memoryStore.branches.find(b => b.id === rep.branchId);
        const target = memoryStore.targets.find(t => t.salesRepresentativeId === rep.id);
        return {
          ...rep,
          branchName: branch?.nameEn || 'Branch',
          branchCode: branch?.code || '',
          monthlyTarget: target?.targetAmount || 0
        };
      });
      res.json({
        success: true,
        data: enriched
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let customers = memoryStore.customers;
      if (req.scopedBranchId) {
        customers = customers.filter(c => c.branchId === req.scopedBranchId);
      }
      const enriched = customers.map(c => {
        const branch = memoryStore.branches.find(b => b.id === c.branchId);
        const invoices = memoryStore.invoices.filter(i => i.customerId === c.id);
        const currentBalance = invoices.reduce((sum, i) => sum + i.balanceDue, 0);
        return {
          ...c,
          branchName: branch?.nameEn || 'Branch',
          currentBalance,
          creditAvailable: Math.max(0, c.creditLimit - currentBalance)
        };
      });
      res.json({
        success: true,
        data: enriched
      });
    } catch (error) {
      next(error);
    }
  }
}

export const branchController = new BranchController();
