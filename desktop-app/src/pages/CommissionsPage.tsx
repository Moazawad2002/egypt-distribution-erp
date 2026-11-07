import React, { useEffect, useState } from 'react';
import { Coins, CheckCircle, RefreshCw, Calculator, ArrowRightLeft } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { AlertBanner } from '../components/AlertBanner.js';

export const CommissionsPage: React.FC = () => {
  const { selectedBranchId } = useAuth();
  const { t, formatCurrency } = useLanguage();

  const [commissions, setCommissions] = useState<any[]>([]);
  const [salesReps, setSalesReps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recalculator State
  const [selectedRep, setSelectedRep] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState('POLICY_NET_AFTER_RETURNS');
  const [calculating, setCalculating] = useState(false);
  const [calcSuccess, setCalcSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [comms, reps] = await Promise.all([
        api.getCommissions(selectedBranchId || undefined),
        api.getSalesReps(selectedBranchId || undefined)
      ]);
      setCommissions(comms);
      setSalesReps(reps);
      if (reps.length > 0 && !selectedRep) {
        setSelectedRep(reps[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load commissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBranchId]);

  const handleRecalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRep) return;
    setCalculating(true);
    setCalcSuccess(null);
    try {
      const res = await api.recalculateCommission(selectedRep, selectedPolicy);
      setCalcSuccess(`تمت إعادة حساب العمولة بنجاح: فارق التسوية ${formatCurrency(res.discrepancyAmount)}`);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to recalculate commission');
    } finally {
      setCalculating(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.updateCommissionStatus(id, 'APPROVED');
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to approve commission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>جاري مراجعة وتسوية عمولات المبيعات...</span>
      </div>
    );
  }

  const policies = [
    { code: 'POLICY_GROSS', label: 'السياسة 1: عمولة 2% على إجمالي المبيعات (بدون استقطاع)' },
    { code: 'POLICY_NET_AFTER_DISCOUNT', label: 'السياسة 2: عمولة 2% بعد خصم التخفيضات الممنوحة' },
    { code: 'POLICY_NET_AFTER_RETURNS', label: 'السياسة 3: عمولة 2% على صافي المبيعات (بعد الخصم والمردودات) [الموصى بها]' },
    { code: 'POLICY_PROFIT_BASED', label: 'السياسة 4: عمولة 10% على مجمل الربح المحقق (تحفيز الربحية)' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <span>{t('navCommissions')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            محرك تسوية العمولات متعدد السياسات، اكتشاف الفروقات السابقة، ومطابقة الاستحقاقات
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('refresh')}</span>
        </button>
      </div>

      {error && <AlertBanner type="error" title="خطأ" message={error} />}
      {calcSuccess && <AlertBanner type="success" title="تسوية مكتملة" message={calcSuccess} />}

      {/* Recalculation Engine Panel */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-400" />
          <span>محاكاة وإعادة احتساب العمولات بسياسات مختلفة</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          اختر المندوب وسياسة الاحتساب لمقارنة العمولة المسجلة دفترياً مقابل الاحتساب الفعلي بدقة
        </p>

        <form onSubmit={handleRecalculate} className="grid md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">مندوب المبيعات</label>
            <select
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {salesReps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} - {r.branchName} ({r.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">سياسة الاحتساب</label>
            <select
              value={selectedPolicy}
              onChange={(e) => setSelectedPolicy(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {policies.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={calculating}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{calculating ? 'جاري الاحتساب...' : 'إعادة الاحتساب والتسوية'}</span>
          </button>
        </form>
      </div>

      {/* Reconciled Commissions Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">جدول تسوية العمولات المعتمدة وفروقات الاحتساب</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="px-6 py-3">{t('representative')}</th>
                <th className="px-6 py-3">{t('branch')}</th>
                <th className="px-6 py-3">الأساس المستحق</th>
                <th className="px-6 py-3">المسجل سابقاً</th>
                <th className="px-6 py-3">المعاد احتسابه</th>
                <th className="px-6 py-3">فارق التسوية</th>
                <th className="px-6 py-3">{t('status')}</th>
                <th className="px-6 py-3">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {commissions.map((c) => {
                const hasDiscrepancy = Math.abs(c.discrepancyAmount) > 1;
                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-100">{c.salesRepName}</div>
                      <div className="text-[10px] text-slate-500">{c.policyCode}</div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-300">{c.branchName}</td>
                    <td className="px-6 py-3.5 text-slate-300">{formatCurrency(c.eligibleBaseAmount)}</td>
                    <td className="px-6 py-3.5 text-slate-400">{formatCurrency(c.recordedCommission)}</td>
                    <td className="px-6 py-3.5 font-bold text-amber-400">{formatCurrency(c.calculatedCommission)}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          hasDiscrepancy
                            ? c.discrepancyAmount < 0
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                              : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {formatCurrency(c.discrepancyAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'APPROVED'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      {c.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleApprove(c.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition"
                        >
                          اعتماد التسوية
                        </button>
                      )}
                    </td>
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
