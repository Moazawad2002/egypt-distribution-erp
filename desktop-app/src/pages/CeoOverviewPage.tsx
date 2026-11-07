import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Percent,
  Wallet,
  Package,
  Target,
  AlertTriangle,
  RotateCcw,
  Tag,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { KpiCard } from '../components/KpiCard.js';
import { AlertBanner } from '../components/AlertBanner.js';

export const CeoOverviewPage: React.FC = () => {
  const { selectedBranchId } = useAuth();
  const { t, formatCurrency } = useLanguage();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCeoOverview(selectedBranchId || undefined);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load executive overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBranchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>جاري تحميل المؤشرات التنفيذية المركزية...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <AlertBanner type="error" title="خطأ في جلب البيانات" message={error || 'تعذر الاتصال بالخادم'} />
      </div>
    );
  }

  const { kpis, monthlyTrend, branchBreakdown, alerts } = data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{t('navCeoOverview')}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              محدث لعام 2026
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تحليل شامل للإيرادات، التكاليف المباشرة، هوامش الربحية التشغيلية، ومستهدفات فروع مصر
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('refresh')}</span>
        </button>
      </div>

      {/* Critical Alerts Banner if any */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alt: any) => (
            <AlertBanner
              key={alt.id}
              type={alt.severity === 'CRITICAL' ? 'error' : 'warning'}
              title={alt.title}
              message={alt.description}
            />
          ))}
        </div>
      )}

      {/* Primary KPI Grid (Financial Correctness) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title={t('grossSales')}
          value={kpis.grossSales}
          icon={ShoppingCart}
          variant="primary"
          trendText="+12.4% MoM"
        />
        <KpiCard
          title={t('netSales')}
          value={kpis.netSales}
          icon={DollarSign}
          variant="info"
          subtitle={`بعد خصم ${formatCurrency(kpis.discounts + kpis.returns)}`}
        />
        <KpiCard
          title={t('grossProfit')}
          value={kpis.grossProfit}
          icon={TrendingUp}
          variant="success"
          subtitle={`هامش مجمل: ${kpis.grossProfitMargin.toFixed(1)}%`}
        />
        <KpiCard
          title={t('operatingProfit')}
          value={kpis.operatingProfit}
          icon={Percent}
          variant={kpis.operatingProfit > 0 ? 'success' : 'danger'}
          subtitle={`هامش تشغيلي: ${kpis.operatingProfitMargin.toFixed(1)}%`}
        />
      </div>

      {/* Secondary KPI Grid (Working Capital, Deductions & Targets) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <KpiCard
          title={t('cogs')}
          value={kpis.cogs}
          icon={Package}
          variant="primary"
          trendText="متوسط مرجح"
        />
        <KpiCard
          title={t('discounts')}
          value={kpis.discounts}
          icon={Tag}
          variant="warning"
          subtitle={`معدل: ${kpis.discountRate.toFixed(1)}%`}
        />
        <KpiCard
          title={t('returns')}
          value={kpis.returns}
          icon={RotateCcw}
          variant="danger"
          subtitle={`معدل: ${kpis.returnRate.toFixed(1)}%`}
        />
        <KpiCard
          title={t('receivables')}
          value={kpis.outstandingReceivables}
          icon={Wallet}
          variant="warning"
          trendText="أرصدة عملاء"
        />
        <KpiCard
          title={t('inventoryValue')}
          value={kpis.inventoryValuation}
          icon={Package}
          variant="info"
          trendText="مستودعات الفروع"
        />
        <KpiCard
          title={t('achievementRate')}
          value={kpis.targetAchievementRate}
          icon={Target}
          variant={kpis.targetAchievementRate >= 80 ? 'success' : 'warning'}
          isCurrency={false}
          isPercent={true}
          subtitle={`المستهدف: ${formatCurrency(kpis.monthlyTarget)}`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Trend Area Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">تطور المبيعات وصافي الأرباح (2026)</h3>
              <p className="text-xs text-slate-400">مقارنة الإيرادات مقابل الربح التشغيلي</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" textAnchor="end" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} ج.م`, '']}
                />
                <Area type="monotone" dataKey="net" name="صافي المبيعات" stroke="#3B82F6" fillOpacity={1} fill="url(#colorNet)" />
                <Area type="monotone" dataKey="opProfit" name="الربح التشغيلي" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Contribution Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">مقارنة المبيعات بين فروع مصر</h3>
              <p className="text-xs text-slate-400">القاهرة vs الإسكندرية vs المنصورة</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchBreakdown} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="nameAr" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} ج.م`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="grossSales" name="إجمالي المبيعات" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="netSales" name="صافي المبيعات" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="grossProfit" name="مجمل الربح" fill="#15803D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Branch Performance League Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white">جدول أداء فروع الشركة التفصيلي</h3>
            <p className="text-xs text-slate-400">مقارنة المؤشرات المالية ونسب التحقيق</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">{t('branch')}</th>
                <th className="px-6 py-3">{t('grossSales')}</th>
                <th className="px-6 py-3">{t('netSales')}</th>
                <th className="px-6 py-3">{t('grossProfit')}</th>
                <th className="px-6 py-3">هامش الربح</th>
                <th className="px-6 py-3">{t('operatingProfit')}</th>
                <th className="px-6 py-3">{t('monthlyTarget')}</th>
                <th className="px-6 py-3">{t('achievementRate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {branchBreakdown.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-3.5 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.colorCode }} />
                    <span className="font-bold text-slate-200">{b.nameAr}</span>
                    <span className="text-slate-500 text-[10px]">({b.code})</span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-300">{formatCurrency(b.grossSales)}</td>
                  <td className="px-6 py-3.5 font-bold text-blue-400">{formatCurrency(b.netSales)}</td>
                  <td className="px-6 py-3.5 text-emerald-400 font-bold">{formatCurrency(b.grossProfit)}</td>
                  <td className="px-6 py-3.5 text-slate-300">{b.grossProfitMargin.toFixed(1)}%</td>
                  <td className="px-6 py-3.5 text-emerald-300">{formatCurrency(b.operatingProfit)}</td>
                  <td className="px-6 py-3.5 text-slate-400">{formatCurrency(b.monthlyTarget)}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, b.achievementRate)}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-200">{b.achievementRate.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
