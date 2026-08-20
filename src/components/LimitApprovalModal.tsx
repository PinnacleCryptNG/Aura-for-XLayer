import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, X, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { DeterministicFacts, AuraExplanation } from '../types';

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
  const [customAmount, setCustomAmount] = useState('500');
  const [isPreset, setIsPreset] = useState(true);

  if (!isOpen) return null;

  const presets = ['100', '250', '500', '1000'];
  const tokenSymbol = facts.tokenSymbol || 'USDT';
  const originalExposure = facts.potentialExposureUsd;
  const newExposure = parseFloat(customAmount) || 0;
  const protectedSavings = Math.max(0, originalExposure - newExposure);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = `$${parseFloat(customAmount).toLocaleString()} ${tokenSymbol}`;
    onConfirmLimit(customAmount, formatted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">AURA Safety Modification</h3>
              <p className="text-xs text-zinc-400">Limit approval allowance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Current Requested Permission:</span>
              <span className="font-semibold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Unlimited (~${originalExposure.toLocaleString()})
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800/60">
              <span className="text-zinc-400">New Protected Exposure:</span>
              <span className="font-semibold text-emerald-400">
                ${newExposure.toLocaleString()} {tokenSymbol}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800/60 font-mono">
              <span className="text-zinc-400">Protected Value Saved:</span>
              <span className="font-bold text-cyan-400">
                +${protectedSavings.toLocaleString()} protected
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Select or Enter Specific Allowance Cap ({tokenSymbol})
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
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    customAmount === amt
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setIsPreset(false);
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
                placeholder="Custom amount"
                required
              />
              <span className="absolute right-4 top-2.5 text-xs font-semibold text-zinc-500">
                {tokenSymbol}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-xs text-emerald-300/90 leading-relaxed flex items-start space-x-2">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              By capping the approval at <strong>${newExposure} {tokenSymbol}</strong>, the contract can never withdraw more than this amount even if compromised.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors border border-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950/40"
            >
              <span>Apply Limit & Sign</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
