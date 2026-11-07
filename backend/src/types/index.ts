import { Request } from 'express';

export type UserRole = 'CEO' | 'BRANCH_MANAGER' | 'ACCOUNTANT' | 'INVENTORY_STAFF' | 'SALES_REP' | 'ADMIN';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  branchId: string | null;
  branchCode?: string | null;
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  scopedBranchId?: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
  branchId?: string;
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
