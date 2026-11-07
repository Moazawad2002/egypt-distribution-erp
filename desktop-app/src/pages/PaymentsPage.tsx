import React, { useEffect, useState } from 'react';
import { CreditCard, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Modal } from '../components/Modal.js';
import { AlertBanner } from '../components/AlertBanner.js';

export const PaymentsPage: React.FC = () => {
  const { selectedBranchId } = useAuth();
  const { t, formatCurrency } = useLanguage();

  const [payments, setPayments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Payment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CHEQUE'>('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [payList, custList, invList] = await Promise.all([
        api.getPayments(selectedBranchId || undefined),
        api.getCustomers(selectedBranchId || undefined),
        api.getInvoices(selectedBranchId || undefined)
      ]);
      setPayments(payList);
      setCustomers(custList);
      setInvoices(invList.filter((i: any) => i.balanceDue > 0));

      if (custList.length > 0 && !customerId) {
        setCustomerId(custList[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBranchId]);

  const handlePostPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const customer = customers.find(c => c.id === customerId);
      const payAmount = parseFloat(amount);

      const allocations = selectedInvoiceId
        ? [{ salesInvoiceId: selectedInvoiceId, amount: payAmount }]
        : undefined;

      await api.postPayment({
        customerId,
        branchId: customer?.branchId || selectedBranchId || 'branch-cai-01',
        amount: payAmount,
        paymentMethod,
        referenceNumber: referenceNumber || `REF-${Date.now().toString().slice(-6)}`,
        allocations
      });

      setIsModalOpen(false);
      setAmount('');
      setReferenceNumber('');
      setSelectedInvoiceId('');
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to post payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>جاري تحميل إيصالات التحصيل والسدادات...</span>
      </div>
    );
  }

  const customerInvoices = invoices.filter((i: any) => i.customerId === customerId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>{t('navPayments')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            قيد سدادات العملاء النقدية والبنكية وتخصيص الدفعات على فواتير المبيعات المفتوحة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل تحصيل جديد</span>
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

      {/* Payments Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="px-6 py-3">رقم الإيصال</th>
                <th className="px-6 py-3">{t('customer')}</th>
                <th className="px-6 py-3">{t('branch')}</th>
                <th className="px-6 py-3">{t('date')}</th>
                <th className="px-6 py-3">طريقة السداد</th>
                <th className="px-6 py-3">الرقم المرجعي / الشيك</th>
                <th className="px-6 py-3">{t('amount')}</th>
                <th className="px-6 py-3">غير مخصص</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-3.5 font-bold font-mono text-emerald-400">{p.paymentNumber}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-200">{p.customerName}</td>
                  <td className="px-6 py-3.5 text-slate-300">{p.branchName}</td>
                  <td className="px-6 py-3.5 text-slate-400">{new Date(p.paymentDate).toLocaleDateString('ar-EG')}</td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-semibold">
                      {p.paymentMethod === 'BANK_TRANSFER' ? 'تحويل بنكي' : p.paymentMethod === 'CHEQUE' ? 'شيك بنكي' : 'نقدي'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-400 font-mono">{p.referenceNumber}</td>
                  <td className="px-6 py-3.5 font-bold text-emerald-400">{formatCurrency(p.amount)}</td>
                  <td className="px-6 py-3.5">
                    {p.unallocatedAmount > 0 ? (
                      <span className="font-bold text-amber-400">{formatCurrency(p.unallocatedAmount)}</span>
                    ) : (
                      <span className="text-slate-500 font-semibold">مخصص بالكامل</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Payment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تسجيل إيصال تحصيل جديد">
        <form onSubmit={handlePostPayment} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">العميل</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                required
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">مبلغ التحصيل (ج.م)</label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">طريقة السداد</label>
              <select
                value={paymentMethod}
                onChange={(e: any) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="BANK_TRANSFER">تحويل بنكي</option>
                <option value="CHEQUE">شيك بنكي</option>
                <option value="CASH">نقدي</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">رقم التحويل / الشيك</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                placeholder="e.g. CIB-TX-998811"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              تخصيص السداد على فاتورة مفتوحة (اختياري)
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="">بدون تخصيص محدد (رصيد دائن غير مخصص)</option>
              {customerInvoices.map(inv => (
                <option key={inv.id} value={inv.id}>
                  فاتورة {inv.invoiceNumber} - المتبقي: {formatCurrency(inv.balanceDue)}
                </option>
              ))}
            </select>
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30"
            >
              {submitting ? 'جاري القيد...' : 'حفظ التحصيل'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
