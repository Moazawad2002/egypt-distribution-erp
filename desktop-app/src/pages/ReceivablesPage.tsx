import React, { useEffect, useState } from 'react';
import { Wallet, AlertOctagon, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { AlertBanner } from '../components/AlertBanner.js';

export const ReceivablesPage: React.FC = () => {
  const { selectedBranchId } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [agingData, setAgingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAging = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getReceivablesAging(selectedBranchId || undefined);
      setAgingData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load receivables aging');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAging();
  }, [selectedBranchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>جاري تحليل أعمار ديون العملاء والتحصيلات...</span>
      </div>
    );
  }

  if (error || !agingData) {
    return <div className="p-6"><AlertBanner type="error" title="خطأ" message={error || 'تعذر تحميل البيانات'} /></div>;
  }

  const { summary, invoices } = agingData;

  const buckets = [
    { label: 'سارية (غير متأخرة)', amount: summary.current, color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' },
    { label: 'متأخرة 1 - 30 يوماً', amount: summary.days1To30, color: 'border-blue-500/40 bg-blue-950/20 text-blue-300' },
    { label: 'متأخرة 31 - 60 يوماً', amount: summary.days31To60, color: 'border-amber-500/40 bg-amber-950/20 text-amber-300' },
    { label: 'متأخرة 61 - 90 يوماً', amount: summary.days61To90, color: 'border-orange-500/40 bg-orange-950/20 text-orange-300' },
    { label: 'متأخرة > 90 يوماً (عالية المخاطر)', amount: summary.over90, color: 'border-rose-500/40 bg-rose-950/20 text-rose-300' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            <span>{t('navReceivables')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تحليل أعمار الديون وفق فترات الاستحقاق الائتمانية الممنوحة لعملاء التجزئة والجملة
          </p>
        </div>
        <button
          onClick={fetchAging}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('refresh')}</span>
        </button>
      </div>

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">إجمالي المديونيات القائمة</span>
          <div className="text-2xl font-bold text-white mt-1">{formatCurrency(summary.totalReceivables)}</div>
          <span className="text-xs text-slate-500 mt-1 block">رصيد الفواتير غير المسددة بالكامل</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">إجمالي الديون المتأخرة</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{formatCurrency(summary.totalOverdue)}</div>
          <span className="text-xs text-slate-500 mt-1 block">تجاوزت تاريخ الاستحقاق المتفق عليه</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">معدل الديون المتأخرة</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{summary.overdueRatio.toFixed(1)}%</div>
          <span className="text-xs text-slate-500 mt-1 block">نسبة الخطر الائتماني على السيولة</span>
        </div>
      </div>

      {/* Aging Buckets Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {buckets.map((b, idx) => (
          <div key={idx} className={`p-4 rounded-xl border ${b.color}`}>
            <span className="text-[11px] font-semibold block">{b.label}</span>
            <div className="text-lg font-bold mt-1">{formatCurrency(b.amount)}</div>
            <span className="text-[10px] opacity-80 mt-1 block">
              {summary.totalReceivables > 0 ? `${((b.amount / summary.totalReceivables) * 100).toFixed(1)}% من الإجمالي` : '0%'}
            </span>
          </div>
        ))}
      </div>

      {/* Detailed Overdue Invoices Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">بيان الفواتير المفتوحة وأيام التأخير</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="px-6 py-3">رقم الفاتورة</th>
                <th className="px-6 py-3">{t('customer')}</th>
                <th className="px-6 py-3">{t('branch')}</th>
                <th className="px-6 py-3">تاريخ الاستحقاق</th>
                <th className="px-6 py-3">أيام التأخير</th>
                <th className="px-6 py-3">شريحة الدين</th>
                <th className="px-6 py-3">المبلغ المتبقي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {invoices.map((inv: any) => {
                const isSeverelyOverdue = inv.daysOverdue > 60;
                return (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5 font-bold font-mono text-blue-400">{inv.invoiceNumber}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-200">{inv.customerName}</td>
                    <td className="px-6 py-3.5 text-slate-300">{inv.branchName}</td>
                    <td className="px-6 py-3.5 text-slate-400">{new Date(inv.dueDate).toLocaleDateString('ar-EG')}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        inv.daysOverdue > 0
                          ? isSeverelyOverdue
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                      }`}>
                        {inv.daysOverdue > 0 ? `${inv.daysOverdue} يوم متأخر` : 'سارية'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-400">{inv.bucket}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-100">{formatCurrency(inv.balanceDue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
