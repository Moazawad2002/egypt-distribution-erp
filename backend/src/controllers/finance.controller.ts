import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { financeService } from '../services/finance.service.js';
import { AuthenticatedRequest } from '../types/index.js';

const postPaymentSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  branchId: z.string().min(1, 'Branch ID is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CHEQUE']),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  notes: z.string().optional(),
  allocations: z.array(z.object({
    salesInvoiceId: z.string().min(1),
    amount: z.number().positive()
  })).optional()
});

const postExpenseSchema = z.object({
  branchId: z.string().min(1, 'Branch ID is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  categoryName: z.string().min(1, 'Category Name is required'),
  amount: z.number().positive('Amount must be positive'),
  recipientOrVendor: z.string().min(1, 'Recipient/Vendor is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  notes: z.string().optional(),
  isOperatingExpense: z.boolean().optional()
});

export class FinanceController {
  async getReceivablesAging(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await financeService.getReceivablesAging(req.scopedBranchId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getPayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await financeService.getPayments(req.scopedBranchId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async postPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = postPaymentSchema.parse(req.body);
      if (req.scopedBranchId && validated.branchId !== req.scopedBranchId) {
        res.status(403).json({ success: false, message: 'Cannot post payment outside assigned branch' });
        return;
      }
      const payment = await financeService.postPayment(validated, req.user!.id);
      res.status(201).json({ success: true, message: 'Payment recorded', data: payment });
    } catch (error) {
      next(error);
    }
  }

  async getExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await financeService.getExpenses(req.scopedBranchId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async postExpense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = postExpenseSchema.parse(req.body);
      if (req.scopedBranchId && validated.branchId !== req.scopedBranchId) {
        res.status(403).json({ success: false, message: 'Cannot record expense outside assigned branch' });
        return;
      }
      const expense = await financeService.postExpense(validated, req.user!.id);
      res.status(201).json({ success: true, message: 'Expense recorded', data: expense });
    } catch (error) {
      next(error);
    }
  }

  async getBudgetVsActual(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await financeService.getBudgetVsActual(req.scopedBranchId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const financeController = new FinanceController();
