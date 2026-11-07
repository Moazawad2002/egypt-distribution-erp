import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, Key, UserCheck, FileCheck } from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.js';
import { AlertBanner } from '../components/AlertBanner.js';

export const AuditLogsPage: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>جاري تحميل سجل الرقابة والأمان...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <span>{t('navAudit')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            سجل التدقيق الأمني والرقابي الشامل للعمليات الحساسة، تسجيل الدخول، والاعتمادات المالية
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('refresh')}</span>
        </button>
      </div>

      {error && <AlertBanner type="error" title="خطأ" message={error} />}

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="px-6 py-3">الوقت والتاريخ</th>
                <th className="px-6 py-3">المستخدم (Actor)</th>
                <th className="px-6 py-3">نوع العملية</th>
                <th className="px-6 py-3">الكائن المعني</th>
                <th className="px-6 py-3">تفاصيل الحركة</th>
                <th className="px-6 py-3">عنوان IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-3.5 text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString('ar-EG')}
                  </td>
                  <td className="px-6 py-3.5 font-bold text-slate-200">
                    {log.username || log.userId || 'النظام'}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-bold text-indigo-300 font-mono">
                    {log.entityName}
                  </td>
                  <td className="px-6 py-3.5 text-slate-300">
                    {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                  </td>
                  <td className="px-6 py-3.5 text-slate-400 font-mono text-[11px]">
                    {log.ipAddress || '127.0.0.1'}
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
