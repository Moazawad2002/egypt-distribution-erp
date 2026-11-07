import React, { useEffect, useState } from 'react';
import { Receipt, Plus, RefreshCw, Fuel, Building2, TrendingDown } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Modal } from '../components/Modal.js';
import { AlertBanner } from '../components/AlertBanner.js';

export const ExpensesPage: React.FC = () => {
  const { selectedBranchId, user } = useAuth();
  const { t, formatCurrency } = useLanguage();

  const [expenses, setExpenses] = useState<any[]>([]);
  const [budgetVsActual, setBudgetVsActual] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Expense Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchId, setBranchId] = useState('');
  const [categoryId, setCategoryId] = useState('cat-transport');
  const [categoryName, setCategoryName] = useState('Transportation & Fleet Fuel');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [expList, bgtList] = await Promise.all([
        api.getExpenses(selectedBranchId || undefined),
        api.getBudgetVsActual(selectedBranchId || undefined)
      ]);
      setExpenses(expList);
      setBudgetVsActual(bgtList);
      if (!branchId && expList.length > 0) {
        setBranchId(selectedBranchId || expList[0].branchId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBranchId]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.postExpense({
        branchId: branchId || selectedBranchId || 'branch-cai-01',
        categoryId,
        categoryName,
        amount: parseFloat(amount),
        recipientOrVendor: recipient,
        paymentMethod,
        notes,
        isOperatingExpense: true
      });
      setIsModalOpen(false);
      setAmount('');
      setRecipient('');
      setNotes('');
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to post expense');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>جاري مراجعة المصروفات والموازنات التقديرية...</span>
      </div>
    );
  }

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-400" />
            <span>{t('navExpenses')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تتبع المصروفات التشغيلية، وقود أسطول النقل، ومقارنة الصرف الفعلي مقابل الموازنة المعتمدة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل مصروف جديد</span>
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('refresh')}</span>
          </button>
        </div>
      </div>

      {error && <AlertBanner type="error" title="خطأ" message={error} />}

      {/* Budget vs Actual Variance Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetVsActual.map((item) => (
          <div key={item.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-sm font-bold text-white">{item.categoryName}</h4>
                <span className="text-xs text-slate-400">{item.branchName}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                item.isOverBudget
                  ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
              }`}>
                {item.utilizationRate.toFixed(1)}% استهلاك
              </span>
            </div>

            <div className="mt-3 flex justify-between items-baseline text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">المصروف الفعلي:</span>
                <span className="text-base font-bold text-slate-200">{formatCurrency(item.actualSpent)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">الموازنة المعتمدة:</span>
                <span className="text-sm font-semibold text-slate-400">{formatCurrency(item.budgetAmount)}</span>
              </div>
            </div>

            {/* Variance Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${item.isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, item.utilizationRate)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Expenses Log Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">سجل المصروفات التشغيلية المقيدة</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="px-6 py-3">{t('date')}</th>
                <th className="px-6 py-3">بند المصروف</th>
                <th className="px-6 py-3">{t('branch')}</th>
                <th className="px-6 py-3">المستفيد / الجهة</th>
                <th className="px-6 py-3">طريقة السداد</th>
                <th className="px-6 py-3">{t('amount')}</th>
                <th className="px-6 py-3">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-3.5 text-slate-400">{exp.expenseDate}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-200">{exp.categoryName}</td>
                  <td className="px-6 py-3.5 text-slate-300">{exp.branchName}</td>
                  <td className="px-6 py-3.5 text-slate-300">{exp.recipientOrVendor}</td>
                  <td className="px-6 py-3.5 text-slate-400">{exp.paymentMethod}</td>
                  <td className="px-6 py-3.5 font-bold text-rose-400">{formatCurrency(exp.amount)}</td>
                  <td className="px-6 py-3.5 text-slate-400">{exp.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تسجيل مصروف تشغيلي جديد">
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">الفرع</label>
              <select
                value={branchId || selectedBranchId || 'branch-cai-01'}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="branch-cai-01">فرع القاهرة</option>
                <option value="branch-alx-02">فرع الإسكندرية</option>
                <option value="branch-mns-03">فرع المنصورة</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">بند المصروف</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setCategoryName(e.target.options[e.target.selectedIndex].text);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="cat-transport">Transportation & Fleet Fuel (نقل ووقود)</option>
                <option value="cat-rent">Warehouse Rent (إيجار مستودع)</option>
                <option value="cat-salaries">Branch Salaries (رواتب تشغيلية)</option>
                <option value="cat-utilities">Utilities & Electric (مرافق وكهرباء)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">المبلغ (ج.م)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">الجهة / المستفيد</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                placeholder="اسم المستفيد أو محطة الوقود"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">طريقة السداد</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="BANK_TRANSFER">تحويل بنكي / بطاقة وقود</option>
              <option value="CASH">نقدي من خزينة الفرع</option>
              <option value="CHEQUE">شيك بنكي</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">ملاحظات إضافية</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30"
            >
              {submitting ? 'جاري القيد...' : 'حفظ المصروف'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
