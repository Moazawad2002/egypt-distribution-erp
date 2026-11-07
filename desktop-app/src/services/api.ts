const API_BASE = 'http://localhost:4000/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('erp_token');
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }

      return data.data !== undefined ? data.data : data;
    } catch (err: any) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  }

  // Auth
  login(credentials: { username: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  // Branches & Master Data
  getBranches() {
    return this.request('/org/branches');
  }

  getSalesReps(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/org/sales-reps${query}`);
  }

  getCustomers(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/org/customers${query}`);
  }

  // Sales & Returns
  getInvoices(branchId?: string, status?: string) {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/sales/invoices${query}`);
  }

  getInvoiceById(id: string) {
    return this.request(`/sales/invoices/${id}`);
  }

  createInvoice(payload: any) {
    return this.request('/sales/invoices', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  getReturns(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/sales/returns${query}`);
  }

  createReturn(payload: any) {
    return this.request('/sales/returns', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Inventory
  getProducts() {
    return this.request('/inventory/products');
  }

  getInventoryMovements(productId?: string) {
    const query = productId ? `?productId=${productId}` : '';
    return this.request(`/inventory/movements${query}`);
  }

  getInventorySummary() {
    return this.request('/inventory/summary');
  }

  // Finance
  getReceivablesAging(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/finance/aging${query}`);
  }

  getPayments(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/finance/payments${query}`);
  }

  postPayment(payload: any) {
    return this.request('/finance/payments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  getExpenses(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/finance/expenses${query}`);
  }

  postExpense(payload: any) {
    return this.request('/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  getBudgetVsActual(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/finance/budget-vs-actual${query}`);
  }

  // Commissions
  getCommissions(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/commissions/calculations${query}`);
  }

  recalculateCommission(salesRepresentativeId: string, policyCode: string) {
    return this.request('/commissions/recalculate', {
      method: 'POST',
      body: JSON.stringify({ salesRepresentativeId, policyCode })
    });
  }

  updateCommissionStatus(id: string, status: string) {
    return this.request(`/commissions/calculations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Analytics & Dashboards
  getCeoOverview(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/analytics/ceo-overview${query}`);
  }

  getBranchComparison() {
    return this.request('/analytics/branch-comparison');
  }

  getSalesRepsAnalytics(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/analytics/sales-reps${query}`);
  }

  getProductProfitability() {
    return this.request('/analytics/product-profitability');
  }

  getDataQualityAlerts(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/analytics/data-quality-alerts${query}`);
  }

  // Imports
  stageImportFile(payload: { fileName: string; fileContentBase64: string }) {
    return this.request('/import/stage', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  commitImport(validRows: any[]) {
    return this.request('/import/commit', {
      method: 'POST',
      body: JSON.stringify({ validRows })
    });
  }

  // Audit
  getAuditLogs() {
    return this.request('/audit/logs');
  }
}

export const api = new ApiClient();
