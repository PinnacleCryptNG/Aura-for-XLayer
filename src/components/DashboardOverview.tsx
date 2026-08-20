import React from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Play,
  Clock,
  Wallet,
  Bot,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { ApprovalItem, DecisionRecord } from '../types';

interface DashboardOverviewProps {
  portfolioValueUsd: number;
  monitoredAssetsCount: number;
  healthScore: number;
  networkName: string;
  approvals: ApprovalItem[];
  recentDecisions: DecisionRecord[];
  onReviewApproval: (approval: ApprovalItem) => void;
  onLaunchDemo: (demoId: number) => void;
  onNavigateToTab: (tab: string) => void;
  isConnected: boolean;
  onOpenConnectModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  portfolioValueUsd,
  monitoredAssetsCount,
  healthScore,
  networkName,
  approvals,
  recentDecisions,
  onReviewApproval,
  onLaunchDemo,
  onNavigateToTab,
  isConnected,
  onOpenConnectModal,
}) => {
  const highRiskApprovals = approvals.filter(
    (a) => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL'
  );

  return (
    <div className="space-y-6 max-w-full pb-16 sm:pb-6 animate-in fade-in duration-300">
      {/* Primary Statement for Everyone (Plain English) */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-[#131b2e] to-teal-950/30 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-bold text-white tracking-wide">
              This app keeps your money safe.
            </p>
            <p className="text-xs sm:text-sm text-slate-300">
              This app stops thieves from taking your crypto.
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-300 flex items-center space-x-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isConnected ? 'Wallet Protected' : 'Ready to Protect Your Wallet'}</span>
        </div>
      </div>

      {/* Clean Hero Header */}
      <div className="bg-[#10172a]/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{networkName}</span>
            </div>

            {/* Requirement 11: Main Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              See exactly what a transaction will do before you approve it.
            </h1>

            {/* Purpose lines (Requirements 12 & 13) */}
            <div className="space-y-2 pt-1 text-sm sm:text-base leading-relaxed">
              <p className="text-slate-200">
                ✅ <span className="text-emerald-300 font-semibold">AURA explains every transaction in plain words and keeps your money safe.</span>
              </p>
              <p className="text-slate-200">
                🛑 <span className="text-[#fca5a5] font-semibold">AURA blocks fake sites and hidden traps that try to steal your tokens.</span>
              </p>
            </div>

            {/* Clear Scenario Action Buttons (Requirements 8, 9, 14) */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              {/* Requirement 14: Pink/Muted Burgundy Button */}
              <button
                onClick={() => onLaunchDemo(1)}
                className="py-3 px-4 rounded-xl bg-[#38141d] hover:bg-[#4a1824] text-[#fecdd3] border border-[#671e2a] font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-md shadow-black/40"
              >
                <AlertTriangle className="w-4 h-4 text-[#fca5a5] shrink-0" />
                <span>Show me a dangerous approval (demo)</span>
              </button>

              {/* Requirement 8: Try Normal Transfer (1 USDT) */}
              <button
                onClick={() => onLaunchDemo(2)}
                className="py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all border border-slate-700 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Try Normal Transfer (1 USDT)</span>
              </button>

              <button
                onClick={() => onNavigateToTab('protect')}
                className="py-3 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all border border-emerald-500/30 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Check a Transaction</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Safety Gauge */}
          <div className="flex items-center space-x-5 bg-[#0b1222] border border-slate-800 rounded-3xl p-5 sm:p-6 shrink-0 shadow-inner w-full sm:w-auto justify-between sm:justify-start">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={healthScore > 75 ? 'text-emerald-400' : healthScore > 0 ? 'text-amber-400' : 'text-slate-600'}
                  strokeDasharray={`${healthScore || 0}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl sm:text-2xl font-black text-white font-mono leading-none">
                  {isConnected ? `${healthScore}%` : '0%'}
                </span>
                <span className="text-[9px] uppercase font-bold mt-1 text-slate-400">
                  {isConnected ? 'Safety Score' : 'Connect'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="text-xs font-bold text-slate-200">
                Wallet Safety Score
              </div>
              <div className="text-sm sm:text-base font-bold text-white font-mono">
                ${portfolioValueUsd.toLocaleString()} Protected
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-[200px] leading-snug">
                {!isConnected
                  ? 'Connect wallet to scan for risks.'
                  : highRiskApprovals.length > 0
                  ? `${highRiskApprovals.length} dangerous permission needs fixing.`
                  : 'You’re safe right now – no risky permissions found.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Summary Status Ribbon (Secondary Cards with Warm Depth) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121a2d] border border-slate-800 flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Current Network</div>
            <div className="font-bold text-[#f5f1eb]">{networkName}</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#121a2d] border border-slate-800 flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Security Check</div>
            <div className="font-bold text-[#f5f1eb]">
              {isConnected ? 'Verified & Active' : 'Ready to Scan'}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#121a2d] border border-slate-800 flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/25 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Automatic Rules</div>
            <div className="font-bold text-[#f5f1eb]">Safety Shield is Active</div>
          </div>
        </div>
      </div>

      {/* Requirement 15: Connect Banner if Disconnected */}
      {!isConnected && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#10172a] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Connect wallet to scan for risks
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                We'll scan what apps can access your funds and show you what to fix.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onOpenConnectModal}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 hover:brightness-105 active:scale-95 text-slate-950 font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Connect Your Wallet Safely</span>
            </button>
          </div>
        </div>
      )}

      {/* NEEDS ATTENTION SECTION */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className={`w-4 h-4 shrink-0 ${highRiskApprovals.length > 0 ? 'text-[#fca5a5]' : 'text-slate-400'}`} />
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wider">
              Needs Attention ({highRiskApprovals.length} item{highRiskApprovals.length === 1 ? '' : 's'})
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab('approvals')}
            className="text-xs sm:text-sm text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1 shrink-0 cursor-pointer"
          >
            <span>View all app permissions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Requirement 16: Safe empty state */}
        {highRiskApprovals.length === 0 ? (
          <div className="p-6 sm:p-7 rounded-2xl bg-[#10172a]/70 border border-slate-800 text-center space-y-1.5">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm sm:text-base font-bold text-slate-100">
              You’re safe right now – no risky permissions found.
            </p>
            <p className="text-xs sm:text-sm text-slate-300">
              All token permissions in your wallet are currently safe.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highRiskApprovals.map((appr) => (
              <div
                key={appr.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#10172a] border border-[#5e1c25] hover:border-[#852737] transition-all flex flex-col justify-between space-y-4 shadow-sm group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm sm:text-base font-bold text-white">
                        Can take all your {appr.tokenSymbol}
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#38141d] text-[#fca5a5] font-bold uppercase border border-[#671e2a]">
                        Dangerous
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-mono font-semibold text-[#fca5a5]">
                      ${appr.potentialExposureUsd.toLocaleString()} at risk
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    <span className="text-white font-semibold">{appr.spenderName}</span> can take all your {appr.tokenSymbol} at any time. We recommend limiting it to a safe amount.
                  </p>

                  <div className="text-xs text-slate-400 pt-0.5">
                    Last used {appr.lastUsedDaysAgo} days ago
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onReviewApproval(appr)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-950/40 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Limit to $500 (Recommended)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECENT ACTIVITY & AUDIT LOG */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wider">
              Recent Transactions & Protection History
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab('history')}
            className="text-xs sm:text-sm text-slate-400 hover:text-slate-200 flex items-center space-x-1 cursor-pointer"
          >
            <span>Full History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentDecisions.length === 0 ? (
          <div className="p-6 sm:p-7 rounded-2xl bg-[#10172a]/70 border border-slate-800 text-center space-y-1.5">
            <Clock className="w-7 h-7 text-slate-400 mx-auto" />
            <p className="text-sm sm:text-base font-bold text-slate-200">No activity yet</p>
            <p className="text-xs sm:text-sm text-slate-400">
              Every transaction and permission you check or limit will appear here in plain English.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentDecisions.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onNavigateToTab('history')}
                className="p-4 sm:p-5 rounded-2xl bg-[#10172a] hover:bg-[#131d35] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer group"
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      rec.riskLevel === 'CRITICAL' || rec.riskLevel === 'HIGH'
                        ? 'bg-[#f87171] shadow-sm shadow-rose-500/50'
                        : rec.riskLevel === 'MODERATE'
                        ? 'bg-amber-400 shadow-sm shadow-amber-500/50'
                        : 'bg-emerald-400 shadow-sm shadow-emerald-500/50'
                    }`}
                  />
                  <div className="truncate">
                    <span className="font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                      {rec.actionTitle}
                    </span>
                    <span className="text-slate-400 text-xs ml-2">
                      to {rec.targetName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 text-xs sm:text-sm">
                  <span
                    className={`font-semibold px-2.5 py-1 rounded-md ${
                      rec.userDecision === 'MODIFIED_LIMITED'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : rec.userDecision === 'REJECTED'
                        ? 'bg-[#38141d] text-[#fca5a5] border border-[#671e2a]'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {rec.userDecision === 'MODIFIED_LIMITED'
                      ? '🛡️ Limited to Safe Amount'
                      : rec.userDecision === 'REJECTED'
                      ? '🛑 Stopped'
                      : '✅ Allowed (Safe)'}
                  </span>
                  <span className="text-slate-400 font-mono text-xs">{rec.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
