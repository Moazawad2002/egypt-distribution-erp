import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface AlertBannerProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'warning',
  title,
  message
}) => {
  const styles = {
    info: {
      bg: 'bg-blue-950/40 border-blue-800/80 text-blue-200',
      icon: Info,
      iconColor: 'text-blue-400'
    },
    warning: {
      bg: 'bg-amber-950/40 border-amber-800/80 text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-400'
    },
    error: {
      bg: 'bg-rose-950/40 border-rose-800/80 text-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-400'
    },
    success: {
      bg: 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400'
    }
  };

  const current = styles[type];
  const Icon = current.icon;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 ${current.bg} shadow-sm`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
      <div>
        <h4 className="text-sm font-bold tracking-tight">{title}</h4>
        <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{message}</p>
      </div>
    </div>
  );
};
