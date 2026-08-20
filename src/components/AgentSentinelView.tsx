import React, { useState } from 'react';
import {
  Bot,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  Sliders,
  Terminal,
  Cpu,
  Zap,
  ArrowRight,
  Lock,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { AgentPolicyConfig, AgentExecutionLog } from '../types';

interface AgentSentinelViewProps {
  onTriggerAnalysis: (txInput: any) => void;
  currentNetworkName: string;
}

const DEFAULT_POLICY: AgentPolicyConfig = {
  id: 'policy-default',
  name: 'OKX OnchainOS Standard Autonomous Policy',
  agentName: 'TradingBot-Alpha',
  maxDailySpendUsd: 5000,
  maxPerTxSpendUsd: 2500,
  maxAllowedSlippagePercent: 2.0,
  requireOklinkVerification: true,
  blockUnlimitedApprovals: true,
  allowedDEXsOnly: true,
  autoRevokeDormantAfterDays: 7,
  enabled: true,
};

const AGENT_PRESETS = [
  {
    id: 'agent-rebalance',
    name: 'Arbitrage Agent #1',
    role: 'DEX Liquidity Arbitrage',
    scenarioTitle: 'OKX DEX Optimized Rebalance (1,000 USDT -> OKB)',
    description: 'Autonomous rebalance routed through verified OKX DEX with 0.5% slippage.',
    riskExpectation: 'SAFE',
    payload: {
      to: '0x388c818ca8b9251b393131c08a736a67ccb19297',
      data: '0x38ed1739',
      customAmount: '1000',
      customTokenSymbol: 'USDT',
      customSlippage: 0.5,
      actionTitle: 'Agent: OKX DEX Swap 1000 USDT -> OKB',
    },
  },
  {
    id: 'agent-sniper',
    name: 'Sniper Agent #4',
    role: 'Meme Token Sniper',
    scenarioTitle: 'High-Slippage Trap Attack (12.5% Slippage)',
    description: 'Agent attempting to buy a new token with excessive 12.5% slippage vulnerable to sandwich attacks.',
    riskExpectation: 'BLOCKED',
    payload: {
      to: '0x8391a27f69201f8449c239d1089201a4e8291a27',
      data: '0x38ed1739',
      customAmount: '1500',
      customTokenSymbol: 'USDT',
      customSlippage: 12.5,
      actionTitle: 'Agent: High-Slippage Token Swap',
    },
  },
  {
    id: 'agent-drain',
    name: 'Treasury Bot #2',
    role: 'Automated Treasury Manager',
    scenarioTitle: 'Unverified Router Infinite USDT Approval',
    description: 'Agent lured by malicious dApp calldata requesting unlimited USDT permission.',
    riskExpectation: 'BLOCKED',
    payload: {
      to: '0x8391a27f69201f8449c239d1089201a4e8291a27',
      data: '0x095ea7b3ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      customAmount: 'UNLIMITED',
      customTokenSymbol: 'USDT',
      actionTitle: 'Agent: Unlimited USDT Allowance Request',
    },
  },
];

export const AgentSentinelView: React.FC<AgentSentinelViewProps> = ({
  onTriggerAnalysis,
  currentNetworkName,
}) => {
  const [policy, setPolicy] = useState<AgentPolicyConfig>(DEFAULT_POLICY);
  const [selectedPreset, setSelectedPreset] = useState(AGENT_PRESETS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<AgentExecutionLog[]>([
    {
      id: 'log-1',
      timestamp: '14:28:10 UTC',
      agentName: 'Arbitrage Agent #1',
      action: 'OKX DEX Swap 500 USDT -> OKB',
      targetContract: '0x388c...9297 (OKX DEX)',
      requestedUsdValue: 500,
      status: 'EXECUTED_SAFE',
      reason: 'OKLink verified source, slippage 0.4% within 2.0% limit, budget approved.',
      mcpToolCall: 'aura_verify_and_execute(tx_hash, policy_id: "default")',
    },
    {
      id: 'log-2',
      timestamp: '14:15:02 UTC',
      agentName: 'Sniper Agent #4',
      action: 'Swap 1,200 USDT -> $MEME (14.2% slippage)',
      targetContract: '0x8391...1a27 (Unverified)',
      requestedUsdValue: 1200,
      status: 'BLOCKED_POLICY_VIOLATION',
      reason: 'VETOED: Slippage (14.2%) exceeds 2.0% cap and target contract is unverified on OKLink.',
      mcpToolCall: 'aura_veto_execution(reason: "EXCESSIVE_SLIPPAGE_AND_UNVERIFIED")',
    },
  ]);

  const handleRunAgentSimulation = (preset: typeof AGENT_PRESETS[0]) => {
    setIsSimulating(true);
    setSelectedPreset(preset);

    setTimeout(() => {
      setIsSimulating(false);

      const isViolation = preset.riskExpectation === 'BLOCKED';
      const newLog: AgentExecutionLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString() + ' UTC',
        agentName: preset.name,
        action: preset.scenarioTitle,
        targetContract: `${preset.payload.to.slice(0, 6)}...${preset.payload.to.slice(-4)}`,
        requestedUsdValue: preset.payload.customAmount === 'UNLIMITED' ? 8420 : Number(preset.payload.customAmount) || 1000,
        status: isViolation ? 'BLOCKED_POLICY_VIOLATION' : 'EXECUTED_SAFE',
        reason: isViolation
          ? preset.payload.customAmount === 'UNLIMITED'
            ? 'VETOED by AURA: Infinite approval detected on unverified contract bytecode.'
            : `VETOED by AURA: Slippage (${preset.payload.customSlippage}%) exceeds policy ceiling (${policy.maxAllowedSlippagePercent}%).`
          : 'APPROVED by AURA: All deterministic security criteria and OKLink checks passed.',
        mcpToolCall: isViolation
          ? 'aura_veto_execution(code: 403, policy: "STRICT_GUARDRAIL")'
          : 'aura_approve_and_broadcast(gas_token: "OKB", fee: "$0.0005")',
      };

      setExecutionLogs((prev) => [newLog, ...prev]);
    }, 600);
  };

  const handleLaunchInInterceptor = (preset: typeof AGENT_PRESETS[0]) => {
    onTriggerAnalysis(preset.payload);
  };

  return (
    <div className="space-y-6 pb-16 sm:pb-8 animate-in fade-in duration-200">
      {/* Clean Minimalist Header */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Agent Guardrails
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Testnet MCP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deterministic safety layer for autonomous AI agents on {currentNetworkName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span className="flex items-center space-x-1.5 text-xs font-mono px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Guardrails Enforced</span>
            </span>
          </div>
        </div>

        {/* Streamlined Status Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/60 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[10px] text-slate-400">Execution Mode</div>
            <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto-Veto</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[10px] text-slate-400">Network</div>
            <div className="font-semibold text-cyan-300 mt-0.5 truncate">
              {currentNetworkName}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[10px] text-slate-400">Testnet Gas Cost</div>
            <div className="font-semibold text-slate-200 mt-0.5">
              &lt;0.00001 OKB
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[10px] text-slate-400">Attacks Trapped</div>
            <div className="font-semibold text-rose-400 mt-0.5">
              14 Blocked
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Policy Editor & Agent Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Security Policy Configuration */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-zinc-100">OnchainOS Agent Policy</h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ENFORCED
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Max Per Tx Cap */}
              <div>
                <label className="flex justify-between font-semibold text-zinc-300 mb-1">
                  <span>Max Per-Tx Spend Cap</span>
                  <span className="font-mono text-cyan-400">${policy.maxPerTxSpendUsd} USD</span>
                </label>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={500}
                  value={policy.maxPerTxSpendUsd}
                  onChange={(e) =>
                    setPolicy({ ...policy, maxPerTxSpendUsd: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Max Slippage */}
              <div>
                <label className="flex justify-between font-semibold text-zinc-300 mb-1">
                  <span>Max Allowed DEX Slippage</span>
                  <span className="font-mono text-cyan-400">{policy.maxAllowedSlippagePercent}%</span>
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
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Toggle 1: OKLink Verification */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <div>
                  <p className="font-semibold text-zinc-200">Require OKLink Verification</p>
                  <p className="text-[11px] text-zinc-400">Block unverified smart contracts automatically</p>
                </div>
                <input
                  type="checkbox"
                  checked={policy.requireOklinkVerification}
                  onChange={(e) =>
                    setPolicy({ ...policy, requireOklinkVerification: e.target.checked })
                  }
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {/* Toggle 2: Block Infinite Approvals */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <div>
                  <p className="font-semibold text-zinc-200">Block Infinite Approvals</p>
                  <p className="text-[11px] text-zinc-400">Force strict exact-amount approvals only</p>
                </div>
                <input
                  type="checkbox"
                  checked={policy.blockUnlimitedApprovals}
                  onChange={(e) =>
                    setPolicy({ ...policy, blockUnlimitedApprovals: e.target.checked })
                  }
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {/* Toggle 3: Whitelist OKX DEX */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <div>
                  <p className="font-semibold text-zinc-200">Whitelist OKX DEX Aggregator</p>
                  <p className="text-[11px] text-zinc-400">Restrict swap executions to OKX Smart Router</p>
                </div>
                <input
                  type="checkbox"
                  checked={policy.allowedDEXsOnly}
                  onChange={(e) =>
                    setPolicy({ ...policy, allowedDEXsOnly: e.target.checked })
                  }
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Agent Test Harness & Live MCP Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-zinc-100">Live Agent Simulation Scenarios</h3>
              </div>
              <span className="text-xs text-zinc-400">{currentNetworkName}</span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Test how AURA's policy engine inspects autonomous agent payloads before allowing on-chain submission:
            </p>

            {/* Presets List */}
            <div className="space-y-2.5">
              {AGENT_PRESETS.map((preset) => {
                const isSelected = selectedPreset.id === preset.id;
                return (
                  <div
                    key={preset.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/20 border-cyan-500/50 shadow-md'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-zinc-100">{preset.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                            {preset.role}
                          </span>
                          {preset.riskExpectation === 'SAFE' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Policy Compliant
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-semibold flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Trapped / Vetoed
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-zinc-200 mt-1">
                          {preset.scenarioTitle}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => handleRunAgentSimulation(preset)}
                          disabled={isSimulating}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow"
                        >
                          <Play className="w-3 h-3" />
                          <span>Test Guardrail</span>
                        </button>
                        <button
                          onClick={() => handleLaunchInInterceptor(preset)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors border border-zinc-700"
                        >
                          <span>Full Modal</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Terminal Log for MCP Interception */}
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs font-mono font-bold text-zinc-300">
                    AURA MCP Execution Log (JSON-RPC)
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Live Interceptor Active</span>
              </div>

              <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800 font-mono text-[11px] space-y-2 max-h-48 overflow-y-auto">
                {executionLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2 rounded border ${
                      log.status === 'EXECUTED_SAFE'
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-80 mb-0.5">
                      <span>[{log.timestamp}] {log.agentName}</span>
                      <span className="font-bold">
                        {log.status === 'EXECUTED_SAFE' ? 'STATUS: APPROVED' : 'STATUS: VETOED'}
                      </span>
                    </div>
                    <p className="text-zinc-200 font-semibold">{log.action}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{log.reason}</p>
                    <div className="mt-1 pt-1 border-t border-zinc-800/60 text-[9px] text-cyan-400/90 truncate">
                      RPC: {log.mcpToolCall}
                    </div>
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
