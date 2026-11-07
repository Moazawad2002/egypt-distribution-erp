import React from 'react';
import { Building2, Globe, LogOut, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';

export const Navbar: React.FC = () => {
  const { user, selectedBranchId, setSelectedBranchId, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const isGlobalUser = user?.role === 'CEO' || user?.role === 'ADMIN';

  const branchColors: Record<string, { bg: string; text: string; name: string }> = {
    'branch-cai-01': { bg: 'bg-blue-900/60 border-blue-500', text: 'text-blue-300', name: t('cairoBranch') },
    'branch-alx-02': { bg: 'bg-teal-900/60 border-teal-500', text: 'text-teal-300', name: t('alexBranch') },
    'branch-mns-03': { bg: 'bg-emerald-900/60 border-emerald-500', text: 'text-emerald-300', name: t('mansouraBranch') }
  };

  const currentBranchBadge = selectedBranchId && branchColors[selectedBranchId]
    ? branchColors[selectedBranchId]
    : { bg: 'bg-indigo-900/60 border-indigo-500', text: 'text-indigo-300', name: t('allBranches') };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between z-20">
      {/* Brand & Branch Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            EG
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100">{t('appName')}</h1>
            <p className="text-xs text-slate-400">{t('appSubTitle')}</p>
          </div>
        </div>

        {/* Branch Context Switcher */}
        <div className="h-6 w-px bg-slate-800 mx-2" />

        <div className="flex items-center gap-2">
          {isGlobalUser ? (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <select
                value={selectedBranchId || ''}
                onChange={(e) => setSelectedBranchId(e.target.value || null)}
                className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
              >
                <option value="">{t('allBranches')}</option>
                <option value="branch-cai-01">{t('cairoBranch')}</option>
                <option value="branch-alx-02">{t('alexBranch')}</option>
                <option value="branch-mns-03">{t('mansouraBranch')}</option>
              </select>
            </div>
          ) : (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${currentBranchBadge.bg} ${currentBranchBadge.text}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {currentBranchBadge.name}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Backend Online Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-medium">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>API Online (Port 4000)</span>
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
          title="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* User Card & Logout */}
        {user && (
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-200">{user.fullName}</div>
              <div className="flex items-center justify-end gap-1 text-[11px] text-blue-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                {user.role}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 border border-slate-700 transition"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
