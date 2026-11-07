import React, { useState } from 'react';
import { Lock, User as UserIcon, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [username, setUsername] = useState('ceo');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ username, password });
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickUsers = [
    { label: 'CEO (Sameh)', user: 'ceo', role: 'Executive (All Branches)', color: 'border-blue-500/40 bg-blue-900/20 text-blue-300' },
    { label: 'Cairo Mgr (Hassan)', user: 'manager.cairo', role: 'Branch Manager (CAI)', color: 'border-blue-700/40 bg-blue-950/40 text-blue-400' },
    { label: 'Alex Mgr (Ahmed)', user: 'manager.alex', role: 'Branch Manager (ALX)', color: 'border-teal-500/40 bg-teal-900/20 text-teal-300' },
    { label: 'Mansoura Mgr (Khaled)', user: 'manager.mansoura', role: 'Branch Manager (MNS)', color: 'border-emerald-500/40 bg-emerald-900/20 text-emerald-300' },
    { label: 'Accountant (Mona)', user: 'accountant', role: 'Finance & Collections', color: 'border-amber-500/40 bg-amber-900/20 text-amber-300' },
    { label: 'Admin (Tarek)', user: 'admin', role: 'System Administrator', color: 'border-purple-500/40 bg-purple-900/20 text-purple-300' }
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Left: Branding & Overview */}
        <div className="p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-blue-950/60 to-indigo-950/40 border-r border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>نظام موحد متعدد الفروع • Egypt FMCG</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
              نظام إدارة وتوزيع السلع الغذائية بمصر
            </h1>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              منصة مركزية لإدارة العمليات التجارية والمالية لفروع <span className="text-blue-400 font-semibold">القاهرة</span>، <span className="text-teal-400 font-semibold">الإسكندرية</span>، و<span className="text-emerald-400 font-semibold">المنصورة</span> مع عزل أمني صارم لحسابات الفروع.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/80">
            <div className="text-xs text-slate-400 mb-2 font-medium">الفروع التشغيلية المعتمدة:</div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-medium">القاهرة (Cairo)</span>
              <span className="px-2.5 py-1 rounded-md bg-teal-950/80 border border-teal-800 text-teal-300 text-xs font-medium">الإسكندرية (Alexandria)</span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-medium">المنصورة (Mansoura)</span>
            </div>
          </div>
        </div>

        {/* Right: Login Form & Role Switcher */}
        <div className="p-8 md:p-12 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">تسجيل الدخول للمنظومة</h2>
            <button
              type="button"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="text-xs text-blue-400 hover:text-blue-300 transition"
            >
              {language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                اسم المستخدم / البريد الإلكتروني
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-10 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  placeholder="e.g. ceo or manager.cairo"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-10 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
            >
              <span>{isSubmitting ? 'جاري التحقق...' : 'دخول النظام'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2.5">
              تبديل سريع للأدوار للاختبار والمراجعة:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {quickUsers.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUsername(item.user);
                    setPassword('Password123!');
                  }}
                  className={`p-2 rounded-lg border text-left text-xs transition hover:scale-[1.02] ${item.color}`}
                >
                  <div className="font-bold truncate">{item.label}</div>
                  <div className="text-[10px] opacity-75 truncate">{item.role}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
