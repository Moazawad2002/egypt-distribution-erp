import React, { useState } from 'react';
import { FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.js';
import { AlertBanner } from '../components/AlertBanner.js';

export const ImportPage: React.FC = () => {
  const { t, formatCurrency } = useLanguage();

  const [fileName, setFileName] = useState<string>('');
  const [fileBase64, setFileBase64] = useState<string>('');
  const [stagedResult, setStagedResult] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStagedResult(null);
    setCommitResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setFileBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleStageFile = async () => {
    if (!fileBase64) return;
    setProcessing(true);
    setError(null);
    try {
      const res = await api.stageImportFile({
        fileName,
        fileContentBase64: fileBase64
      });
      setStagedResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to process import file');
    } finally {
      setProcessing(false);
    }
  };

  const handleCommit = async () => {
    if (!stagedResult) return;
    setCommitting(true);
    setError(null);
    try {
      const validRows = stagedResult.previewRows.filter((r: any) => r.isValid);
      const res = await api.commitImport(validRows);
      setCommitResult(res);
      setStagedResult(null);
    } catch (err: any) {
      setError(err.message || 'Failed to commit import records');
    } finally {
      setCommitting(false);
    }
  };

  const handleLoadDemoCsv = () => {
    const demoCsv = `invoice_number,branch_code,customer_code,rep_code,invoice_date,due_date,gross_amount,discount_amount,net_amount\n` +
      `INV-CAI-IMP-101,CAI,CUST-CAI-001,REP-CAI-01,2026-10-10,2026-11-10,120000,2400,117600\n` +
      `INV-ALX-IMP-102,ALX,CUST-ALX-001,REP-ALX-01,2026-10-10,2026-11-10,85000,1700,83300\n` +
      `INV-MNS-IMP-103,MNS,CUST-MNS-001,REP-MNS-01,2026-10-10,2026-11-10,64000,1200,62800\n` +
      `INV-CAI-2026-001,CAI,CUST-CAI-001,REP-CAI-01,2026-10-10,2026-11-10,50000,1000,49000\n` + // Duplicate invoice!
      `INV-ERR-999,INVALID_BRANCH,CUST-CAI-001,REP-CAI-01,2026-10-10,2026-11-10,-5000,0,-5000`; // Invalid branch & negative amount!

    const base64 = btoa(demoCsv);
    setFileName('demo_historical_sales.csv');
    setFileBase64(base64);
    setStagedResult(null);
    setCommitResult(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <span>{t('navImport')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            استيراد ومعالجة ملفات الإكسل والشيتات القديمة عبر مرحلة تدقيق ومطابقة مسبقة
          </p>
        </div>

        <button
          onClick={handleLoadDemoCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-xs font-semibold text-indigo-300 transition"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>تحميل نموذج تجريبي لاختبار التدقيق</span>
        </button>
      </div>

      {error && <AlertBanner type="error" title="خطأ في الاستيراد" message={error} />}
      {commitResult && (
        <AlertBanner
          type="success"
          title="تم اعتماد الاستيراد بنجاح"
          message={`تم إدراج ${commitResult.committedCount} سجلاً فعلياً في قاعدة البيانات المركزية وتسجيل الحركة بالرقابة.`}
        />
      )}

      {/* File Upload Drop Zone */}
      <div className="p-8 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 hover:border-blue-500 transition text-center">
        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-white mb-1">اسحب ملف Excel أو CSV هنا، أو اضغط للاختيار</h3>
        <p className="text-xs text-slate-400 mb-4">يدعم ملفات (.xlsx, .xls, .csv) الخاصة بفواتير المبيعات أو قوائم العملاء والأصناف</p>

        <div className="flex items-center justify-center gap-3">
          <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-600 transition">
            <span>تصفح ملف من الجهاز</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {fileName && (
            <button
              onClick={handleStageFile}
              disabled={processing}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${processing ? 'animate-spin' : ''}`} />
              <span>{processing ? 'جاري الفحص والتدقيق...' : `فحص وتدقيق (${fileName})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Staging Summary & Validation Report */}
      {stagedResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold uppercase">إجمالي الصفوف المفحوصة</span>
              <div className="text-2xl font-bold text-white mt-1">{stagedResult.totalRows} صف</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80">
              <span className="text-xs text-emerald-400 font-semibold uppercase">صفوف سليمة ومطابقة</span>
              <div className="text-2xl font-bold text-emerald-300 mt-1">{stagedResult.validRowsCount} صف</div>
            </div>
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80">
              <span className="text-xs text-rose-400 font-semibold uppercase">صفوف مرفوضة ومستبعدة</span>
              <div className="text-2xl font-bold text-rose-300 mt-1">{stagedResult.rejectedRowsCount} خطأ</div>
            </div>
          </div>

          {/* Rejected Rows Detail */}
          {stagedResult.rejectedRowsCount > 0 && (
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-800/60 shadow-lg">
              <h4 className="text-sm font-bold text-rose-300 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>تقرير الصفوف المستبعدة وأسباب الرفض:</span>
              </h4>
              <div className="space-y-2 mt-3">
                {stagedResult.rejectedRows.map((rej: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-rose-900/40 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-rose-400">السطر #{rej.rowNumber}:</span>
                      <span className="text-slate-300 mr-2">{rej.error}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {rej.raw.invoice_number || rej.raw.InvoiceNumber || 'بدون رقم'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valid Preview Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h4 className="text-sm font-bold text-white">معاينة الصفوف السليمة الجاهزة للترحيل</h4>
              {stagedResult.validRowsCount > 0 && (
                <button
                  onClick={handleCommit}
                  disabled={committing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{committing ? 'جاري الاعتماد...' : `اعتماد وترحيل (${stagedResult.validRowsCount} صف)`}</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="px-6 py-3">السطر</th>
                    <th className="px-6 py-3">رقم الفاتورة</th>
                    <th className="px-6 py-3">كود الفرع</th>
                    <th className="px-6 py-3">العميل</th>
                    <th className="px-6 py-3">المندوب</th>
                    <th className="px-6 py-3">الإجمالي</th>
                    <th className="px-6 py-3">الخصم</th>
                    <th className="px-6 py-3">الصافي</th>
                    <th className="px-6 py-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {stagedResult.previewRows.map((r: any) => (
                    <tr key={r.rowNumber} className={r.isValid ? 'hover:bg-slate-800/40' : 'bg-rose-950/10'}>
                      <td className="px-6 py-3 text-slate-400">#{r.rowNumber}</td>
                      <td className="px-6 py-3 font-mono font-bold text-blue-400">{r.invoiceNumber}</td>
                      <td className="px-6 py-3 text-slate-300">{r.branchCode}</td>
                      <td className="px-6 py-3 text-slate-300">{r.customerCode}</td>
                      <td className="px-6 py-3 text-slate-300">{r.repCode}</td>
                      <td className="px-6 py-3 text-slate-300">{formatCurrency(r.grossAmount)}</td>
                      <td className="px-6 py-3 text-amber-400">{formatCurrency(r.discountAmount)}</td>
                      <td className="px-6 py-3 font-bold text-emerald-400">{formatCurrency(r.netAmount)}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.isValid
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-800'
                        }`}>
                          {r.isValid ? 'سليم' : 'مرفوض'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
