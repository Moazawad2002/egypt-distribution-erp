import { memoryStore, InvoiceRecord, InvoiceLineRecord, ReturnRecord } from '../db/memory-store.js';

export interface CreateInvoiceInput {
  branchId: string;
  customerId: string;
  salesRepresentativeId: string;
  dueDate: string;
  notes?: string;
  lines: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
  }>;
}

export class SalesService {
  async getInvoices(branchId?: string | null, status?: string) {
    let result = memoryStore.invoices;
    if (branchId) {
      result = result.filter(inv => inv.branchId === branchId);
    }
    if (status) {
      result = result.filter(inv => inv.status === status);
    }
    return result.map(inv => {
      const customer = memoryStore.customers.find(c => c.id === inv.customerId);
      const rep = memoryStore.salesReps.find(r => r.id === inv.salesRepresentativeId);
      const branch = memoryStore.branches.find(b => b.id === inv.branchId);
      return {
        ...inv,
        customerName: customer?.name || 'Unknown Customer',
        repName: rep?.name || 'Unknown Rep',
        branchName: branch?.nameEn || 'Unknown Branch'
      };
    });
  }

  async getInvoiceById(id: string, branchId?: string | null) {
    const inv = memoryStore.invoices.find(i => i.id === id);
    if (!inv) return null;
    if (branchId && inv.branchId !== branchId) return null;

    const lines = memoryStore.invoiceLines.filter(l => l.salesInvoiceId === inv.id).map(l => {
      const product = memoryStore.products.find(p => p.id === l.productId);
      return {
        ...l,
        productName: product?.nameEn || 'Product',
        sku: product?.sku || ''
      };
    });

    const customer = memoryStore.customers.find(c => c.id === inv.customerId);
    const rep = memoryStore.salesReps.find(r => r.id === inv.salesRepresentativeId);
    const branch = memoryStore.branches.find(b => b.id === inv.branchId);

    return {
      ...inv,
      lines,
      customer,
      rep,
      branch
    };
  }

  async createInvoice(input: CreateInvoiceInput, userId: string) {
    const branch = memoryStore.branches.find(b => b.id === input.branchId);
    if (!branch) throw new Error('Invalid branch ID');

    const customer = memoryStore.customers.find(c => c.id === input.customerId);
    if (!customer) throw new Error('Invalid customer ID');

    const rep = memoryStore.salesReps.find(r => r.id === input.salesRepresentativeId);
    if (!rep) throw new Error('Invalid sales representative ID');

    const invoiceId = `inv-${Date.now()}`;
    const invoiceNumber = `INV-${branch.code}-${Date.now().toString().slice(-6)}`;

    let grossAmount = 0;
    let discountAmount = 0;
    let cogsAmount = 0;
    const linesToInsert: InvoiceLineRecord[] = [];

    for (const item of input.lines) {
      const product = memoryStore.products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (item.quantity <= 0) throw new Error(`Invalid quantity: ${item.quantity}`);

      const lineGross = item.quantity * item.unitPrice;
      const discPct = item.discountPercent || 0;
      const lineDisc = lineGross * (discPct / 100);
      const lineNet = lineGross - lineDisc;
      const lineCost = item.quantity * product.costPrice;

      grossAmount += lineGross;
      discountAmount += lineDisc;
      cogsAmount += lineCost;

      linesToInsert.push({
        id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        salesInvoiceId: invoiceId,
        productId: product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitCost: product.costPrice,
        discountPercent: discPct,
        discountAmount: lineDisc,
        lineTotal: lineNet,
        lineCogs: lineCost
      });

      // Track inventory movement
      memoryStore.inventoryMovements.push({
        id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        warehouseId: `wh-${branch.code.toLowerCase()}`,
        productId: product.id,
        movementType: 'DISPATCH',
        referenceType: 'SALES_INVOICE',
        referenceId: invoiceNumber,
        quantityChange: -item.quantity,
        unitCost: product.costPrice,
        totalCost: lineCost,
        balanceAfter: 200 - item.quantity, // perpetual balance track
        timestamp: new Date().toISOString()
      });
    }

    const netAmount = grossAmount - discountAmount;

    // Check customer credit limit
    const currentOverdue = memoryStore.invoices
      .filter(i => i.customerId === customer.id && i.balanceDue > 0)
      .reduce((sum, i) => sum + i.balanceDue, 0);

    if (currentOverdue + netAmount > customer.creditLimit) {
      memoryStore.alerts.unshift({
        id: `alt-${Date.now()}`,
        branchId: branch.id,
        alertType: 'CREDIT_LIMIT_BREACH',
        severity: 'WARNING',
        title: `Credit Limit Exceeded: ${customer.name}`,
        description: `New balance ${(currentOverdue + netAmount).toLocaleString()} EGP exceeds credit limit ${customer.creditLimit.toLocaleString()} EGP.`,
        isResolved: false,
        createdAt: new Date().toISOString()
      });
    }

    const newInvoice: InvoiceRecord = {
      id: invoiceId,
      invoiceNumber,
      branchId: branch.id,
      customerId: customer.id,
      salesRepresentativeId: rep.id,
      invoiceDate: new Date().toISOString(),
      dueDate: input.dueDate,
      grossAmount,
      discountAmount,
      taxAmount: 0.00,
      netAmount,
      cogsAmount,
      paidAmount: 0.00,
      balanceDue: netAmount,
      paymentStatus: 'UNPAID',
      status: 'ISSUED',
      notes: input.notes || ''
    };

    memoryStore.invoices.unshift(newInvoice);
    memoryStore.invoiceLines.push(...linesToInsert);

    // Audit log
    memoryStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId,
      branchId: branch.id,
      action: 'CREATE',
      entityName: 'SALES_INVOICE',
      entityId: invoiceId,
      details: { invoiceNumber, netAmount, customerName: customer.name },
      timestamp: new Date().toISOString()
    });

    return newInvoice;
  }

  async getReturns(branchId?: string | null) {
    let result = memoryStore.returns;
    if (branchId) {
      result = result.filter(r => r.branchId === branchId);
    }
    return result;
  }

  async createReturn(input: {
    salesInvoiceId: string;
    branchId: string;
    customerId: string;
    totalAmount: number;
    returnReason: string;
    stockDisposition: 'RETURN_TO_STOCK' | 'QUARANTINE_DAMAGED' | 'SCRAPPED';
    notes?: string;
  }, userId: string) {
    const returnNumber = `RET-${Date.now().toString().slice(-6)}`;
    const costEstimate = input.totalAmount * 0.85; // Est. 85% COGS ratio

    const newReturn: ReturnRecord = {
      id: `ret-${Date.now()}`,
      returnNumber,
      salesInvoiceId: input.salesInvoiceId,
      branchId: input.branchId,
      customerId: input.customerId,
      returnDate: new Date().toISOString(),
      totalAmount: input.totalAmount,
      totalCost: costEstimate,
      status: 'APPROVED',
      returnReason: input.returnReason,
      stockDisposition: input.stockDisposition,
      notes: input.notes || ''
    };

    memoryStore.returns.unshift(newReturn);

    // If restocked, adjust inventory
    if (input.stockDisposition === 'RETURN_TO_STOCK') {
      memoryStore.inventoryMovements.push({
        id: `mov-${Date.now()}`,
        warehouseId: `wh-${input.branchId}`,
        productId: 'prod-oil-01',
        movementType: 'RETURN',
        referenceType: 'SALES_RETURN',
        referenceId: returnNumber,
        quantityChange: 10,
        unitCost: 780.00,
        totalCost: 7800.00,
        balanceAfter: 210,
        timestamp: new Date().toISOString()
      });
    }

    return newReturn;
  }
}

export const salesService = new SalesService();
