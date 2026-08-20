import React from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, ArrowRight, Trash2 } from 'lucide-react';
import { SecurityAlert } from '../types';

interface AlertsViewProps {
  alerts: SecurityAlert[];
  onReviewAlert: (alert: SecurityAlert) => void;
  onDismissAlert: (id: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onReviewAlert,
  onDismissAlert,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-zinc-100">Live Security Alerts</h2>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          AURA Sentinel continuously checks for dormant allowances, suspicious spender mutations, and excessive exposure
        </p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL' || alert.severity === 'HIGH';
          const isModerate = alert.severity === 'MODERATE';

          return (
            <div
              key={alert.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all ${
                alert.resolved
                  ? 'bg-zinc-950/40 border-zinc-800/40 opacity-60'
                  : isCritical
                  ? 'bg-zinc-950/90 border-rose-900/40'
                  : isModerate
                  ? 'bg-zinc-950/90 border-amber-900/40'
                  : 'bg-zinc-950/80 border-zinc-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      alert.resolved
                        ? 'bg-zinc-800 text-zinc-400'
                        : isCritical
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : isModerate
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}
                  >
                    {alert.resolved ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isCritical || isModerate ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-zinc-100">{alert.title}</h4>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-semibold ${
                          alert.resolved
                            ? 'bg-zinc-800 text-zinc-400'
                            : isCritical
                            ? 'bg-rose-500/15 text-rose-400'
                            : isModerate
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-cyan-500/15 text-cyan-400'
                        }`}
                      >
                        {alert.resolved ? 'RESOLVED' : alert.severity}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{alert.description}</p>
                    <div className="text-[10px] text-zinc-500 mt-1.5 font-mono">{alert.timestamp}</div>
                  </div>
                </div>

                {!alert.resolved && alert.actionRequired && (
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => onReviewAlert(alert)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center space-x-1 border border-zinc-700 transition-colors"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDismissAlert(alert.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
