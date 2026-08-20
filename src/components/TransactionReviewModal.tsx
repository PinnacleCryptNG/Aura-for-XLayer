import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  Layers,
  CheckCircle2,
  Zap,
  Repeat,
  Bot,
  Percent,
} from 'lucide-react';
import { FullAnalysisResult, DeterministicFacts, AuraExplanation, RiskLevel } from '../types';
import { AuraQuestionsChat } from './AuraQuestionsChat';
import { LimitApprovalModal } from './LimitApprovalModal';

interface TransactionReviewModalProps {
  analysis: FullAnalysisResult;
  onApprove: (decision: 'APPROVED' | 'MODIFIED_LIMITED', modifiedAmount?: string) => void;
  onReject: () => void;
}

export const TransactionReviewModal: React.FC<TransactionReviewModalProps> = ({
  analysis,
  onApprove,
  onReject,
}) => {
  const { facts, explanation } = analysis;
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showQA, setShowQA] = useState(false);
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);

  const isDangerous = facts.riskLevel === 'HIGH' || facts.riskLevel === 'CRITICAL';

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-500',
          title: 'CRITICAL RISK',
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-500',
          title: 'HIGH RISK',
        };
      case 'MODERATE':
        return {
          bg: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
          dot: 'bg-yellow-500',
          title: 'MODERATE RISK',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-500',
          title: 'LOW RISK',
        };
    }
  };

  const badge = getRiskBadge(facts.riskLevel);

  const handleLimitConfirm = (newAmount: string, newFormatted: string) => {
    setShowLimitModal(false);
    onApprove('MODIFIED_LIMITED', newFormatted);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-zinc-950 border border-zinc-800/90 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Banner / Intercept Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isDangerous
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isDangerous ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-zinc-100">
                AURA Transaction Interceptor
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                X Layer Sentinel
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Examined deterministic bytecode, OKLink explorer status & DEX slippage before signing
            </p>
          </div>
        </div>

        {/* Risk Score Pill */}
        <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 ${badge.bg}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${badge.dot} animate-pulse`} />
          <div className="text-right">
            <div className="text-xs font-black tracking-wide">{badge.title}</div>
            <div className="text-[10px] font-mono opacity-80">AURA Score {facts.riskScore}/100</div>
          </div>
        </div>
      </div>

      {/* X Layer Sub-Cent Gas Metrics Banner (Feature E) */}
      <div className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-cyan-950/40 via-zinc-900/60 to-emerald-950/40 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 text-zinc-300">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-zinc-200">X Layer Gas:</span>
          <span className="font-mono text-cyan-300 font-bold">
            {facts.gasMetrics?.xLayerGasOkb || '0.0000085'} OKB (~${facts.gasMetrics?.xLayerGasUsd || '0.0005'})
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-zinc-400 line-through">
            Ethereum L1: ${facts.gasMetrics?.ethereumL1GasUsd || '14.80'}
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[11px] border border-emerald-500/20 font-mono">
            Save ~${facts.gasMetrics?.gasSavedUsd.toFixed(2) || '14.80'} (99.9%)
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* SECTION 1 — ACTION (PRD §15) */}
        <div className="rounded-xl bg-zinc-900/40 border border-zinc-800/80 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Section 1 • What you’re about to do
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-lg sm:text-xl font-bold text-zinc-100">
              {facts.isUnlimitedApproval
                ? `Approve ${facts.tokenSymbol || 'Token'} Spending`
                : facts.txType === 'DEX_SWAP'
                ? `Swap via ${facts.swapDetails?.routerName || 'OKX DEX'}`
                : facts.txType === 'TOKEN_TRANSFER' || facts.txType === 'NATIVE_TRANSFER'
                ? `Send ${facts.requestedAmountFormatted}`
                : `Execute ${facts.txType.replace(/_/g, ' ')}`}
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/40">
              {facts.network}
            </span>
          </div>
          <p className="text-xs text-zinc-300 mt-2 leading-relaxed bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
            {explanation.summary}
          </p>
        </div>

        {/* SECTION: OKX DEX SWAP & SLIPPAGE VISUALIZER (Feature D) */}
        {facts.swapDetails && (
          <div className="rounded-xl bg-zinc-900/40 border border-cyan-500/20 p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              <span className="flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5" /> OKX DEX Swap & Slippage Route
              </span>
              <span className="text-zinc-400 font-mono text-[10px]">
                Router: {facts.swapDetails.routerName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Token Input */}
              <div className="p-3 bg-zinc-950/70 rounded-lg border border-zinc-800">
                <p className="text-[11px] text-zinc-400">You Pay (Input)</p>
                <p className="text-sm font-bold text-zinc-100 mt-0.5">
                  {facts.swapDetails.inputTokenAmount} {facts.swapDetails.inputTokenSymbol}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono">
                  ~${facts.swapDetails.inputTokenUsd.toLocaleString()} USD
                </p>
              </div>

              {/* Expected Output & Min Received */}
              <div className="p-3 bg-zinc-950/70 rounded-lg border border-zinc-800">
                <p className="text-[11px] text-zinc-400">Expected Output</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">
                  {facts.swapDetails.expectedOutputAmount}
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Guaranteed Min: <span className="font-mono text-zinc-200">{facts.swapDetails.minimumReceivedAmount}</span>
                </p>
              </div>

              {/* Slippage & MEV Risk */}
              <div
                className={`p-3 rounded-lg border ${
                  facts.swapDetails.isHighSlippage
                    ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span>Slippage Tolerance</span>
                  <span className="font-bold font-mono text-xs">
                    {facts.swapDetails.slippageTolerancePercent}%
                  </span>
                </div>
                {facts.swapDetails.isHighSlippage ? (
                  <p className="text-[10px] text-rose-400 mt-1 font-medium">
                    ⚠️ Extreme sandwich / MEV attack risk! Limit to &lt;2%.
                  </p>
                ) : (
                  <p className="text-[10px] text-emerald-400 mt-1 font-medium">
                    ✓ Safe slippage tolerance for X Layer.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2 — WHO (PRD §15) + OKLink Contract Verification (Feature B) */}
        <div className="rounded-xl bg-zinc-900/40 border border-zinc-800/80 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
            <span>Section 2 • Who you’re interacting with</span>
            {facts.oklinkMeta?.explorerUrl && (
              <a
                href={facts.oklinkMeta.explorerUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>View on OKLink Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/60 space-y-1">
              <span className="text-zinc-500 text-[11px]">Application / Name:</span>
              <div className="font-semibold text-zinc-200 text-sm">{facts.contractName}</div>
              <div className="flex items-center flex-wrap gap-1.5 pt-1">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    facts.contractVerified
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {facts.contractVerified ? '✓ OKLink Verified Source' : '⚠️ Unverified Bytecode'}
                </span>
                <span className="text-[10px] text-zinc-400">
                  Deployed {facts.contractAgeDays} day(s) ago
                </span>
              </div>
            </div>

            <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/60 space-y-1">
              <span className="text-zinc-500 text-[11px]">Target Contract Address:</span>
              <div className="font-mono text-xs text-zinc-300 break-all select-all">
                {facts.targetAddress}
              </div>
              <div className="text-[10px] text-zinc-400 pt-1 flex items-center justify-between">
                <span>Network: <span className="text-zinc-300">{facts.network}</span></span>
                {facts.oklinkMeta?.txCount !== undefined && (
                  <span className="font-mono text-zinc-500">{facts.oklinkMeta.txCount.toLocaleString()} txs</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — WHAT YOU GIVE (PRD §15) */}
        <div className="rounded-xl bg-zinc-900/40 border border-zinc-800/80 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Section 3 • What you give
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/60">
              <div className="text-[11px] text-zinc-500">Permission Requested</div>
              <div
                className={`text-sm font-bold mt-1 ${
                  facts.isUnlimitedApproval ? 'text-rose-400' : 'text-zinc-200'
                }`}
              >
                {facts.requestedAmountFormatted}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Token: {facts.tokenSymbol || 'USDT'}
              </div>
            </div>

            <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/60">
              <div className="text-[11px] text-zinc-500">Potential Exposure</div>
              <div className="text-sm font-bold text-zinc-100 mt-1 font-mono">
                ${facts.potentialExposureUsd.toLocaleString()}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Max drain exposure under contract
              </div>
            </div>

            <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/60">
              <div className="text-[11px] text-zinc-500">Wallet Impact</div>
              <div
                className={`text-sm font-bold mt-1 ${
                  facts.walletExposurePercent > 50 ? 'text-amber-400' : 'text-zinc-200'
                }`}
              >
                {facts.walletExposurePercent}% of Wallet
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Balance: {facts.walletAssetBalanceFormatted}
              </div>
            </div>
          </div>

          <div className="mt-3 p-3 bg-zinc-950/80 rounded-lg border border-zinc-800/60 text-xs text-zinc-300 space-y-1">
            <div className="font-semibold text-zinc-200">Simulation Outcome:</div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              {explanation.what_is_happening}
            </p>
          </div>
        </div>

        {/* SECTION 4 — WHAT AURA FOUND (PRD §15) */}
        <div className="rounded-xl bg-zinc-900/40 border border-zinc-800/80 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
            <span>Section 4 • What AURA Found</span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {facts.riskSignals.length} signals verified
            </span>
          </div>

          <div className="space-y-2">
            {facts.riskSignals.map((signal) => (
              <div
                key={signal.id}
                className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 flex items-start space-x-3"
              >
                <div className="mt-0.5">
                  {signal.severity === 'CRITICAL' || signal.severity === 'HIGH' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : signal.severity === 'MODERATE' ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-zinc-200">{signal.title}</h5>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono ${
                        signal.severity === 'CRITICAL' || signal.severity === 'HIGH'
                          ? 'bg-rose-500/15 text-rose-300'
                          : signal.severity === 'MODERATE'
                          ? 'bg-yellow-500/15 text-yellow-300'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }`}
                    >
                      {signal.severity}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {signal.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* OnchainOS AI Agent Guardrail Status (Feature A) */}
          {facts.agentPolicyCompliance && (
            <div className="mt-3 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  OnchainOS Agent Guardrail Compliance
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    facts.agentPolicyCompliance.passed
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {facts.agentPolicyCompliance.passed ? 'PASSED (SAFE FOR AGENTS)' : 'VETOED (BLOCKED FOR AGENTS)'}
                </span>
              </div>
              {!facts.agentPolicyCompliance.passed && (
                <ul className="text-[11px] text-rose-400/90 list-disc list-inside space-y-0.5 mt-1">
                  {facts.agentPolicyCompliance.violations.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {explanation.uncertainty && explanation.uncertainty.length > 0 && (
            <div className="mt-3 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 flex items-center space-x-2">
              <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>{explanation.uncertainty.join(' ')}</span>
            </div>
          )}
        </div>

        {/* SECTION 5 — RECOMMENDATION (PRD §15) */}
        <div
          className={`rounded-xl border p-4 sm:p-5 ${
            isDangerous
              ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
              : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Section 5 • AURA Recommends</span>
          </div>

          <div className="text-sm sm:text-base font-bold text-zinc-100">
            {explanation.recommendation === 'LIMIT_APPROVAL'
              ? 'Do not approve unlimited access. Limit the approval.'
              : explanation.recommendation === 'REJECT_TRANSACTION'
              ? 'Reject this transaction. High probability of malicious drain.'
              : 'Transaction parameters appear standard. Safe to proceed.'}
          </div>

          <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
            {explanation.recommendation_detail}
          </p>

          {/* Action toggle for Q&A and Technical Calldata */}
          <div className="mt-4 flex items-center space-x-3 pt-3 border-t border-zinc-800/60">
            <button
              onClick={() => setShowQA(!showQA)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showQA ? 'Hide Questions Assistant' : 'Ask AURA Questions'}</span>
            </button>
            <span className="text-zinc-600">•</span>
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showTechnicalDetails ? 'Hide Calldata' : 'Inspect Calldata'}</span>
            </button>
          </div>

          {/* AURA Questions Drawer */}
          {showQA && (
            <div className="mt-4 pt-2">
              <AuraQuestionsChat facts={facts} />
            </div>
          )}

          {/* Technical Calldata Inspection */}
          {showTechnicalDetails && (
            <div className="mt-4 p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-400 space-y-1 overflow-x-auto">
              <div>Target: {facts.targetAddress}</div>
              <div>Chain ID: {facts.chainId} ({facts.network})</div>
              <div>Amount Raw: {facts.requestedAmountRaw || '0'}</div>
              <div>Token Address: {facts.tokenAddress}</div>
            </div>
          )}
        </div>

        {/* Risk Acknowledgment checkbox for high/critical transactions (PRD §16) */}
        {isDangerous && (
          <div className="p-3 bg-zinc-900/60 border border-rose-900/30 rounded-xl flex items-center space-x-3">
            <input
              type="checkbox"
              id="risk-ack"
              checked={riskAcknowledged}
              onChange={(e) => setRiskAcknowledged(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
            <label htmlFor="risk-ack" className="text-xs text-zinc-300 cursor-pointer select-none">
              I understand AURA’s warning that this action creates high potential exposure, and I accept the risk.
            </label>
          </div>
        )}

        {/* DECISION ACTION FOOTER */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          {facts.isUnlimitedApproval ? (
            <>
              <button
                onClick={() => setShowLimitModal(true)}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Limit Approval to Safe Cap ($500)</span>
              </button>

              <button
                onClick={() => onApprove('APPROVED')}
                disabled={isDangerous && !riskAcknowledged}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 font-semibold text-xs transition-colors border border-zinc-800 cursor-pointer"
              >
                Continue Anyway
              </button>

              <button
                onClick={onReject}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-zinc-950 hover:bg-rose-950/40 text-rose-400 font-semibold text-xs transition-colors border border-zinc-800 hover:border-rose-800/40 cursor-pointer"
              >
                Reject & Abort
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onApprove('APPROVED')}
                disabled={isDangerous && !riskAcknowledged}
                className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer ${
                  isDangerous
                    ? 'bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 shadow-amber-950/50'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sign & Execute Transaction</span>
              </button>

              <button
                onClick={onReject}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition-colors border border-zinc-800 cursor-pointer"
              >
                Reject & Abort
              </button>
            </>
          )}
        </div>
      </div>

      {/* Limit Approval Modal Dialog */}
      <LimitApprovalModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        facts={facts}
        onConfirmLimit={handleLimitConfirm}
      />
    </div>
  );
};
