import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Play,
  Sliders,
  Terminal,
  ArrowRight,
  ShieldAlert,
  Shield,
  Clock,
} from 'lucide-react';
import { AgentPolicyConfig, AgentExecutionLog } from '../types';

interface AgentSentinelViewProps {
  onTriggerAnalysis: (txInput: any) => void;
  currentNetworkName: string;
}

const DEFAULT_POLICY: AgentPolicyConfig = {
  id: 'policy-default',
  name: 'Standard Wallet Protection Policy',
  agentName: 'AURA Shield',
  maxDailySpendUsd: 0,
  maxPerTxSpendUsd: 0,
  maxAllowedSlippagePercent: 2.0,
  requireOklinkVerification: true,
  blockUnlimitedApprovals: true,
  allowedDEXsOnly: true,
  autoRevokeDormantAfterDays: 7,
  enabled: true,
};

const SCENARIOS = [
  {
    id: 'agent-rebalance',
    name: 'Normal Token Swap',
    role: 'Trusted Exchange',
    scenarioTitle: 'Standard Token Swap (1 USDT -> OKB)',
    description: 'A normal swap on a verified exchange with a safe 0.5% price difference.',
    riskExpectation: 'SAFE',
    payload: {
      to: '0x388c818ca8b9251b393131c08a736a67ccb19297',
      data: '0x38ed1739',
      customAmount: '1',
      customTokenSymbol: 'USDT',
      customSlippage: 0.5,
      actionTitle: 'Swap 1 USDT -> OKB',
    },
  },
  {
    id: 'agent-sniper',
    name: 'Bad Price Spike Trap',
    role: 'Unsafe Trade',
    scenarioTitle: 'High Price Difference Attack (12.5% Price Impact)',
    description: 'A transaction trying to buy a token with excessive 12.5% price loss.',
    riskExpectation: 'BLOCKED',
    payload: {
      to: '0x8391a27f69201f8449c239d1089201a4e8291a27',
      data: '0x38ed1739',
      customAmount: '5',
      customTokenSymbol: 'USDT',
      customSlippage: 12.5,
      actionTitle: 'Swap 5 USDT -> Unknown Token',
    },
  },
  {
    id: 'agent-drain',
    name: 'Unlimited Access Trap',
    role: 'Token Drainer',
    scenarioTitle: 'Fake Website Asking for Unlimited USDT',
    description: 'A fake contract asking for permission to take all your USDT tokens.',
    riskExpectation: 'BLOCKED',
    payload: {
      to: '0x8391a27f69201f8449c239d1089201a4e8291a27',
      data: '0x095ea7b3ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      customAmount: 'UNLIMITED',
      customTokenSymbol: 'USDT',
      actionTitle: 'Dangerous Unlimited USDT Permission',
    },
  },
];

export const AgentSentinelView: React.FC<AgentSentinelViewProps> = ({
  onTriggerAnalysis,
  currentNetworkName,
}) => {
  const [policy, setPolicy] = useState<AgentPolicyConfig>(DEFAULT_POLICY);
  const [selectedPreset, setSelectedPreset] = useState(SCENARIOS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<AgentExecutionLog[]>([
    {
      id: 'log-1',
      timestamp: '14:28:10 UTC',
      agentName: 'AURA Shield',
      action: 'Swap 1 USDT -> OKB',
      targetContract: '0x388c...9297 (Verified DEX)',
      requestedUsdValue: 1,
      status: 'EXECUTED_SAFE',
      reason: 'Verified contract, safe 0.4% price difference within 2.0% limit.',
      mcpToolCall: 'aura_verify_and_execute()',
    },
    {
      id: 'log-2',
      timestamp: '14:15:02 UTC',
      agentName: 'AURA Shield',
      action: 'Swap 5 USDT -> Unknown Token',
      targetContract: '0x8391...1a27 (Unverified)',
      requestedUsdValue: 5,
      status: 'BLOCKED_POLICY_VIOLATION',
      reason: 'STOPPED: Price difference (14.2%) is higher than your 2.0% safety limit.',
      mcpToolCall: 'aura_stop_execution(reason: "HIGH_PRICE_DIFFERENCE")',
    },
  ]);

  const handleRunAgentSimulation = (preset: typeof SCENARIOS[0]) => {
    setIsSimulating(true);
    setSelectedPreset(preset);

    setTimeout(() => {
      setIsSimulating(false);

      const isViolation = preset.riskExpectation === 'BLOCKED';
      const newLog: AgentExecutionLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString() + ' UTC',
        agentName: 'AURA Shield',
        action: preset.scenarioTitle,
        targetContract: `${preset.payload.to.slice(0, 6)}...${preset.payload.to.slice(-4)}`,
        requestedUsdValue: preset.payload.customAmount === 'UNLIMITED' ? 1 : Number(preset.payload.customAmount) || 1,
        status: isViolation ? 'BLOCKED_POLICY_VIOLATION' : 'EXECUTED_SAFE',
        reason: isViolation
          ? preset.payload.customAmount === 'UNLIMITED'
            ? 'STOPPED by AURA: Unlimited token permission requested by an unverified contract.'
            : `STOPPED by AURA: Price difference (${preset.payload.customSlippage}%) exceeds your safety limit (${policy.maxAllowedSlippagePercent}%).`
          : 'ALLOWED by AURA: Passed all security rules and verified on X Layer.',
        mcpToolCall: isViolation
          ? 'aura_stop_execution(code: 403, policy: "SAFETY_LIMIT_TRIGGERED")'
          : 'aura_allow_execution(status: "SAFE")',
      };

      setExecutionLogs((prev) => [newLog, ...prev]);
    }, 600);
  };

  const handleLaunchInInterceptor = (preset: typeof SCENARIOS[0]) => {
    onTriggerAnalysis(preset.payload);
  };

  return (
    <div className="space-y-6 pb-16 sm:pb-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[#10172a] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Safety Rules
                </h2>
                <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                  Protection is On
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
                Set automatic limits that stop unsafe spending or sudden price spikes on {currentNetworkName}
              </p>
            </div>
          </div>
        </div>

        {/* Status Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-[#0b1222] border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">Protection Mode</div>
            <div className="font-semibold text-slate-100 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto-Stop</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#0b1222] border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">Network</div>
            <div className="font-semibold text-emerald-300 mt-0.5 truncate">
              {currentNetworkName}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#0b1222] border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">Network Fee</div>
            <div className="font-semibold text-slate-100 mt-0.5">
              &lt;$0.001
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#0b1222] border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">Bad Actions Stopped</div>
            <div className="font-semibold text-emerald-400 mt-0.5">
              14 Stopped
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Policy Settings & Interactive Test */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Safety Settings */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#10172a] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">Your Safety Settings</h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                ACTIVE
              </span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Max Per Tx Cap */}
              <div className="space-y-1.5">
                <label className="flex justify-between font-semibold text-slate-200">
                  <span>Maximum amount one transaction can spend</span>
                  <span className="font-mono text-emerald-400 font-bold">${policy.maxPerTxSpendUsd}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={50}
                  value={policy.maxPerTxSpendUsd}
                  onChange={(e) =>
                    setPolicy({ ...policy, maxPerTxSpendUsd: Number(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-xs text-slate-400">Any single transaction higher than this will be flagged for extra confirmation.</p>
              </div>

              {/* Max Slippage */}
              <div className="space-y-1.5 pt-2">
                <label className="flex justify-between font-semibold text-slate-200">
                  <span>Maximum price difference allowed</span>
                  <span className="font-mono text-emerald-400 font-bold">{policy.maxAllowedSlippagePercent}%</span>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={15}
                  step={0.5}
                  value={policy.maxAllowedSlippagePercent}
                  onChange={(e) =>
                    setPolicy({ ...policy, maxAllowedSlippagePercent: Number(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-xs text-slate-400">Protects you from sandwich attacks and bad trade rates.</p>
              </div>

              {/* Toggle 1: Verified Contracts */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0b1222] border border-slate-800">
                <div>
                  <p className="font-semibold text-white">Require Verified Contracts</p>
                  <p className="text-xs text-slate-400">Block unverified or brand new contracts automatically</p>
                </div>
                <input
                  type="checkbox"
                  checked={policy.requireOklinkVerification}
                  onChange={(e) =>
                    setPolicy({ ...policy, requireOklinkVerification: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Toggle 2: Block Unlimited Approvals */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0b1222] border border-slate-800">
                <div>
                  <p className="font-semibold text-white">Block Unlimited Token Access</p>
                  <p className="text-xs text-slate-400">Force apps to only ask for the exact amount you spend</p>
                </div>
                <input
                  type="checkbox"
                  checked={policy.blockUnlimitedApprovals}
                  onChange={(e) =>
                    setPolicy({ ...policy, blockUnlimitedApprovals: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Toggle 3: Whitelist Trusted Exchanges */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0b1222] border border-slate-800">
                <div>
                  <p className="font-semibold text-white">Only Allow Trusted Exchanges</p>
                  <p className="text-xs text-slate-400">Restrict token swaps to verified routers</p>
                </div>
                <input
                  type="checkbox"
                  checked={policy.allowedDEXsOnly}
                  onChange={(e) =>
                    setPolicy({ ...policy, allowedDEXsOnly: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Test Safety Rules */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#10172a] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">Test How Safety Rules Work</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">{currentNetworkName}</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Click any scenario below to see how AURA automatically detects risks and protects your funds:
            </p>

            {/* Presets List */}
            <div className="space-y-3">
              {SCENARIOS.map((preset) => {
                const isSelected = selectedPreset.id === preset.id;
                return (
                  <div
                    key={preset.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md'
                        : 'bg-[#0b1222] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-bold text-xs sm:text-sm text-white">{preset.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                            {preset.role}
                          </span>
                          {preset.riskExpectation === 'SAFE' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Safe Transaction
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#38141d] text-[#fca5a5] border border-[#671e2a] font-semibold flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Stopped for Safety
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-200">
                          {preset.scenarioTitle}
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => handleRunAgentSimulation(preset)}
                          disabled={isSimulating}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-md shadow-emerald-950/40"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Test Rule</span>
                        </button>
                        <button
                          onClick={() => handleLaunchInInterceptor(preset)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors border border-slate-700"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Safety Log */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs sm:text-sm font-bold text-white">
                    Recent Safety Actions
                  </span>
                </div>
                <span className="text-xs text-emerald-400 font-mono">Protection Active</span>
              </div>

              <div className="bg-[#0b1222] rounded-2xl p-3.5 border border-slate-800 text-xs space-y-2.5 max-h-48 overflow-y-auto">
                {executionLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border ${
                      log.status === 'EXECUTED_SAFE'
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                        : 'bg-[#38141d] border-[#671e2a] text-[#fca5a5]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                      <span className="text-slate-400">[{log.timestamp}]</span>
                      <span className="font-bold">
                        {log.status === 'EXECUTED_SAFE' ? 'STATUS: ALLOWED' : 'STATUS: STOPPED'}
                      </span>
                    </div>
                    <p className="text-white font-semibold text-xs sm:text-sm">{log.action}</p>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{log.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
