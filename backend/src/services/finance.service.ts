import { memoryStore, PaymentRecord, ExpenseRecord } from '../db/memory-store.js';

export interface PostPaymentInput {
  customerId: string;
  branchId: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE';
  referenceNumber: string;
  notes?: string;
  allocations?: Array<{
    salesInvoiceId: string;
    amount: number;
  }>;
}

export interface PostExpenseInput {
  branchId: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  recipientOrVendor: string;
  paymentMethod: string;
  notes?: string;
  isOperatingExpense?: boolean;
}

export class FinanceService {
  async getReceivablesAging(branchId?: string | null) {
    let invoices = memoryStore.invoices.filter(i => i.balanceDue > 0 && i.status === 'ISSUED');
    if (branchId) {
      invoices = invoices.filter(i => i.branchId === branchId);
    }

    const today = new Date('2026-10-10T12:00:00Z').getTime(); // pinned to simulated date

    let current = 0;
    let days1To30 = 0;
    let days31To60 = 0;
    let days61To90 = 0;
    let over90 = 0;

    const invoiceAgingDetails = invoices.map(inv => {
      const dueDate = new Date(inv.dueDate).getTime();
      const diffDays = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
      const customer = memoryStore.customers.find(c => c.id === inv.customerId);
      const branch = memoryStore.branches.find(b => b.id === inv.branchId);

      let bucket = 'CURRENT';
      if (diffDays <= 0) {
        current += inv.balanceDue;
        bucket = 'CURRENT';
      } else if (diffDays <= 30) {
        days1To30 += inv.balanceDue;
        bucket = '1-30_DAYS';
      } else if (diffDays <= 60) {
        days31To60 += inv.balanceDue;
        bucket = '31-60_DAYS';
      } else if (diffDays <= 90) {
        days61To90 += inv.balanceDue;
        bucket = '61-90_DAYS';
      } else {
        over90 += inv.balanceDue;
        bucket = 'OVER_90_DAYS';
      }

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: customer?.name || 'Customer',
        branchName: branch?.nameEn || 'Branch',
        dueDate: inv.dueDate,
        daysOverdue: Math.max(0, diffDays),
        balanceDue: inv.balanceDue,
        bucket
      };
    });

    const totalReceivables = current + days1To30 + days31To60 + days61To90 + over90;
    const totalOverdue = days1To30 + days31To60 + days61To90 + over90;
    const overdueRatio = totalReceivables > 0 ? (totalOverdue / totalReceivables) * 100 : 0;

    return {
      summary: {
        totalReceivables,
        totalOverdue,
        overdueRatio,
        current,
        days1To30,
        days31To60,
        days61To90,
        over90
      },
      invoices: invoiceAgingDetails
    };
  }

  async getPayments(branchId?: string | null) {
    let result = memoryStore.payments;
    if (branchId) {
      result = result.filter(p => p.branchId === branchId);
    }
    return result.map(p => {
      const customer = memoryStore.customers.find(c => c.id === p.customerId);
      const branch = memoryStore.branches.find(b => b.id === p.branchId);
      return {
        ...p,
        customerName: customer?.name || 'Customer',
        branchName: branch?.nameEn || 'Branch'
      };
    });
  }

  async postPayment(input: PostPaymentInput, userId: string) {
    const paymentId = `pay-${Date.now()}`;
    const paymentNumber = `PAY-${Date.now().toString().slice(-6)}`;

    let allocatedTotal = 0;
    if (input.allocations && input.allocations.length > 0) {
      for (const alloc of input.allocations) {
        const inv = memoryStore.invoices.find(i => i.id === alloc.salesInvoiceId);
        if (inv) {
          const applied = Math.min(alloc.amount, inv.balanceDue);
          inv.paidAmount += applied;
          inv.balanceDue -= applied;
          inv.paymentStatus = inv.balanceDue <= 0 ? 'PAID' : 'PARTIAL';
          allocatedTotal += applied;

          memoryStore.paymentAllocations.push({
            id: `alloc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            customerPaymentId: paymentId,
            salesInvoiceId: inv.id,
            allocatedAmount: applied
          });
        }
      }
    }

    const unallocated = Math.max(0, input.amount - allocatedTotal);

    const paymentRecord: PaymentRecord = {
      id: paymentId,
      paymentNumber,
      customerId: input.customerId,
      branchId: input.branchId,
      paymentDate: new Date().toISOString(),
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      referenceNumber: input.referenceNumber,
      unallocatedAmount: unallocated,
      notes: input.notes || ''
    };

    memoryStore.payments.unshift(paymentRecord);

    memoryStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId,
      branchId: input.branchId,
      action: 'CREATE',
      entityName: 'CUSTOMER_PAYMENT',
      entityId: paymentId,
      details: { paymentNumber, amount: input.amount, unallocated },
      timestamp: new Date().toISOString()
    });

    return paymentRecord;
  }

  async getExpenses(branchId?: string | null) {
    let result = memoryStore.expenses;
    if (branchId) {
      result = result.filter(e => e.branchId === branchId);
    }
    return result.map(e => {
      const branch = memoryStore.branches.find(b => b.id === e.branchId);
      return {
        ...e,
        branchName: branch?.nameEn || 'Branch'
      };
    });
  }

  async postExpense(input: PostExpenseInput, userId: string) {
    const expenseId = `exp-${Date.now()}`;
    const expenseRecord: ExpenseRecord = {
      id: expenseId,
      branchId: input.branchId,
      categoryId: input.categoryId,
      categoryName: input.categoryName,
      expenseDate: new Date().toISOString().split('T')[0],
      amount: input.amount,
      recipientOrVendor: input.recipientOrVendor,
      paymentMethod: input.paymentMethod,
      notes: input.notes || '',
      isOperatingExpense: input.isOperatingExpense !== false
    };

    memoryStore.expenses.unshift(expenseRecord);

    memoryStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId,
      branchId: input.branchId,
      action: 'CREATE',
      entityName: 'EXPENSE',
      entityId: expenseId,
      details: { categoryName: input.categoryName, amount: input.amount },
      timestamp: new Date().toISOString()
    });

    return expenseRecord;
  }

  async getBudgetVsActual(branchId?: string | null) {
    let budgets = memoryStore.budgets;
    let expenses = memoryStore.expenses;

    if (branchId) {
      budgets = budgets.filter(b => b.branchId === branchId);
      expenses = expenses.filter(e => e.branchId === branchId);
    }

    const comparison = budgets.map(b => {
      const actualSpent = expenses
        .filter(e => e.branchId === b.branchId && e.categoryId === b.categoryId)
        .reduce((sum, e) => sum + e.amount, 0);

      const variance = b.budgetAmount - actualSpent;
      const utilizationRate = b.budgetAmount > 0 ? (actualSpent / b.budgetAmount) * 100 : 0;
      const branch = memoryStore.branches.find(br => br.id === b.branchId);

      return {
        id: b.id,
        branchId: b.branchId,
        branchName: branch?.nameEn || 'Branch',
        categoryId: b.categoryId,
        categoryName: b.categoryName,
        budgetAmount: b.budgetAmount,
        actualSpent,
        variance,
        utilizationRate,
        isOverBudget: actualSpent > b.budgetAmount
      };
    });

    return comparison;
  }
}

export const financeService = new FinanceService();
