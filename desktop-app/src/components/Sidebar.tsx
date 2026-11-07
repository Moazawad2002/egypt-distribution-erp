import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Coins,
  TrendingUp,
  Package,
  Wallet,
  Receipt,
  AlertTriangle,
  FileText,
  CreditCard,
  FileSpreadsheet,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { t } = useLanguage();

  const menuSections = [
    {
      title: t('navCeoOverview'),
      items: [
        { id: 'ceo-overview', label: t('navCeoOverview'), icon: LayoutDashboard },
        { id: 'branch-comparison', label: t('navBranchComparison'), icon: Building2 },
        { id: 'sales-reps', label: t('navSalesReps'), icon: Users },
        { id: 'commissions', label: t('navCommissions'), icon: Coins }
      ]
    },
    {
      title: t('navProductProfit'),
      items: [
        { id: 'product-profitability', label: t('navProductProfit'), icon: TrendingUp },
        { id: 'inventory', label: t('navInventory'), icon: Package },
        { id: 'receivables', label: t('navReceivables'), icon: Wallet },
        { id: 'expenses', label: t('navExpenses'), icon: Receipt },
        { id: 'data-quality', label: t('navDataQuality'), icon: AlertTriangle, badge: '3' }
      ]
    },
    {
      title: t('navInvoices'),
      items: [
        { id: 'invoices', label: t('navInvoices'), icon: FileText },
        { id: 'payments', label: t('navPayments'), icon: CreditCard },
        { id: 'import', label: t('navImport'), icon: FileSpreadsheet },
        { id: 'audit', label: t('navAudit'), icon: ShieldAlert }
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col h-[calc(100vh-4rem)] select-none">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              {section.title}
            </div>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800 text-slate-500 text-[11px] text-center">
        <span>Desktop Version 1.0.0 (Win-x64)</span>
      </div>
    </aside>
  );
};
