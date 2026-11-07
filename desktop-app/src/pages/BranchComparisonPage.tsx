import React, { useEffect, useState } from 'react';
import { Building2, TrendingUp, AlertCircle, RefreshCw, Fuel, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.js';
import { AlertBanner } from '../components/AlertBanner.js';

export const BranchComparisonPage: React.FC = () => {
  const { t, formatCurrency } = useLanguage();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBranchComparison();
      setBranches(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load branch comparisons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>جاري تجميع بيانات مقارنة الفروع...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-6"><AlertBanner type="error" title="خطأ" message={error} /></div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span>{t('navBranchComparison')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            مقارنة الأداء التجاري والتشغيلي وهوامش الربحية بين القاهرة، الإسكندرية، والمنصورة
          </p>
        </div>
        <button
          onClick={fetchComparison}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('refresh')}</span>
        </button>
      </div>

      {/* Side-by-Side 3 Branch Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {branches.map((b) => (
          <div
            key={b.id}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between"
          >
            {/* Top Color Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: b.colorCode }} />

            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">{b.nameAr}</h3>
                  <span className="text-xs text-slate-400">{b.nameEn} ({b.code})</span>
                </div>
                <div
                  className="px-2.5 py-1 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: `${b.colorCode}20`,
                    borderColor: `${b.colorCode}50`,
                    color: b.colorCode === '#1E3A8A' ? '#60A5FA' : b.colorCode === '#0D9488' ? '#2DD4BF' : '#4ADE80'
                  }}
                >
                  {b.repsCount} مندوبين
                </div>
              </div>

              {/* Financial Metrics Stack */}
              <div className="space-y-3 divide-y divide-slate-800/80 text-xs">
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-slate-400">{t('grossSales')}:</span>
                  <span className="font-bold text-slate-200">{formatCurrency(b.grossSales)}</span>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-slate-400">{t('netSales')}:</span>
                  <span className="font-bold text-blue-400">{formatCurrency(b.netSales)}</span>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-slate-400">{t('grossProfit')}:</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(b.grossProfit)} ({b.grossProfitMargin.toFixed(1)}%)</span>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-slate-400">{t('operatingExpenses')}:</span>
                  <span className="font-bold text-rose-400">{formatCurrency(b.opex)}</span>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-slate-400">{t('operatingProfit')}:</span>
                  <span className="font-bold text-emerald-300">{formatCurrency(b.operatingProfit)} ({b.operatingMargin.toFixed(1)}%)</span>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-slate-400">تكلفة النقل والشحن:</span>
                  <span className="font-semibold text-amber-300 flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-amber-400" />
                    {formatCurrency(b.transportCost)}
                  </span>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-slate-400">المديونيات القائمة:</span>
                  <span className="font-bold text-slate-300">{formatCurrency(b.receivables)}</span>
                </div>
              </div>
            </div>

            {/* Bottom leak rates */}
            <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-center text-[11px]">
              <div className="p-2 rounded-lg bg-slate-800/50">
                <div className="text-slate-400">معدل الخصم</div>
                <div className="font-bold text-amber-400 mt-0.5">{b.discountRate.toFixed(1)}%</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/50">
                <div className="text-slate-400">معدل المردودات</div>
                <div className="font-bold text-rose-400 mt-0.5">{b.returnRate.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparative Bar Chart */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-1">مقارنة المؤشرات المالية بين الفروع</h3>
        <p className="text-xs text-slate-400 mb-4">صافي المبيعات مقابل تكلفة البضاعة والمصروفات التشغيلية</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={branches} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="nameAr" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toLocaleString()} ج.م`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="netSales" name="صافي المبيعات" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cogs" name="تكلفة البضاعة المباعة" fill="#64748B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="opex" name="المصروفات التشغيلية" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="operatingProfit" name="الربح التشغيلي" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
