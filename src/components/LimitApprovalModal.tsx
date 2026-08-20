import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, X, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { DeterministicFacts } from '../types';

interface LimitApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  facts: DeterministicFacts;
  onConfirmLimit: (newAmount: string, newFormatted: string) => void;
}

export const LimitApprovalModal: React.FC<LimitApprovalModalProps> = ({
  isOpen,
  onClose,
  facts,
  onConfirmLimit,
}) => {
  const [customAmount, setCustomAmount] = useState('1');
  const [isPreset, setIsPreset] = useState(true);

  if (!isOpen) return null;

  const presets = ['0.1', '1', '5', '10'];
  const tokenSymbol = facts.tokenSymbol || 'USDT';
  const originalExposure = facts.potentialExposureUsd;
  const newExposure = parseFloat(customAmount) || 0;
  const protectedSavings = Math.max(0, originalExposure - newExposure);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = `${parseFloat(customAmount)} ${tokenSymbol}`;
    onConfirmLimit(customAmount, formatted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121a2d]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Safe Limit Settings</h3>
              <p className="text-xs text-slate-300">Choose a safe spending limit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          <div className="bg-[#121a2d] border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Current Requested Permission:</span>
              <span className="font-semibold text-[#fca5a5] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Unlimited Permission
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
              <span className="text-slate-400">New Protected Limit:</span>
              <span className="font-bold text-emerald-400">
                {newExposure} {tokenSymbol}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800 font-mono">
              <span className="text-slate-400">Protected From Drainers:</span>
              <span className="font-bold text-emerald-300">
                ✓ Wallet Protected
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              Select or Enter Specific Limit ({tokenSymbol})
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {presets.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => {
                    setCustomAmount(amt);
                    setIsPreset(true);
                  }}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    customAmount === amt
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-[#121a2d] text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {amt} {tokenSymbol}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="number"
                min="0.01"
                step="any"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setIsPreset(false);
                }}
                className="w-full bg-[#0b1222] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="Custom amount"
                required
              />
              <span className="absolute right-4 top-2.5 text-xs font-semibold text-slate-400">
                {tokenSymbol}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-xs text-emerald-300 leading-relaxed flex items-start space-x-2.5">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              By setting the limit to <strong>{newExposure} {tokenSymbol}</strong>, the app can never take more than this amount.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-semibold transition-colors border border-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <span>Save & Sign</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
