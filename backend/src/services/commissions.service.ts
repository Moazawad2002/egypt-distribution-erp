import { memoryStore, CommissionCalculationRecord } from '../db/memory-store.js';

export class CommissionsService {
  async getCalculations(branchId?: string | null) {
    let result = memoryStore.commissions;
    if (branchId) {
      result = result.filter(c => c.branchId === branchId);
    }
    return result.map(c => {
      const rep = memoryStore.salesReps.find(r => r.id === c.salesRepresentativeId);
      const branch = memoryStore.branches.find(b => b.id === c.branchId);
      return {
        ...c,
        salesRepCode: rep?.code || '',
        branchName: branch?.nameEn || 'Branch'
      };
    });
  }

  async recalculateCommission(salesRepresentativeId: string, policyCode: string) {
    const rep = memoryStore.salesReps.find(r => r.id === salesRepresentativeId);
    if (!rep) throw new Error('Sales representative not found');

    const invoices = memoryStore.invoices.filter(
      i => i.salesRepresentativeId === salesRepresentativeId && i.status === 'ISSUED'
    );

    const grossSales = invoices.reduce((sum, i) => sum + i.grossAmount, 0);
    const discounts = invoices.reduce((sum, i) => sum + i.discountAmount, 0);
    const cogs = invoices.reduce((sum, i) => sum + i.cogsAmount, 0);

    const invoiceIds = invoices.map(i => i.id);
    const returns = memoryStore.returns
      .filter(r => invoiceIds.includes(r.salesInvoiceId) && r.status === 'APPROVED')
      .reduce((sum, r) => sum + r.totalAmount, 0);

    let eligibleBase = 0;
    let rate = 2.0;

    switch (policyCode) {
      case 'POLICY_GROSS':
        eligibleBase = grossSales;
        rate = 2.0;
        break;
      case 'POLICY_NET_AFTER_DISCOUNT':
        eligibleBase = grossSales - discounts;
        rate = 2.0;
        break;
      case 'POLICY_NET_AFTER_RETURNS':
      default:
        eligibleBase = Math.max(0, grossSales - discounts - returns);
        rate = 2.0;
        break;
      case 'POLICY_PROFIT_BASED':
        const grossProfit = Math.max(0, (grossSales - discounts - returns) - cogs);
        eligibleBase = grossProfit;
        rate = 10.0; // 10% profit-sharing commission
        break;
    }

    const calculatedCommission = eligibleBase * (rate / 100);

    // Look up existing recorded commission
    const existing = memoryStore.commissions.find(
      c => c.salesRepresentativeId === salesRepresentativeId
    );

    const recorded = existing ? existing.recordedCommission : grossSales * 0.02; // previously assumed 2% on gross
    const discrepancy = calculatedCommission - recorded;

    const record: CommissionCalculationRecord = {
      id: existing ? existing.id : `comm-${Date.now()}`,
      salesRepresentativeId: rep.id,
      salesRepName: rep.name,
      branchId: rep.branchId,
      periodYear: 2026,
      periodMonth: 10,
      policyCode,
      eligibleBaseAmount: eligibleBase,
      appliedRate: rate,
      calculatedCommission,
      recordedCommission: recorded,
      discrepancyAmount: discrepancy,
      status: existing ? existing.status : 'DRAFT',
      notes: `Recalculated under policy ${policyCode}. Gross: ${grossSales}, Disc: ${discounts}, Ret: ${returns}`
    };

    if (existing) {
      Object.assign(existing, record);
    } else {
      memoryStore.commissions.push(record);
    }

    return record;
  }

  async updateStatus(id: string, status: 'DRAFT' | 'APPROVED' | 'PAID', userId: string) {
    const calc = memoryStore.commissions.find(c => c.id === id);
    if (!calc) throw new Error('Commission calculation not found');

    calc.status = status;

    memoryStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId,
      branchId: calc.branchId,
      action: 'UPDATE',
      entityName: 'COMMISSION_CALCULATION',
      entityId: id,
      details: { newStatus: status, salesRep: calc.salesRepName },
      timestamp: new Date().toISOString()
    });

    return calc;
  }
}

export const commissionsService = new CommissionsService();
