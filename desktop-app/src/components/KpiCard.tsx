import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface KpiCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  isCurrency?: boolean;
  isPercent?: boolean;
  trendText?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'primary',
  isCurrency = true,
  isPercent = false,
  trendText
}) => {
  const { formatCurrency } = useLanguage();

  const colorStyles = {
    primary: 'from-blue-600/20 to-blue-900/10 border-blue-500/30 text-blue-400',
    success: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400',
    warning: 'from-amber-600/20 to-amber-900/10 border-amber-500/30 text-amber-400',
    danger: 'from-rose-600/20 to-rose-900/10 border-rose-500/30 text-rose-400',
    info: 'from-teal-600/20 to-teal-900/10 border-teal-500/30 text-teal-400'
  };

  const formattedDisplay = isCurrency
    ? formatCurrency(value)
    : isPercent
    ? `${value.toFixed(1)}%`
    : value.toLocaleString();

  return (
    <div className={`p-4 rounded-xl border bg-gradient-to-br ${colorStyles[variant]} backdrop-blur-sm transition-all hover:scale-[1.01]`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="p-2 rounded-lg bg-slate-800/80">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-100 tracking-tight">
        {formattedDisplay}
      </div>
      {(subtitle || trendText) && (
        <div className="flex items-center justify-between mt-2 text-xs">
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
          {trendText && (
            <span className="px-2 py-0.5 rounded-full bg-slate-800/60 font-semibold text-slate-300">
              {trendText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
