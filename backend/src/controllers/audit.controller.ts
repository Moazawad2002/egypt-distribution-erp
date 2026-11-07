import { Response, NextFunction } from 'express';
import { memoryStore } from '../db/memory-store.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AuditController {
  async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let logs = memoryStore.auditLogs;
      if (req.scopedBranchId) {
        logs = logs.filter(l => !l.branchId || l.branchId === req.scopedBranchId);
      }
      res.json({
        success: true,
        data: logs.slice(0, 50)
      });
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
