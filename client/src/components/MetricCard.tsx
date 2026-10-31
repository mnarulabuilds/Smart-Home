import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  statusText?: string;
  statusType?: 'normal' | 'warning' | 'danger' | 'info';
  percentage?: number;
  subtext?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  statusText,
  statusType = 'normal',
  percentage,
  subtext,
  onClick,
}) => {
  const getBadgeClass = () => {
    switch (statusType) {
      case 'danger':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'warning':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'info':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'normal':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const getBarColor = () => {
    switch (statusType) {
      case 'danger':
        return 'bg-rose-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-blue-500';
      case 'normal':
      default:
        return 'bg-emerald-500';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-5 relative overflow-hidden transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-700 hover:bg-slate-900/90' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline space-x-1.5 mb-2">
        <span className="text-3xl font-extrabold tracking-tight text-white">{value}</span>
        {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
      </div>

      {percentage !== undefined && (
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between text-xs">
        {statusText && (
          <span className={`px-2 py-0.5 rounded-full font-semibold border ${getBadgeClass()}`}>
            {statusText}
          </span>
        )}
        {subtext && <span className="text-slate-400 font-medium">{subtext}</span>}
      </div>
    </div>
  );
};
