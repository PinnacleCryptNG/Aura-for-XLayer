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
    <div className="space-y-6 pb-16 sm:pb-8 animate-in fade-in duration-200">
      <div className="bg-[#10172a] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Security Alerts</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
              We check your wallet constantly and warn you about old permissions or suspicious apps.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#10172a] border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">All Clear!</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              No security alerts found. Your wallet is safe and protected.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL' || alert.severity === 'HIGH';
            const isModerate = alert.severity === 'MODERATE';

            return (
              <div
                key={alert.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  alert.resolved
                    ? 'bg-[#0b1222] border-slate-800/60 opacity-60'
                    : isCritical
                    ? 'bg-[#38141d] border-[#671e2a]'
                    : isModerate
                    ? 'bg-[#2a1b12] border-amber-800/40'
                    : 'bg-[#10172a] border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        alert.resolved
                          ? 'bg-slate-800 text-slate-400'
                          : isCritical
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isModerate
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {alert.resolved ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isCritical || isModerate ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Info className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                        <span
                          className={`text-[9px] uppercase px-2 py-0.5 rounded font-mono font-bold ${
                            alert.resolved
                              ? 'bg-slate-800 text-slate-300'
                              : isCritical
                              ? 'bg-rose-500/25 text-[#fca5a5]'
                              : isModerate
                              ? 'bg-amber-500/25 text-amber-200'
                              : 'bg-emerald-500/25 text-emerald-200'
                          }`}
                        >
                          {alert.resolved ? 'RESOLVED' : alert.severity === 'CRITICAL' ? 'DANGER' : alert.severity}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">{alert.description}</p>
                      <div className="text-[10px] text-slate-400 mt-1.5 font-mono">{alert.timestamp}</div>
                    </div>
                  </div>

                  {!alert.resolved && alert.actionRequired && (
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => onReviewAlert(alert)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <span>Fix Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-slate-700"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
