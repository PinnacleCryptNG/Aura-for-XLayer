import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Copy,
  Check,
  Filter,
  Shield,
  Activity,
  ChevronRight,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { DecisionRecord } from '../types';

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
    if (activeFilter === 'MODIFIED' && r.userDecision !== 'MODIFIED_LIMITED') return false;
    if (activeFilter === 'REJECTED' && r.userDecision !== 'REJECTED') return false;
    if (activeFilter === 'APPROVED' && r.userDecision !== 'APPROVED') return false;

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
      {/* Top Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Money Saved */}
        <div className="relative overflow-hidden bg-[#10172a] border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
              Protected
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Money Protected
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono tracking-tight">
              +${totalSavedValue.toLocaleString()}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 pt-1 leading-relaxed">
              Money we helped you keep safe from dangerous traps and drainers.
            </p>
          </div>
        </div>

        {/* Metric 2: Summary of Actions */}
        <div className="relative overflow-hidden bg-[#10172a] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {totalAnalyzed} Checked
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Protection Summary
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {modifiedCount + rejectedCount} Protected
            </div>
            <div className="flex items-center space-x-2 pt-1 text-xs font-medium text-slate-300">
              <span className="text-emerald-400">{modifiedCount} limited</span>
              <span>•</span>
              <span className="text-[#fca5a5]">{rejectedCount} stopped</span>
              <span>•</span>
              <span className="text-slate-300">{approvedCount} allowed</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Network Verification */}
        <div className="relative overflow-hidden bg-[#10172a] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
              X Layer
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Safety Verification
            </div>
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight pt-0.5">
              Verified On-Chain
            </div>
            <p className="text-xs sm:text-sm text-slate-300 pt-1 leading-relaxed">
              Every check is verified against real smart contract data on X Layer.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#10172a] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by app name or action..."
            className="w-full bg-[#0b1222] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'MODIFIED', label: 'Limited' },
            { id: 'REJECTED', label: 'Stopped' },
            { id: 'APPROVED', label: 'Allowed' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 bg-[#0b1222] hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Records List */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-[#10172a] border border-slate-800 rounded-3xl space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-200">No records found</p>
            <p className="text-xs text-slate-400">Try a different search term or filter.</p>
          </div>
        ) : (
          filtered.map((record) => {
            const isLimited = record.userDecision === 'MODIFIED_LIMITED';
            const isRejected = record.userDecision === 'REJECTED';
            const isApproved = record.userDecision === 'APPROVED';

            return (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className="p-5 rounded-3xl bg-[#10172a] hover:bg-[#151f38] border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-3 group shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isLimited
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : isRejected
                          ? 'bg-[#38141d] border border-[#671e2a] text-[#fca5a5]'
                          : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      {isLimited ? (
                        <Shield className="w-5 h-5" />
                      ) : isRejected ? (
                        <ShieldAlert className="w-5 h-5" />
                      ) : (
                        <ShieldCheck className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors">
                          {record.actionTitle}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isLimited
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : isRejected
                              ? 'bg-[#38141d] text-[#fca5a5] border border-[#671e2a]'
                              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          }`}
                        >
                          {isLimited
                            ? '🛡️ Limited'
                            : isRejected
                            ? '🛑 Stopped'
                            : '✅ Allowed'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                        App: <span className="font-semibold text-white">{record.targetName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 text-xs sm:text-sm">
                    {record.savedExposureUsd && record.savedExposureUsd > 0 && (
                      <span className="font-mono font-semibold text-emerald-400">
                        +${record.savedExposureUsd.toLocaleString()} saved
                      </span>
                    )}
                    <span className="text-slate-400 font-mono">{record.timestamp}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0b1222] border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <span className="text-slate-400 font-semibold">Plain English Explanation: </span>
                  {record.whyUserSignedRecord}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Transaction Safety Record</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 block mb-0.5">Action</span>
                <p className="text-sm sm:text-base font-bold text-white">{selectedRecord.actionTitle}</p>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Target Contract / App</span>
                <p className="text-white font-medium">{selectedRecord.targetName}</p>
                <p className="font-mono text-slate-400 text-xs mt-0.5">{selectedRecord.targetAddress}</p>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Decision & Outcome</span>
                <span className="inline-block font-semibold px-2.5 py-1 rounded-lg bg-[#0b1222] border border-slate-800 text-emerald-300">
                  {selectedRecord.userDecision === 'MODIFIED_LIMITED'
                    ? '🛡️ Limited permission safely'
                    : selectedRecord.userDecision === 'REJECTED'
                    ? '🛑 Stopped and rejected'
                    : '✅ Allowed (verified safe)'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0b1222] border border-slate-800 leading-relaxed text-slate-300">
                <span className="text-slate-400 font-semibold block mb-1">Safety Finding</span>
                {selectedRecord.whyUserSignedRecord}
              </div>

              <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800 text-xs font-mono">
                <span>Network: {selectedRecord.network}</span>
                <span>Time: {selectedRecord.timestamp}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
