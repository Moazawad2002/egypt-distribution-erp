import React, { useEffect, useState } from 'react';
import { TrendingUp, Package, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.js';
import { AlertBanner } from '../components/AlertBanner.js';

export const ProductProfitabilityPage: React.FC = () => {
  const { t, formatCurrency } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProductProfitability();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load product profitability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>جاري تحليل ربحية المنتجات...</span>
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
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>{t('navProductProfit')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تحليل مساهمة أصناف السلع الغذائية والاستهلاكية في هوامش الربحية وتكلفة الإحلال
          </p>
        </div>
        <button
          onClick={fetchProducts}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('refresh')}</span>
        </button>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="px-6 py-3">الصنف والباركود</th>
                <th className="px-6 py-3">العلامة التجارية</th>
                <th className="px-6 py-3">سعر البيع</th>
                <th className="px-6 py-3">تكلفة الشراء (WAC)</th>
                <th className="px-6 py-3">الكمية المباعة</th>
                <th className="px-6 py-3">صافي الإيراد</th>
                <th className="px-6 py-3">إجمالي التكلفة (COGS)</th>
                <th className="px-6 py-3">{t('grossProfit')}</th>
                <th className="px-6 py-3">هامش الربح %</th>
                <th className="px-6 py-3">رصيد المستودع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {products.map((p) => {
                const isHighMargin = p.grossProfitMargin >= 15;
                const isLowStock = p.currentStock <= p.reorderPoint;
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-100">{p.nameAr}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{p.sku}</div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-300">{p.brand}</td>
                    <td className="px-6 py-3.5 text-slate-200 font-bold">{formatCurrency(p.sellingPrice)}</td>
                    <td className="px-6 py-3.5 text-slate-400">{formatCurrency(p.costPrice)}</td>
                    <td className="px-6 py-3.5 text-slate-300">{p.quantitySold.toLocaleString()} كرتونة</td>
                    <td className="px-6 py-3.5 font-bold text-blue-400">{formatCurrency(p.netRevenue)}</td>
                    <td className="px-6 py-3.5 text-slate-400">{formatCurrency(p.cogs)}</td>
                    <td className="px-6 py-3.5 font-bold text-emerald-400">{formatCurrency(p.grossProfit)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        isHighMargin
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                      }`}>
                        {p.grossProfitMargin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">{p.currentStock}</span>
                        {isLowStock && (
                          <span className="p-1 rounded bg-rose-950/60 text-rose-400 border border-rose-800 text-[10px]" title="دون نقطة إعادة الطلب">
                            إعادة طلب
                          </span>
                        )}
                      </div>
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
