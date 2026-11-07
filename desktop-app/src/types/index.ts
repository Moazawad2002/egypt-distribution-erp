export type UserRole = 'CEO' | 'BRANCH_MANAGER' | 'ACCOUNTANT' | 'INVENTORY_STAFF' | 'SALES_REP' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  branchId: string | null;
  branchCode?: string | null;
  permissions: string[];
}

export interface Branch {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  address?: string;
  phone?: string;
  colorCode: string;
  isActive: boolean;
}

export interface ExecutiveKpiSummary {
  grossSales: number;
  netSales: number;
  cogs: number;
  grossProfit: number;
  grossProfitMargin: number;
  operatingExpenses: number;
  operatingProfit: number;
  operatingProfitMargin: number;
  discounts: number;
  discountRate: number;
  returns: number;
  returnRate: number;
  outstandingReceivables: number;
  inventoryValuation: number;
  monthlyTarget: number;
  targetAchievementRate: number;
}
