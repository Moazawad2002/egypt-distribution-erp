import { memoryStore } from '../db/memory-store.js';

export class AnalyticsService {
  /**
   * Dashboard 1: CEO Executive Overview
   */
  async getCeoOverview(branchId?: string | null) {
    let invoices = memoryStore.invoices.filter(i => i.status === 'ISSUED');
    let returns = memoryStore.returns.filter(r => r.status === 'APPROVED');
    let expenses = memoryStore.expenses.filter(e => e.isOperatingExpense);
    let targets = memoryStore.targets;

    if (branchId) {
      invoices = invoices.filter(i => i.branchId === branchId);
      returns = returns.filter(r => r.branchId === branchId);
      expenses = expenses.filter(e => e.branchId === branchId);
      targets = targets.filter(t => t.branchId === branchId);
    }

    const grossSales = invoices.reduce((sum, i) => sum + i.grossAmount, 0);
    const discounts = invoices.reduce((sum, i) => sum + i.discountAmount, 0);
    const returnsTotal = returns.reduce((sum, r) => sum + r.totalAmount, 0);
    const returnsCost = returns
      .filter(r => r.stockDisposition === 'RETURN_TO_STOCK')
      .reduce((sum, r) => sum + r.totalCost, 0);

    const netSales = Math.max(0, grossSales - discounts - returnsTotal);
    const rawCogs = invoices.reduce((sum, i) => sum + i.cogsAmount, 0);
    const cogs = Math.max(0, rawCogs - returnsCost);

    const grossProfit = netSales - cogs;
    const grossProfitMargin = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

    const operatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const operatingProfit = grossProfit - operatingExpenses;
    const operatingProfitMargin = netSales > 0 ? (operatingProfit / netSales) * 100 : 0;

    const outstandingReceivables = invoices.reduce((sum, i) => sum + i.balanceDue, 0);
    const inventoryValuation = memoryStore.products.reduce((sum, p) => sum + 180 * p.costPrice, 0);

    const monthlyTarget = targets.reduce((sum, t) => sum + t.targetAmount, 0);
    const targetAchievementRate = monthlyTarget > 0 ? (netSales / monthlyTarget) * 100 : 0;

    const discountRate = grossSales > 0 ? (discounts / grossSales) * 100 : 0;
    const returnRate = grossSales > 0 ? (returnsTotal / grossSales) * 100 : 0;

    // Monthly Trend (Jan - Oct simulated trend)
    const monthlyTrend = [
      { month: 'Jun', gross: 820000, net: 775000, cogs: 660000, grossProfit: 115000, opex: 88000, opProfit: 27000 },
      { month: 'Jul', gross: 890000, net: 835000, cogs: 710000, grossProfit: 125000, opex: 92000, opProfit: 33000 },
      { month: 'Aug', gross: 940000, net: 880000, cogs: 752000, grossProfit: 128000, opex: 98000, opProfit: 30000 },
      { month: 'Sep', gross: 1010000, net: 942000, cogs: 805000, grossProfit: 137000, opex: 105000, opProfit: 32000 },
      { month: 'Oct (MTD)', gross: grossSales, net: netSales, cogs: cogs, grossProfit: grossProfit, opex: operatingExpenses, opProfit: operatingProfit }
    ];

    // Branch Performance Breakdown
    const branchBreakdown = memoryStore.branches.map(b => {
      const bInvoices = memoryStore.invoices.filter(i => i.branchId === b.id && i.status === 'ISSUED');
      const bReturns = memoryStore.returns.filter(r => r.branchId === b.id && r.status === 'APPROVED');
      const bExpenses = memoryStore.expenses.filter(e => e.branchId === b.id && e.isOperatingExpense);
      const bTargets = memoryStore.targets.filter(t => t.branchId === b.id);

      const bGross = bInvoices.reduce((sum, i) => sum + i.grossAmount, 0);
      const bDisc = bInvoices.reduce((sum, i) => sum + i.discountAmount, 0);
      const bRet = bReturns.reduce((sum, r) => sum + r.totalAmount, 0);
      const bNet = Math.max(0, bGross - bDisc - bRet);
      const bCogs = bInvoices.reduce((sum, i) => sum + i.cogsAmount, 0);
      const bGp = bNet - bCogs;
      const bOpex = bExpenses.reduce((sum, e) => sum + e.amount, 0);
      const bOp = bGp - bOpex;
      const bTarget = bTargets.reduce((sum, t) => sum + t.targetAmount, 0);

      return {
        id: b.id,
        code: b.code,
        nameEn: b.nameEn,
        nameAr: b.nameAr,
        colorCode: b.colorCode,
        grossSales: bGross,
        netSales: bNet,
        grossProfit: bGp,
        grossProfitMargin: bNet > 0 ? (bGp / bNet) * 100 : 0,
        opex: bOpex,
        operatingProfit: bOp,
        operatingMargin: bNet > 0 ? (bOp / bNet) * 100 : 0,
        monthlyTarget: bTarget,
        achievementRate: bTarget > 0 ? (bNet / bTarget) * 100 : 0,
        discountRate: bGross > 0 ? (bDisc / bGross) * 100 : 0,
        returnRate: bGross > 0 ? (bRet / bGross) * 100 : 0
      };
    });

    return {
      kpis: {
        grossSales,
        netSales,
        cogs,
        grossProfit,
        grossProfitMargin,
        operatingExpenses,
        operatingProfit,
        operatingProfitMargin,
        discounts,
        discountRate,
        returns: returnsTotal,
        returnRate,
        outstandingReceivables,
        inventoryValuation,
        monthlyTarget,
        targetAchievementRate
      },
      monthlyTrend,
      branchBreakdown,
      alerts: memoryStore.alerts.slice(0, 5)
    };
  }

  /**
   * Dashboard 2: Branch Comparison
   */
  async getBranchComparison() {
    const data = memoryStore.branches.map(b => {
      const bInvoices = memoryStore.invoices.filter(i => i.branchId === b.id && i.status === 'ISSUED');
      const bReturns = memoryStore.returns.filter(r => r.branchId === b.id && r.status === 'APPROVED');
      const bExpenses = memoryStore.expenses.filter(e => e.branchId === b.id);
      const bBudgets = memoryStore.budgets.filter(bg => bg.branchId === b.id);
      const bReps = memoryStore.salesReps.filter(r => r.branchId === b.id);

      const gross = bInvoices.reduce((sum, i) => sum + i.grossAmount, 0);
      const disc = bInvoices.reduce((sum, i) => sum + i.discountAmount, 0);
      const rets = bReturns.reduce((sum, r) => sum + r.totalAmount, 0);
      const net = Math.max(0, gross - disc - rets);
      const cogs = bInvoices.reduce((sum, i) => sum + i.cogsAmount, 0);
      const grossProfit = net - cogs;
      const gpMargin = net > 0 ? (grossProfit / net) * 100 : 0;

      const opex = bExpenses.filter(e => e.isOperatingExpense).reduce((sum, e) => sum + e.amount, 0);
      const transportOpex = bExpenses.filter(e => e.categoryId === 'cat-transport').reduce((sum, e) => sum + e.amount, 0);
      const opProfit = grossProfit - opex;
      const opMargin = net > 0 ? (opProfit / net) * 100 : 0;

      const receivables = bInvoices.reduce((sum, i) => sum + i.balanceDue, 0);
      const budget = bBudgets.reduce((sum, bg) => sum + bg.budgetAmount, 0);

      return {
        id: b.id,
        code: b.code,
        nameEn: b.nameEn,
        nameAr: b.nameAr,
        colorCode: b.colorCode,
        repsCount: bReps.length,
        invoicesCount: bInvoices.length,
        grossSales: gross,
        netSales: net,
        discounts: disc,
        discountRate: gross > 0 ? (disc / gross) * 100 : 0,
        returns: rets,
        returnRate: gross > 0 ? (rets / gross) * 100 : 0,
        cogs,
        grossProfit,
        grossProfitMargin: gpMargin,
        opex,
        transportCost: transportOpex,
        operatingProfit: opProfit,
        operatingMargin: opMargin,
        receivables,
        budget,
        budgetVariance: budget - opex
      };
    });

    return data;
  }

  /**
   * Dashboard 3: Sales Representatives Performance
   */
  async getSalesRepsPerformance(branchId?: string | null) {
    let reps = memoryStore.salesReps;
    if (branchId) {
      reps = reps.filter(r => r.branchId === branchId);
    }

    const performance = reps.map(rep => {
      const branch = memoryStore.branches.find(b => b.id === rep.branchId);
      const target = memoryStore.targets.find(t => t.salesRepresentativeId === rep.id);
      const invoices = memoryStore.invoices.filter(i => i.salesRepresentativeId === rep.id && i.status === 'ISSUED');
      const invoiceIds = invoices.map(i => i.id);
      const returns = memoryStore.returns.filter(r => invoiceIds.includes(r.salesInvoiceId) && r.status === 'APPROVED');

      const gross = invoices.reduce((sum, i) => sum + i.grossAmount, 0);
      const disc = invoices.reduce((sum, i) => sum + i.discountAmount, 0);
      const rets = returns.reduce((sum, r) => sum + r.totalAmount, 0);
      const net = Math.max(0, gross - disc - rets);
      const cogs = invoices.reduce((sum, i) => sum + i.cogsAmount, 0);
      const grossProfit = net - cogs;
      const targetAmount = target?.targetAmount || 500000;
      const achievementRate = targetAmount > 0 ? (net / targetAmount) * 100 : 0;

      return {
        id: rep.id,
        code: rep.code,
        name: rep.name,
        branchId: rep.branchId,
        branchName: branch?.nameEn || 'Branch',
        branchCode: branch?.code || '',
        branchColor: branch?.colorCode || '#1E3A8A',
        targetAmount,
        grossSales: gross,
        discounts: disc,
        discountRate: gross > 0 ? (disc / gross) * 100 : 0,
        returns: rets,
        returnRate: gross > 0 ? (rets / gross) * 100 : 0,
        netSales: net,
        grossProfit,
        grossMargin: net > 0 ? (grossProfit / net) * 100 : 0,
        achievementRate,
        invoicesCount: invoices.length
      };
    });

    return performance;
  }

  /**
   * Dashboard 5: Product Profitability
   */
  async getProductProfitability() {
    return memoryStore.products.map(p => {
      const lines = memoryStore.invoiceLines.filter(l => l.productId === p.id);
      const quantitySold = lines.reduce((sum, l) => sum + l.quantity, 0);
      const grossRevenue = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
      const discountVal = lines.reduce((sum, l) => sum + l.discountAmount, 0);
      const netRevenue = grossRevenue - discountVal;
      const cogsVal = lines.reduce((sum, l) => sum + l.lineCogs, 0);
      const grossProfit = netRevenue - cogsVal;
      const margin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

      return {
        id: p.id,
        sku: p.sku,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        brand: p.brand,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        quantitySold,
        netRevenue,
        cogs: cogsVal,
        grossProfit,
        grossProfitMargin: margin,
        reorderPoint: p.reorderPoint,
        currentStock: 180
      };
    });
  }

  /**
   * Dashboard 9: Data Quality and Integrity Alerts
   */
  async getDataQualityAlerts(branchId?: string | null) {
    let alerts = memoryStore.alerts;
    if (branchId) {
      alerts = alerts.filter(a => !a.branchId || a.branchId === branchId);
    }

    // Dynamic checks
    const unallocatedPayments = memoryStore.payments.filter(p => p.unallocatedAmount > 0);
    const unapprovedDiscounts = memoryStore.invoices.filter(i => (i.discountAmount / i.grossAmount) > 0.05);

    return {
      alerts,
      metrics: {
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'CRITICAL').length,
        unallocatedPaymentsCount: unallocatedPayments.length,
        unallocatedTotalAmount: unallocatedPayments.reduce((s, p) => s + p.unallocatedAmount, 0),
        highDiscountInvoicesCount: unapprovedDiscounts.length
      }
    };
  }
}

export const analyticsService = new AnalyticsService();
