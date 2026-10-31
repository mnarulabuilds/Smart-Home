import React from 'react';
import { useApp } from '../context/AppContext.js';
import { Flame, ShieldAlert, Zap, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';

export const AlertBanner: React.FC = () => {
  const { activeAlerts, setActiveTab, resolveAlert } = useApp();

  if (activeAlerts.length === 0) return null;

  const topAlert = activeAlerts[0];
  const isCritical = topAlert.severity === 'CRITICAL';

  const getIcon = () => {
    switch (topAlert.type) {
      case 'FIRE_ALERT':
        return <Flame className="w-5 h-5 text-rose-300 animate-bounce" />;
      case 'INTRUDER_ALERT':
        return <ShieldAlert className="w-5 h-5 text-rose-300 animate-pulse" />;
      case 'POWER_ALERT':
        return <Zap className="w-5 h-5 text-amber-300" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-300" />;
    }
  };

  const getBgClass = () => {
    if (isCritical) {
      return 'bg-gradient-to-r from-rose-950/90 via-red-900/90 to-rose-950/90 border-rose-600/70 text-rose-100 shadow-rose-950/50';
    }
    return 'bg-gradient-to-r from-amber-950/90 via-yellow-900/90 to-amber-950/90 border-amber-600/70 text-amber-100 shadow-amber-950/50';
  };

  return (
    <div className={`my-4 p-4 rounded-2xl border shadow-lg backdrop-blur-md transition-all ${getBgClass()}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 shrink-0">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded bg-black/40">
                {topAlert.type.replace('_', ' ')}
              </span>
              <span className="text-xs opacity-75">
                {new Date(topAlert.timestamp).toLocaleTimeString()}
              </span>
              {activeAlerts.length > 1 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20">
                  +{activeAlerts.length - 1} more
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm sm:text-base mt-1 text-white">{topAlert.title}</h4>
            <p className="text-xs sm:text-sm opacity-90 line-clamp-1">{topAlert.message}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:self-center shrink-0">
          <button
            onClick={() => resolveAlert(topAlert.id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Resolve</span>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-medium transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
