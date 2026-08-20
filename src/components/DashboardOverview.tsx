import React from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Coins,
  Lock,
  Layers,
  Play,
  Clock,
  CheckCircle2,
  ExternalLink,
  Wallet,
  Zap,
  Flame,
  Bot,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { ApprovalItem, DecisionRecord, SecurityAlert } from '../types';

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
      {/* Flagship Hero Cyber Radar Card */}
      <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AURA Sentinel Active • {networkName}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Know what you’re signing <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                before you sign on X Layer.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
              Deterministic calldata decoding, zero-loss allowance limits, and OnchainOS AI agent guardrails built specifically for OKX X Layer Testnet.
            </p>

            {/* Quick Interactive Demo Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onLaunchDemo(1)}
                className="py-2 px-3.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Demo: Unlimited USDT Drain Trap</span>
              </button>

              <button
                onClick={() => onLaunchDemo(2)}
                className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs flex items-center space-x-2 transition-all border border-slate-700 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Demo: Safe 50 USDT Transfer</span>
              </button>

              <button
                onClick={() => onNavigateToTab('agent')}
                className="py-2 px-3.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-semibold text-xs flex items-center space-x-1.5 transition-all border border-cyan-500/30 cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Agent Guardrails</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Security Score Gauge Widget */}
          <div className="flex items-center space-x-5 bg-slate-950/80 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shrink-0 shadow-inner w-full sm:w-auto justify-between sm:justify-start">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={healthScore > 75 ? 'text-emerald-400' : 'text-amber-400'}
                  strokeDasharray={`${healthScore}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">
                  {healthScore}
                </span>
                <span className="block text-[8px] uppercase text-slate-400 font-bold font-mono">
                  / 100
                </span>
              </div>
            </div>

            <div className="space-y-1 text-left">
              <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                Security Rating
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-100 font-mono">
                ${portfolioValueUsd.toLocaleString()} Portfolio
              </div>
              <div className="text-xs text-emerald-400 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{monitoredAssetsCount} Monitored Assets Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network Efficiency & Ecosystem Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Sub-Cent Gas</div>
            <div className="font-bold text-slate-200">~$0.0005 OKB</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Layer 2 Engine</div>
            <div className="font-bold text-slate-200">zkEVM Polygon CDK</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Agent Framework</div>
            <div className="font-bold text-slate-200">OnchainOS MCP</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <ExternalLink className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Verified Explorer</div>
            <div className="font-bold text-slate-200">OKLink Verified</div>
          </div>
        </div>
      </div>

      {/* Disconnected Onboarding Banner (if not connected) */}
      {!isConnected && (
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-cyan-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Connect MetaMask or OKX Wallet on X Layer Testnet
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Scan active allowances, calculate potential exposure, and enable AI pre-signing interception.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={onOpenConnectModal}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
            <button
              onClick={() => onLaunchDemo(1)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Launch Sandbox
            </button>
          </div>
        </div>
      )}

      {/* ATTENTION QUEUE */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Attention Queue ({highRiskApprovals.length} Actions Need Review)
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab('approvals')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1 shrink-0 cursor-pointer"
          >
            <span>View all allowances</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {highRiskApprovals.map((appr) => (
            <div
              key={appr.id}
              className="p-5 rounded-2xl bg-slate-900/50 border border-rose-900/30 hover:border-rose-700/60 transition-all flex flex-col justify-between space-y-3.5 shadow-sm group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">
                      Unlimited {appr.tokenSymbol} Approval
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 font-bold uppercase border border-rose-500/20">
                      HIGH RISK
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    ${appr.potentialExposureUsd.toLocaleString()} Exposure
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="text-slate-200 font-medium">{appr.spenderName}</span> holds unlimited permission to withdraw your full {appr.tokenSymbol} balance.
                </p>

                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Last active {appr.lastUsedDaysAgo}d ago • OKLink Bytecode Audited
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => onReviewApproval(appr)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-slate-700 hover:border-cyan-500/40 cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Review & Cap Allowance</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT ACTIVITY & AUDIT LOG */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Recent Intercepts & Decisions
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab('history')}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 cursor-pointer"
          >
            <span>Full Audit Trail</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentDecisions.map((rec) => (
            <div
              key={rec.id}
              onClick={() => onNavigateToTab('history')}
              className="p-4 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs cursor-pointer group"
            >
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    rec.riskLevel === 'CRITICAL' || rec.riskLevel === 'HIGH'
                      ? 'bg-rose-400 shadow-sm shadow-rose-500/50'
                      : rec.riskLevel === 'MODERATE'
                      ? 'bg-amber-400 shadow-sm shadow-amber-500/50'
                      : 'bg-emerald-400 shadow-sm shadow-emerald-500/50'
                  }`}
                />
                <div className="truncate">
                  <span className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {rec.actionTitle}
                  </span>
                  <span className="text-slate-400 text-[11px] ml-2 font-mono">
                    to {rec.targetName}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-4 font-mono text-[11px]">
                <span
                  className={`font-semibold px-2 py-0.5 rounded-md ${
                    rec.userDecision === 'MODIFIED_LIMITED'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : rec.userDecision === 'REJECTED'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {rec.userDecision === 'MODIFIED_LIMITED'
                    ? '🛡️ Protected (Capped)'
                    : rec.userDecision === 'REJECTED'
                    ? '🛑 Blocked Threat'
                    : '✅ Executed Safely'}
                </span>
                <span className="text-slate-400">{rec.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
