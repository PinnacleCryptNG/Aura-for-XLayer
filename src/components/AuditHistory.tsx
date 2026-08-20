import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Sliders,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  Lock,
  Copy,
  Check,
  ArrowUpRight,
  Filter,
  Shield,
  Activity,
  AlertOctagon,
  FileCode2,
} from 'lucide-react';
import { DecisionRecord, RiskLevel } from '../types';

interface AuditHistoryProps {
  records: DecisionRecord[];
}

export const AuditHistory: React.FC<AuditHistoryProps> = ({ records }) => {
  const [selectedRecord, setSelectedRecord] = useState<DecisionRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MODIFIED' | 'REJECTED' | 'APPROVED'>('ALL');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const totalSavedValue = records.reduce((acc, r) => acc + (r.savedExposureUsd || 0), 0);
  const totalAnalyzed = records.length;
  const modifiedCount = records.filter((r) => r.userDecision === 'MODIFIED_LIMITED').length;
  const rejectedCount = records.filter((r) => r.userDecision === 'REJECTED').length;
  const approvedCount = records.filter((r) => r.userDecision === 'APPROVED').length;

  const handleCopy = (e: React.MouseEvent, addr: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const filtered = records.filter((r) => {
    // Filter type
    if (activeFilter === 'MODIFIED' && r.userDecision !== 'MODIFIED_LIMITED') return false;
    if (activeFilter === 'REJECTED' && r.userDecision !== 'REJECTED') return false;
    if (activeFilter === 'APPROVED' && r.userDecision !== 'APPROVED') return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.actionTitle.toLowerCase().includes(q) ||
      r.targetName.toLowerCase().includes(q) ||
      r.targetAddress.toLowerCase().includes(q) ||
      r.whyUserSignedRecord.toLowerCase().includes(q) ||
      r.network.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-full pb-16 sm:pb-6 animate-in fade-in duration-300">
      {/* Top Hero Telemetry Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Protected Value Saved */}
        <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950/90 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-xl group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Active Defense
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Protected Value Defended
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono tracking-tight">
              +${totalSavedValue.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-400 pt-1">
              Direct capital preserved from malicious drains & unlimited exposures.
            </p>
          </div>
        </div>

        {/* Metric 2: Intercept Statistics */}
        <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950/90 border border-cyan-500/20 rounded-3xl p-5 sm:p-6 shadow-xl group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {totalAnalyzed} Decisions Logged
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Threat Interceptions
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {modifiedCount + rejectedCount} / {totalAnalyzed}
            </div>
            <div className="flex items-center space-x-2 pt-1 text-[11px] font-mono">
              <span className="text-cyan-400 font-semibold">{modifiedCount} Capped</span>
              <span className="text-zinc-600">•</span>
              <span className="text-rose-400 font-semibold">{rejectedCount} Aborted</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">{approvedCount} Executed</span>
            </div>
          </div>
        </div>

        {/* Metric 3: OKLink Bytecode Verification & Auditability */}
        <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileCode2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              OKLink Verifier
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Verification Engine
            </div>
            <div className="text-lg sm:text-xl font-bold text-zinc-100 font-mono tracking-tight pt-0.5">
              Deterministic Bytecode
            </div>
            <p className="text-xs text-zinc-400 pt-1">
              Calldata translated & verifiable on X Layer explorer with zero simulated stubs.
            </p>
          </div>
        </div>
      </div>

      {/* High-Precision Search & Filter Toolbar */}
      <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-3 sm:p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by contract name, 0x address, or action type..."
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-zinc-800 text-white border border-zinc-700 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            All ({records.length})
          </button>
          <button
            onClick={() => setActiveFilter('MODIFIED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeFilter === 'MODIFIED'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-zinc-400 hover:text-cyan-400 hover:bg-zinc-900'
            }`}
          >
            <Sliders className="w-3 h-3 text-cyan-400" />
            <span>Protected ({modifiedCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeFilter === 'REJECTED'
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold'
                : 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-900'
            }`}
          >
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>Blocked ({rejectedCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeFilter === 'APPROVED'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold'
                : 'text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Executed ({approvedCount})</span>
          </button>
        </div>
      </div>

      {/* Audit Log Cards Container */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/30 border border-zinc-800/60 rounded-3xl space-y-3">
            <History className="w-8 h-8 text-zinc-600 mx-auto" />
            <h4 className="text-sm font-bold text-zinc-300">No matching audit records found</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your search query or filter tags to inspect logged actions.
            </p>
          </div>
        ) : (
          filtered.map((rec) => {
            const isApproved = rec.userDecision === 'APPROVED';
            const isModified = rec.userDecision === 'MODIFIED_LIMITED';
            const isRejected = rec.userDecision === 'REJECTED';

            return (
              <div
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className="relative p-5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-cyan-500/40 transition-all duration-200 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 group shadow-sm hover:shadow-md"
              >
                {/* Left Section: Icon + Description */}
                <div className="flex items-start space-x-4">
                  {/* Status Indicator Icon */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 shadow-inner ${
                      isModified
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        : isRejected
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isModified ? (
                      <Sliders className="w-5 h-5" />
                    ) : isRejected ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors">
                        {rec.actionTitle}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {rec.network}
                      </span>
                      <span
                        className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-mono font-bold ${
                          rec.riskLevel === 'CRITICAL' || rec.riskLevel === 'HIGH'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                            : rec.riskLevel === 'MODERATE'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {rec.riskLevel} RISK ({rec.riskScore}/100)
                      </span>
                    </div>

                    {/* Target Details */}
                    <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-zinc-300 font-medium">{rec.targetName}</span>
                      <div className="flex items-center space-x-1 font-mono text-[11px] text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-800/80">
                        <span>{rec.targetAddress.slice(0, 6)}...{rec.targetAddress.slice(-4)}</span>
                        <button
                          onClick={(e) => handleCopy(e, rec.targetAddress)}
                          className="hover:text-zinc-300 p-0.5"
                          title="Copy address"
                        >
                          {copiedAddress === rec.targetAddress ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Human Explanation Translation */}
                    <p className="text-xs text-zinc-400 leading-relaxed pt-0.5">
                      {rec.whyUserSignedRecord}
                    </p>
                  </div>
                </div>

                {/* Right Section: Decision Outcome & Values */}
                <div className="flex items-center justify-between lg:justify-end space-x-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-800/60 shrink-0">
                  <div className="text-left lg:text-right space-y-1">
                    <div
                      className={`text-xs font-bold font-mono ${
                        isModified
                          ? 'text-cyan-400'
                          : isRejected
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {isModified
                        ? '🛡️ Limited & Protected'
                        : isRejected
                        ? '🛑 Blocked Threat'
                        : '✅ Executed Safely'}
                    </div>

                    {rec.savedExposureUsd > 0 && (
                      <div className="text-xs font-mono text-emerald-400 font-bold">
                        +${rec.savedExposureUsd.toLocaleString()} saved
                      </div>
                    )}

                    <div className="text-[11px] text-zinc-500 font-mono">{rec.timestamp}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 group-hover:border-cyan-500/40 flex items-center space-x-1 transition-all">
                      <span>Inspect Audit</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rich Cryptographic Audit Proof Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cryptographic Audit Breakdown</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Deterministic verification proof on {selectedRecord.network}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              >
                Close (ESC)
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
              {/* Action and User Decision Summary */}
              <div className="p-4 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-2">
                <div className="text-[11px] uppercase font-bold text-zinc-400 font-mono">
                  Action & Intercept Decision
                </div>
                <div className="text-sm font-bold text-zinc-100">{selectedRecord.actionTitle}</div>
                <div className="text-emerald-400 font-medium leading-relaxed">
                  {selectedRecord.whyUserSignedRecord}
                </div>
              </div>

              {/* What AURA Detected */}
              <div className="p-4 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-2">
                <div className="text-[11px] uppercase font-bold text-zinc-400 font-mono">
                  AURA AI Sentinel Findings
                </div>
                <p className="text-zinc-300 leading-relaxed">{selectedRecord.summary}</p>
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Risk Score: {selectedRecord.riskScore}/100
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Recommendation: {selectedRecord.recommendation}
                  </span>
                </div>
              </div>

              {/* Financial Exposure Comparison */}
              <div className="grid grid-cols-2 gap-3 text-center font-mono">
                <div className="p-3.5 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                  <div className="text-zinc-400 text-[10px] uppercase font-bold">Original Risk Exposure</div>
                  <div className="text-zinc-200 text-base font-bold mt-1">
                    ${selectedRecord.originalExposureUsd.toLocaleString()}
                  </div>
                </div>
                <div className="p-3.5 bg-emerald-950/20 rounded-2xl border border-emerald-800/30">
                  <div className="text-emerald-400 text-[10px] uppercase font-bold">Protected Capital Saved</div>
                  <div className="text-emerald-300 text-base font-black mt-1">
                    +${selectedRecord.savedExposureUsd.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Verified Contract Metadata & OKLink Explorer */}
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/90 space-y-2 font-mono text-[11px]">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Target Contract:</span>
                  <span className="text-zinc-200">{selectedRecord.targetName}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Contract Address:</span>
                  <span className="text-cyan-400 truncate max-w-xs">{selectedRecord.targetAddress}</span>
                </div>
                <div className="pt-2 flex justify-end">
                  <a
                    href={`https://www.oklink.com/xlayer/address/${selectedRecord.targetAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    <span>Inspect On OKLink Explorer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end border-t border-zinc-800">
              <button
                onClick={() => setSelectedRecord(null)}
                className="py-2 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-800 transition-colors"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
