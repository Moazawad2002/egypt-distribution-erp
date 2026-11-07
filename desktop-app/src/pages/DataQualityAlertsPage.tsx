import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { AlertBanner } from '../components/AlertBanner.js';

export const DataQualityAlertsPage: React.FC = () => {
  const { selectedBranchId } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDataQualityAlerts(selectedBranchId || undefined);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load data quality alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [selectedBranchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>جاري تدقيق سلامة ونزاهة بيانات الفروع...</span>
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-6"><AlertBanner type="error" title="خطأ" message={error || 'تعذر تحميل البيانات'} /></div>;
  }

  const { alerts, metrics } = data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>{t('navDataQuality')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            محرك الرقابة الذاتية واكتشاف التكرارات، التجاوزات الائتمانية، وفروقات العمولات غير المعتمدة
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('refresh')}</span>
        </button>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">إجمالي التنبيهات النشطة</span>
          <div className="text-2xl font-bold text-white mt-1">{metrics.totalAlerts} تنبيهات</div>
          <span className="text-xs text-slate-500 mt-1 block">تتطلب مراجعة من الإدارة</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">تنبيهات عالية الخطورة</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{metrics.criticalAlerts} حرجة</div>
          <span className="text-xs text-slate-500 mt-1 block">ديون متأخرة أو فروقات جوهرية</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">مدفوعات غير مخصصة</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{metrics.unallocatedPaymentsCount} إيصالات</div>
          <span className="text-xs text-slate-500 mt-1 block">بقيمة {formatCurrency(metrics.unallocatedTotalAmount)}</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">فواتير تجاوزت سقف الخصم (&gt;5%)</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{metrics.highDiscountInvoicesCount} فواتير</div>
          <span className="text-xs text-slate-500 mt-1 block">تتطلب موافقة مدير الفرع</span>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {alerts.map((alt: any) => (
          <div
            key={alt.id}
            className={`p-5 rounded-2xl border shadow-lg flex items-start justify-between gap-4 ${
              alt.severity === 'CRITICAL'
                ? 'bg-rose-950/20 border-rose-800/60'
                : 'bg-amber-950/20 border-amber-800/60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 ${
                alt.severity === 'CRITICAL' ? 'bg-rose-900/50 text-rose-400' : 'bg-amber-900/50 text-amber-400'
              }`}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{alt.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    alt.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {alt.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alt.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                  <span>كود التنبيه: {alt.alertType}</span>
                  <span>•</span>
                  <span>{new Date(alt.createdAt).toLocaleString('ar-EG')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                // Simulate resolution
                alt.isResolved = true;
                setData({ ...data });
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition shrink-0"
            >
              تمت المراجعة
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
