import { describe, it, expect } from 'vitest';
import { analyticsService } from '../src/services/analytics.service.js';
import { commissionsService } from '../src/services/commissions.service.js';
import { financeService } from '../src/services/finance.service.js';

describe('Financial Logic & Business KPI Correctness', () => {
  it('correctly calculates top-line sales, margins, and operating profitability', async () => {
    const data = await analyticsService.getCeoOverview();
    const { kpis } = data;

    expect(kpis.grossSales).toBeGreaterThan(0);
    expect(kpis.netSales).toBeLessThanOrEqual(kpis.grossSales);

    // Exact Net Sales Formula
    const computedNet = kpis.grossSales - kpis.discounts - kpis.returns;
    expect(Math.abs(kpis.netSales - computedNet)).toBeLessThan(0.01);

    // Exact Gross Profit Formula
    const computedGp = kpis.netSales - kpis.cogs;
    expect(Math.abs(kpis.grossProfit - computedGp)).toBeLessThan(0.01);

    // Exact Gross Profit Margin
    const computedGpMargin = (kpis.grossProfit / kpis.netSales) * 100;
    expect(Math.abs(kpis.grossProfitMargin - computedGpMargin)).toBeLessThan(0.01);

    // Exact Operating Profit Formula
    const computedOp = kpis.grossProfit - kpis.operatingExpenses;
    expect(Math.abs(kpis.operatingProfit - computedOp)).toBeLessThan(0.01);
  });

  it('correctly calculates the 4 configurable commission policies for a representative', async () => {
    const repId = 'rep-cai-01'; // Omar Khaled

    // Policy 1: Gross basis (2%)
    const p1 = await commissionsService.recalculateCommission(repId, 'POLICY_GROSS');
    expect(p1.appliedRate).toBe(2.0);
    expect(p1.calculatedCommission).toBeCloseTo(p1.eligibleBaseAmount * 0.02, 2);

    // Policy 2: Net of discount basis (2%)
    const p2 = await commissionsService.recalculateCommission(repId, 'POLICY_NET_AFTER_DISCOUNT');
    expect(p2.eligibleBaseAmount).toBeLessThan(p1.eligibleBaseAmount);
    expect(p2.calculatedCommission).toBeCloseTo(p2.eligibleBaseAmount * 0.02, 2);

    // Policy 3: Net after returns (2%)
    const p3 = await commissionsService.recalculateCommission(repId, 'POLICY_NET_AFTER_RETURNS');
    expect(p3.eligibleBaseAmount).toBeLessThanOrEqual(p2.eligibleBaseAmount);
    expect(p3.calculatedCommission).toBeCloseTo(p3.eligibleBaseAmount * 0.02, 2);

    // Policy 4: Profit-based model (10% of profit)
    const p4 = await commissionsService.recalculateCommission(repId, 'POLICY_PROFIT_BASED');
    expect(p4.appliedRate).toBe(10.0);
    expect(p4.calculatedCommission).toBeCloseTo(p4.eligibleBaseAmount * 0.10, 2);
  });

  it('correctly categorizes receivables into exact calendar aging buckets', async () => {
    const aging = await financeService.getReceivablesAging();
    const { summary } = aging;

    expect(summary.totalReceivables).toBeGreaterThan(0);
    expect(summary.over90).toBeGreaterThan(0); // Includes Mansheya trading July invoice

    // Sum of buckets equals total receivables
    const bucketSum = summary.current + summary.days1To30 + summary.days31To60 + summary.days61To90 + summary.over90;
    expect(Math.abs(summary.totalReceivables - bucketSum)).toBeLessThan(0.01);
  });
});
