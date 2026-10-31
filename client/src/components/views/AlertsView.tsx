import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import {
  Flame,
  ShieldAlert,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  CheckCircle2,
  BellRing,
} from 'lucide-react';
import { Alert, AlertSeverity, AlertStatus } from '../../types/index.js';

export const AlertsView: React.FC = () => {
  const { allAlerts, activeAlerts, resolveAlert, acknowledgeAlert } = useApp();
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | AlertSeverity>('ALL');

  const filtered = allAlerts.filter((a) => {
    if (filterStatus === 'ACTIVE' && a.status !== 'ACTIVE') return false;
    if (filterStatus === 'RESOLVED' && a.status !== 'RESOLVED') return false;
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    return true;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'FIRE_ALERT':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'INTRUDER_ALERT':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'POWER_ALERT':
        return <Zap className="w-5 h-5 text-amber-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'INFO':
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Alerts & Incident Dispatch</span>
            {activeAlerts.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                {activeAlerts.length} Active
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400">
            Intelligent anomaly triggers: fire suppression, intrusion security, and energy management.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Feed List */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Incidents to Show</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
            No alerts match your current filter. Use the IoT Simulator to test fire hazards, room intrusions, or energy waste scenarios.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const isResolved = alert.status === 'RESOLVED';
            const isActive = alert.status === 'ACTIVE';

            return (
              <div
                key={alert.id}
                className={`glass-panel p-5 transition-all ${
                  isActive
                    ? 'border-slate-700 bg-slate-900/90'
                    : 'opacity-70 bg-slate-950/40 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 shrink-0">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-extrabold text-white text-base">
                          {alert.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider border ${getSeverityBadge(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isActive
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {alert.status}
                        </span>
                      </div>

                      <p className="text-sm text-slate-300 mt-1">{alert.message}</p>

                      <div className="flex items-center space-x-4 text-xs text-slate-400 mt-3 font-mono">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Logged: {new Date(alert.timestamp).toLocaleString()}</span>
                        </span>
                        {alert.resolvedAt && (
                          <span className="text-emerald-400 flex items-center space-x-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Resolved: {new Date(alert.resolvedAt).toLocaleTimeString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {isActive && (
                    <div className="flex items-center space-x-2 self-start sm:self-center shrink-0">
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center space-x-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
