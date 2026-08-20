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
          bg: 'bg-[#38141d] border-[#671e2a] text-[#fca5a5]',
          dot: 'bg-[#f87171]',
          title: 'CRITICAL RISK',
        };
      case 'HIGH':
        return {
          bg: 'bg-[#38141d] border-[#671e2a] text-[#fca5a5]',
          dot: 'bg-[#f87171]',
          title: 'HIGH RISK',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          dot: 'bg-amber-400',
          title: 'MODERATE RISK',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          dot: 'bg-emerald-400',
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
    <div className="w-full max-w-3xl mx-auto bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Banner / Intercept Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-[#121a2d] via-[#10172a] to-[#131d35] border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center border shrink-0 ${
              isDangerous
                ? 'bg-[#38141d] text-[#fca5a5] border-[#671e2a]'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isDangerous ? <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" /> : <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Transaction Review
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                X Layer
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Safety check completed before signing
            </p>
          </div>
        </div>

        {/* Risk Score Pill */}
        <div className={`px-3 sm:px-3.5 py-1.5 rounded-xl border flex items-center space-x-2 shrink-0 ${badge.bg}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${badge.dot} animate-pulse`} />
          <div className="text-right">
            <div className="text-xs font-black tracking-wide">{badge.title}</div>
            <div className="text-[10px] font-mono opacity-90">Safety Score {facts.riskScore}%</div>
          </div>
        </div>
      </div>

      {/* X Layer Sub-Cent Gas Metrics Banner */}
      <div className="px-4 sm:px-6 py-3 bg-[#121a2d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center space-x-2 text-slate-300">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">X Layer Gas:</span>
          <span className="font-mono text-emerald-300 font-bold">
            {facts.gasMetrics?.xLayerGasOkb || '0.0000085'} OKB (~${facts.gasMetrics?.xLayerGasUsd || '0.0005'})
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 font-semibold text-xs border border-emerald-500/20 font-mono">
            Low Fee Layer 2
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* SECTION 1 — WHAT THIS TRANSACTION DOES */}
        <div className="rounded-2xl bg-[#121a2d] border border-slate-800 p-4 sm:p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
            What this transaction does
          </div>
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div className="text-base sm:text-lg font-bold text-white">
              {facts.isUnlimitedApproval
                ? `Approve ${facts.tokenSymbol || 'Token'} Spending`
                : facts.txType === 'DEX_SWAP'
                ? `Swap via ${facts.swapDetails?.routerName || 'OKX DEX'}`
                : facts.txType === 'TOKEN_TRANSFER' || facts.txType === 'NATIVE_TRANSFER'
                ? `Send ${facts.requestedAmountFormatted}`
                : `Execute ${facts.txType.replace(/_/g, ' ')}`}
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
              {facts.network}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 mt-2.5 leading-relaxed bg-[#0b1222] p-3.5 rounded-xl border border-slate-800">
            {explanation.summary}
          </p>
        </div>

        {/* SECTION: OKX DEX SWAP & SLIPPAGE VISUALIZER */}
        {facts.swapDetails && (
          <div className="rounded-2xl bg-[#121a2d] border border-slate-800 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5" /> OKX DEX Swap & Rate Check
              </span>
              <span className="text-slate-400 font-mono text-[10px]">
                Router: {facts.swapDetails.routerName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
              {/* Token Input */}
              <div className="p-3.5 bg-[#0b1222] rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400">You Pay (Input)</p>
                <p className="text-sm sm:text-base font-bold text-white mt-0.5">
                  {facts.swapDetails.inputTokenAmount} {facts.swapDetails.inputTokenSymbol}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  ~${facts.swapDetails.inputTokenUsd.toLocaleString()} USD
                </p>
              </div>

              {/* Expected Output & Min Received */}
              <div className="p-3.5 bg-[#0b1222] rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400">Expected Output</p>
                <p className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5">
                  {facts.swapDetails.expectedOutputAmount}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Min: <span className="font-mono text-white">{facts.swapDetails.minimumReceivedAmount}</span>
                </p>
              </div>

              {/* Slippage & MEV Risk */}
              <div
                className={`p-3.5 rounded-xl border ${
                  facts.swapDetails.isHighSlippage
                    ? 'bg-[#38141d] border-[#671e2a] text-[#fca5a5]'
                    : 'bg-[#0b1222] border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span>Price Difference</span>
                  <span className="font-bold font-mono text-xs sm:text-sm">
                    {facts.swapDetails.slippageTolerancePercent}%
                  </span>
                </div>
                {facts.swapDetails.isHighSlippage ? (
                  <p className="text-xs text-[#fca5a5] mt-1 font-medium leading-relaxed">
                    ⚠️ Bad price difference! You might lose money.
                  </p>
                ) : (
                  <p className="text-xs text-emerald-400 mt-1 font-medium leading-relaxed">
                    ✓ Fair rate on X Layer.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2 — CONTRACT & DESTINATION DETAILS */}
        <div className="rounded-2xl bg-[#121a2d] border border-slate-800 p-4 sm:p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between font-mono">
            <span>Contract & Destination</span>
            {facts.oklinkMeta?.explorerUrl && (
              <a
                href={facts.oklinkMeta.explorerUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>View on Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3.5 bg-[#0b1222] rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-xs">Application / Name:</span>
              <div className="font-semibold text-[#f5f1eb] text-sm sm:text-base">{facts.contractName}</div>
              <div className="flex items-center flex-wrap gap-1.5 pt-1">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    facts.contractVerified
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}
                >
                  {facts.contractVerified ? '✓ Verified Source' : '⚠️ Unverified Bytecode'}
                </span>
                <span className="text-xs text-slate-400">
                  Deployed {facts.contractAgeDays} day(s) ago
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#0b1222] rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-xs">Contract Address:</span>
              <div className="font-mono text-xs text-slate-300 break-all select-all">
                {facts.targetAddress}
              </div>
              <div className="text-xs text-slate-400 pt-1 flex items-center justify-between">
                <span>Network: <span className="text-slate-200">{facts.network}</span></span>
                {facts.oklinkMeta?.txCount !== undefined && (
                  <span className="font-mono text-slate-400">{facts.oklinkMeta.txCount.toLocaleString()} txs</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — WALLET IMPACT */}
        <div className="rounded-2xl bg-[#121a2d] border border-slate-800 p-4 sm:p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
            What you give & wallet impact
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-[#0b1222] rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Permission Requested</div>
              <div
                className={`text-sm sm:text-base font-bold mt-1 ${
                  facts.isUnlimitedApproval ? 'text-[#fca5a5]' : 'text-slate-200'
                }`}
              >
                {facts.requestedAmountFormatted}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Token: {facts.tokenSymbol || 'USDT'}
              </div>
            </div>

            <div className="p-3.5 bg-[#0b1222] rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Potential Exposure</div>
              <div className="text-sm sm:text-base font-bold text-white mt-1 font-mono">
                ${facts.potentialExposureUsd.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Maximum funds at risk
              </div>
            </div>

            <div className="p-3.5 bg-[#0b1222] rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Wallet Impact</div>
              <div
                className={`text-sm sm:text-base font-bold mt-1 ${
                  facts.walletExposurePercent > 50 ? 'text-amber-300' : 'text-slate-200'
                }`}
              >
                {facts.walletExposurePercent}% of Wallet
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Balance: {facts.walletAssetBalanceFormatted}
              </div>
            </div>
          </div>

          <div className="mt-3 p-3.5 bg-[#0b1222] rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 space-y-1">
            <div className="font-semibold text-white">Outcome summary:</div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {explanation.what_is_happening}
            </p>
          </div>
        </div>

        {/* SECTION 4 — SAFETY FINDINGS */}
        <div className="rounded-2xl bg-[#121a2d] border border-slate-800 p-4 sm:p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between font-mono">
            <span>Safety Findings</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {facts.riskSignals.length} items checked
            </span>
          </div>

          <div className="space-y-2.5">
            {facts.riskSignals.map((signal) => (
              <div
                key={signal.id}
                className="p-3.5 rounded-xl bg-[#0b1222] border border-slate-800 flex items-start space-x-3"
              >
                <div className="mt-0.5">
                  {signal.severity === 'CRITICAL' || signal.severity === 'HIGH' ? (
                    <AlertTriangle className="w-4 h-4 text-[#fca5a5]" />
                  ) : signal.severity === 'MODERATE' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs sm:text-sm font-bold text-white">{signal.title}</h5>
                    <span
                      className={`text-[9px] uppercase px-2 py-0.5 rounded font-mono ${
                        signal.severity === 'CRITICAL' || signal.severity === 'HIGH'
                          ? 'bg-[#38141d] text-[#fca5a5] border border-[#671e2a]'
                          : signal.severity === 'MODERATE'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }`}
                    >
                      {signal.severity}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    {signal.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Automated Guardrail Status */}
          {facts.agentPolicyCompliance && (
            <div className="mt-3 p-3.5 rounded-xl bg-[#0b1222] border border-slate-800 text-xs sm:text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  Automated Safety Rules Compliance
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    facts.agentPolicyCompliance.passed
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-[#38141d] text-[#fca5a5] border border-[#671e2a]'
                  }`}
                >
                  {facts.agentPolicyCompliance.passed ? 'PASSED' : 'VETOED'}
                </span>
              </div>
              {!facts.agentPolicyCompliance.passed && (
                <ul className="text-xs text-[#fca5a5] list-disc list-inside space-y-0.5 mt-1">
                  {facts.agentPolicyCompliance.violations.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {explanation.uncertainty && explanation.uncertainty.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-[#0b1222] border border-slate-800 text-xs text-slate-300 flex items-center space-x-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{explanation.uncertainty.join(' ')}</span>
            </div>
          )}
        </div>

        {/* SECTION 5 — RECOMMENDATION */}
        <div
          className={`rounded-2xl border p-4 sm:p-5 ${
            isDangerous
              ? 'bg-[#2b1016] border-[#5e1c25] text-[#fecdd3]'
              : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center space-x-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommendation</span>
          </div>

          <div className="text-sm sm:text-base font-bold text-white">
            {explanation.recommendation === 'LIMIT_APPROVAL'
              ? 'Do not approve unlimited access. Limit the approval.'
              : explanation.recommendation === 'REJECT_TRANSACTION'
              ? 'Reject this transaction. High probability of malicious drain.'
              : 'Transaction parameters appear standard. Safe to proceed.'}
          </div>

          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            {explanation.recommendation_detail}
          </p>

          {/* Action toggle for Q&A and Technical Calldata */}
          <div className="mt-4 flex items-center space-x-3 pt-3 border-t border-slate-800/80 text-xs sm:text-sm">
            <button
              onClick={() => setShowQA(!showQA)}
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showQA ? 'Hide Assistant' : 'Ask Questions'}</span>
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="text-slate-400 hover:text-slate-200 flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showTechnicalDetails ? 'Hide Technical Data' : 'Inspect Technical Data'}</span>
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
            <div className="mt-4 p-3.5 bg-[#0b1222] rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-1 overflow-x-auto">
              <div>Target: {facts.targetAddress}</div>
              <div>Chain ID: {facts.chainId} ({facts.network})</div>
              <div>Amount Raw: {facts.requestedAmountRaw || '0'}</div>
              <div>Token Address: {facts.tokenAddress}</div>
            </div>
          )}
        </div>

        {/* Risk Acknowledgment checkbox for high/critical transactions */}
        {isDangerous && (
          <div className="p-3.5 bg-[#121a2d] border border-[#5e1c25] rounded-xl flex items-center space-x-3">
            <input
              type="checkbox"
              id="risk-ack"
              checked={riskAcknowledged}
              onChange={(e) => setRiskAcknowledged(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-[#0b1222] text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
            <label htmlFor="risk-ack" className="text-xs sm:text-sm text-slate-200 cursor-pointer select-none leading-relaxed">
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
                className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Limit to 1 USDT (Recommended)</span>
              </button>

              <button
                onClick={() => onApprove('APPROVED')}
                disabled={isDangerous && !riskAcknowledged}
                className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 font-semibold text-xs sm:text-sm transition-colors border border-slate-800 cursor-pointer"
              >
                Allow Full Amount
              </button>

              <button
                onClick={onReject}
                className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-[#2b1016] hover:bg-[#38141d] text-[#fca5a5] font-semibold text-xs sm:text-sm transition-colors border border-[#5e1c25] cursor-pointer"
              >
                Stop & Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onApprove('APPROVED')}
                disabled={isDangerous && !riskAcknowledged}
                className={`w-full sm:flex-1 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer ${
                  isDangerous
                    ? 'bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 shadow-amber-950/50'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sign & Continue</span>
              </button>

              <button
                onClick={onReject}
                className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs sm:text-sm transition-colors border border-slate-800 cursor-pointer"
              >
                Stop & Cancel
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
