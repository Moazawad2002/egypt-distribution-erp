import React, { useEffect, useState } from 'react';
import { FileText, Plus, RefreshCw, Eye, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Modal } from '../components/Modal.js';
import { AlertBanner } from '../components/AlertBanner.js';

export const InvoicesPage: React.FC = () => {
  const { selectedBranchId, user } = useAuth();
  const { t, formatCurrency } = useLanguage();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [salesReps, setSalesReps] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Invoice Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchId, setBranchId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [repId, setRepId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  // Invoice Details View
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invList, custList, repList, prodList] = await Promise.all([
        api.getInvoices(selectedBranchId || undefined),
        api.getCustomers(selectedBranchId || undefined),
        api.getSalesReps(selectedBranchId || undefined),
        api.getProducts()
      ]);
      setInvoices(invList);
      setCustomers(custList);
      setSalesReps(repList);
      setProducts(prodList);

      if (!branchId && custList.length > 0) {
        setBranchId(selectedBranchId || custList[0].branchId);
      }
      if (!customerId && custList.length > 0) setCustomerId(custList[0].id);
      if (!repId && repList.length > 0) setRepId(repList[0].id);
      if (!selectedProductId && prodList.length > 0) setSelectedProductId(prodList[0].id);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBranchId]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const prod = products.find(p => p.id === selectedProductId);
      if (!prod) throw new Error('Selected product not found');

      const qty = parseInt(quantity, 10);
      const disc = parseFloat(discountPercent) || 0;

      await api.createInvoice({
        branchId: branchId || selectedBranchId || 'branch-cai-01',
        customerId,
        salesRepresentativeId: repId,
        dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        lines: [
          {
            productId: prod.id,
            quantity: qty,
            unitPrice: prod.sellingPrice,
            discountPercent: disc
          }
        ]
      });

      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create sales invoice');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>جاري تحميل فواتير المبيعات...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>{t('navInvoices')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            إصدار ومتابعة فواتير التوزيع، الأرصدة المستحقة، واستقطاع المخزون الذاتي
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>فاتورة مبيعات جديدة</span>
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

      {/* Invoices Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="px-6 py-3">رقم الفاتورة</th>
                <th className="px-6 py-3">{t('customer')}</th>
                <th className="px-6 py-3">{t('representative')}</th>
                <th className="px-6 py-3">{t('branch')}</th>
                <th className="px-6 py-3">الإجمالي الأصلي</th>
                <th className="px-6 py-3">{t('discounts')}</th>
                <th className="px-6 py-3">{t('netSales')}</th>
                <th className="px-6 py-3">المتبقي للتحصيل</th>
                <th className="px-6 py-3">حالة السداد</th>
                <th className="px-6 py-3">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-3.5 font-bold font-mono text-blue-400">{inv.invoiceNumber}</td>
                  <td className="px-6 py-3.5 text-slate-200 font-bold">{inv.customerName}</td>
                  <td className="px-6 py-3.5 text-slate-300">{inv.repName}</td>
                  <td className="px-6 py-3.5 text-slate-400">{inv.branchName}</td>
                  <td className="px-6 py-3.5 text-slate-400">{formatCurrency(inv.grossAmount)}</td>
                  <td className="px-6 py-3.5 text-amber-400">{formatCurrency(inv.discountAmount)}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-100">{formatCurrency(inv.netAmount)}</td>
                  <td className="px-6 py-3.5 font-bold text-rose-400">{formatCurrency(inv.balanceDue)}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.paymentStatus === 'PAID'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                        : inv.paymentStatus === 'PARTIAL'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-800'
                    }`}>
                      {inv.paymentStatus === 'PAID' ? 'مسددة بالكامل' : inv.paymentStatus === 'PARTIAL' ? 'مسددة جزئياً' : 'غير مسددة'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <button
                      onClick={async () => {
                        const full = await api.getInvoiceById(inv.id);
                        setViewInvoice(full);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إصدار فاتورة مبيعات جديدة">
        <form onSubmit={handleCreateInvoice} className="space-y-4">
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
                  <option key={c.id} value={c.id}>
                    {c.name} - حد ائتمان ({formatCurrency(c.creditLimit)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">مندوب المبيعات</label>
              <select
                value={repId}
                onChange={(e) => setRepId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                required
              >
                {salesReps.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">الصنف</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nameAr} - سعر البيع: {formatCurrency(p.sellingPrice)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">الكمية (كرتونة)</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">نسبة الخصم الممنوح %</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">تاريخ الاستحقاق</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
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
              {submitting ? 'جاري الإصدار والتسجيل...' : 'إصدار الفاتورة'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Detail Modal */}
      {viewInvoice && (
        <Modal isOpen={!!viewInvoice} onClose={() => setViewInvoice(null)} title={`تفاصيل فاتورة ${viewInvoice.invoiceNumber}`}>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/50 rounded-xl">
              <div><span className="text-slate-400">العميل:</span> <strong className="text-white">{viewInvoice.customerName}</strong></div>
              <div><span className="text-slate-400">المندوب:</span> <strong className="text-white">{viewInvoice.repName}</strong></div>
              <div><span className="text-slate-400">تاريخ الإصدار:</span> <span className="text-slate-300">{new Date(viewInvoice.invoiceDate).toLocaleDateString('ar-EG')}</span></div>
              <div><span className="text-slate-400">تاريخ الاستحقاق:</span> <span className="text-slate-300">{new Date(viewInvoice.dueDate).toLocaleDateString('ar-EG')}</span></div>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 mb-2">البنود الصادرة في الفاتورة:</h4>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-slate-800 text-slate-400">
                    <tr>
                      <th className="p-2.5">الصنف</th>
                      <th className="p-2.5">الكمية</th>
                      <th className="p-2.5">سعر الوحدة</th>
                      <th className="p-2.5">إجمالي البند</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {viewInvoice.lines?.map((l: any) => (
                      <tr key={l.id}>
                        <td className="p-2.5 font-bold text-slate-200">{l.productName}</td>
                        <td className="p-2.5 text-slate-300">{l.quantity}</td>
                        <td className="p-2.5 text-slate-300">{formatCurrency(l.unitPrice)}</td>
                        <td className="p-2.5 font-bold text-blue-400">{formatCurrency(l.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800 font-bold">
              <span>صافي الفاتورة النهائي:</span>
              <span className="text-base text-emerald-400">{formatCurrency(viewInvoice.netAmount)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
