import React, { useEffect, useState } from 'react';
import { Users, Target, TrendingUp, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { AlertBanner } from '../components/AlertBanner.js';

export const SalesRepsPage: React.FC = () => {
  const { selectedBranchId } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [reps, setReps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReps = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSalesRepsAnalytics(selectedBranchId || undefined);
      setReps(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load sales reps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReps();
  }, [selectedBranchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>جاري تحميل أداء مندوبي المبيعات...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-6"><AlertBanner type="error" title="خطأ" message={error} /></div>;
  }

  const totalTarget = reps.reduce((sum, r) => sum + r.targetAmount, 0);
  const totalNet = reps.reduce((sum, r) => sum + r.netSales, 0);
  const avgAchievement = totalTarget > 0 ? (totalNet / totalTarget) * 100 : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>{t('navSalesReps')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            متابعة إنجاز مندوبي المبيعات الستة مقابل المستهدف الشهري (إجمالي المستهدف: 3,190,000 ج.م)
          </p>
        </div>
        <button
          onClick={fetchReps}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('refresh')}</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">إجمالي المستهدف الشهري للفريق</span>
          <div className="text-2xl font-bold text-white mt-1">{formatCurrency(totalTarget)}</div>
          <span className="text-xs text-slate-500 mt-1 block">القاهرة (1.25M)، الإسكندرية (1.12M)، المنصورة (820K)</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">صافي المبيعات المحققة</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{formatCurrency(totalNet)}</div>
          <span className="text-xs text-slate-500 mt-1 block">بعد استبعاد الخصومات ومردودات المبيعات</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">متوسط نسبة الإنجاز العام</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{avgAchievement.toFixed(1)}%</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, avgAchievement)}%` }} />
          </div>
        </div>
      </div>

      {/* Reps Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reps.map((rep) => {
          const isOverperforming = rep.achievementRate >= 80;
          return (
            <div
              key={rep.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{rep.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{rep.code}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        backgroundColor: `${rep.branchColor}25`,
                        color: rep.branchColor === '#1E3A8A' ? '#60A5FA' : rep.branchColor === '#0D9488' ? '#2DD4BF' : '#4ADE80'
                      }}
                    >
                      {rep.branchName}
                    </span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-bold ${isOverperforming ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-amber-950/80 text-amber-400 border border-amber-800'}`}>
                  {rep.achievementRate.toFixed(1)}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>المحقق: {formatCurrency(rep.netSales)}</span>
                  <span>المستهدف: {formatCurrency(rep.targetAmount)}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${isOverperforming ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, rep.achievementRate)}%` }}
                  />
                </div>
              </div>

              {/* Metrics Detail */}
              <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">إجمالي المبيعات الأصلية:</span>
                  <span>{formatCurrency(rep.grossSales)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">الخصومات الممنوحة:</span>
                  <span className="text-amber-400 font-semibold">{formatCurrency(rep.discounts)} ({rep.discountRate.toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">مردودات المبيعات:</span>
                  <span className="text-rose-400 font-semibold">{formatCurrency(rep.returns)} ({rep.returnRate.toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between text-slate-300 font-bold border-t border-slate-800/50 pt-2">
                  <span className="text-slate-400">المساهمة في مجمل الربح:</span>
                  <span className="text-emerald-400">{formatCurrency(rep.grossProfit)} ({rep.grossMargin.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
