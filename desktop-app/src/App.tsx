import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.js';
import { LoginPage } from './pages/LoginPage.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { CeoOverviewPage } from './pages/CeoOverviewPage.js';
import { BranchComparisonPage } from './pages/BranchComparisonPage.js';
import { SalesRepsPage } from './pages/SalesRepsPage.js';
import { CommissionsPage } from './pages/CommissionsPage.js';
import { ProductProfitabilityPage } from './pages/ProductProfitabilityPage.js';
import { InventoryPage } from './pages/InventoryPage.js';
import { ReceivablesPage } from './pages/ReceivablesPage.js';
import { ExpensesPage } from './pages/ExpensesPage.js';
import { DataQualityAlertsPage } from './pages/DataQualityAlertsPage.js';
import { InvoicesPage } from './pages/InvoicesPage.js';
import { PaymentsPage } from './pages/PaymentsPage.js';
import { ImportPage } from './pages/ImportPage.js';
import { AuditLogsPage } from './pages/AuditLogsPage.js';
import { RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('ceo-overview');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span className="text-sm font-semibold">جاري تهيئة نظام إدارة التوزيع...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'ceo-overview':
        return <CeoOverviewPage />;
      case 'branch-comparison':
        return <BranchComparisonPage />;
      case 'sales-reps':
        return <SalesRepsPage />;
      case 'commissions':
        return <CommissionsPage />;
      case 'product-profitability':
        return <ProductProfitabilityPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'receivables':
        return <ReceivablesPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'data-quality':
        return <DataQualityAlertsPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'import':
        return <ImportPage />;
      case 'audit':
        return <AuditLogsPage />;
      default:
        return <CeoOverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />
        <main className="flex-1 overflow-y-auto bg-slate-950/70">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
