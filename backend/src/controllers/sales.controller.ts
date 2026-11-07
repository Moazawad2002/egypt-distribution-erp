import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { salesService } from '../services/sales.service.js';
import { AuthenticatedRequest } from '../types/index.js';

const createInvoiceSchema = z.object({
  branchId: z.string().min(1, 'Branch ID is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  salesRepresentativeId: z.string().min(1, 'Sales Representative ID is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
  lines: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity must be greater than 0'),
    unitPrice: z.number().positive('Unit price must be greater than 0'),
    discountPercent: z.number().min(0).max(100).optional()
  })).min(1, 'At least one invoice line item is required')
});

const createReturnSchema = z.object({
  salesInvoiceId: z.string().min(1, 'Invoice ID is required'),
  branchId: z.string().min(1, 'Branch ID is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  totalAmount: z.number().positive('Total return amount must be positive'),
  returnReason: z.string().min(1, 'Return reason is required'),
  stockDisposition: z.enum(['RETURN_TO_STOCK', 'QUARANTINE_DAMAGED', 'SCRAPPED']),
  notes: z.string().optional()
});

export class SalesController {
  async getInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string;
      const data = await salesService.getInvoices(req.scopedBranchId, status);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const invoice = await salesService.getInvoiceById(id, req.scopedBranchId);
      if (!invoice) {
        res.status(404).json({ success: false, message: 'Invoice not found or unauthorized' });
        return;
      }
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }

  async createInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createInvoiceSchema.parse(req.body);

      // Verify branch scope
      if (req.scopedBranchId && validated.branchId !== req.scopedBranchId) {
        res.status(403).json({ success: false, message: 'Cannot create invoice outside assigned branch' });
        return;
      }

      const invoice = await salesService.createInvoice(validated, req.user!.id);
      res.status(201).json({
        success: true,
        message: 'Sales invoice created successfully',
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }

  async getReturns(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await salesService.getReturns(req.scopedBranchId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createReturn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createReturnSchema.parse(req.body);
      if (req.scopedBranchId && validated.branchId !== req.scopedBranchId) {
        res.status(403).json({ success: false, message: 'Cannot create return outside assigned branch' });
        return;
      }
      const ret = await salesService.createReturn(validated, req.user!.id);
      res.status(201).json({
        success: true,
        message: 'Sales return processed successfully',
        data: ret
      });
    } catch (error) {
      next(error);
    }
  }
}

export const salesController = new SalesController();
