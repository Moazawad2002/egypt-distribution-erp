import React, { useEffect, useState } from 'react';
import { Package, ArrowUpRight, ArrowDownLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.js';
import { AlertBanner } from '../components/AlertBanner.js';

export const InventoryPage: React.FC = () => {
  const { t, formatCurrency } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, movs] = await Promise.all([
        api.getProducts(),
        api.getInventoryMovements()
      ]);
      setProducts(prods);
      setMovements(movs);
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>جاري تحميل بيانات المستودعات والمخزون...</span>
      </div>
    );
  }

  const totalValuation = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);
  const lowStockCount = products.filter(p => p.isLowStock).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-400" />
            <span>{t('navInventory')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            إدارة الأرصدة، مستويات إعادة الطلب، وقيد حركات الصرف والاستلام بأسعار التكلفة
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

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">إجمالي تقييم المخزون (WAC)</span>
          <div className="text-2xl font-bold text-white mt-1">{formatCurrency(totalValuation)}</div>
          <span className="text-xs text-slate-500 mt-1 block">بمستودعات العبور، سموحة، والمنصورة</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">إجمالي الأصناف المدارة (SKUs)</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{products.length} أصناف رئيسية</div>
          <span className="text-xs text-slate-500 mt-1 block">زيوت، أرز، مكرونة، سكر، منظفات</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">تنبيهات الأصناف المنخفضة</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{lowStockCount} أصناف بحاجة لتوريد</div>
          <span className="text-xs text-slate-500 mt-1 block">بلغت أو تجاوزت نقطة إعادة الطلب</span>
        </div>
      </div>

      {/* Movements Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">سجل حركات المخزون المستندي</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="px-6 py-3">التاريخ والوقت</th>
                <th className="px-6 py-3">نوع الحركة</th>
                <th className="px-6 py-3">الصنف</th>
                <th className="px-6 py-3">المستند المرجعي</th>
                <th className="px-6 py-3">الكمية (+ / -)</th>
                <th className="px-6 py-3">تكلفة الوحدة</th>
                <th className="px-6 py-3">إجمالي القيمة</th>
                <th className="px-6 py-3">الرصيد بعد الحركة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {movements.map((m) => {
                const isOut = m.quantityChange < 0;
                return (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5 text-slate-400">{new Date(m.timestamp).toLocaleDateString('ar-EG')}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isOut
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                      }`}>
                        {isOut ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        {m.movementType}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-200">{m.productName}</td>
                    <td className="px-6 py-3.5 text-slate-400 font-mono">{m.referenceId}</td>
                    <td className={`px-6 py-3.5 font-bold ${isOut ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                    </td>
                    <td className="px-6 py-3.5 text-slate-300">{formatCurrency(m.unitCost)}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-200">{formatCurrency(m.totalCost)}</td>
                    <td className="px-6 py-3.5 font-bold text-blue-400">{m.balanceAfter}</td>
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
