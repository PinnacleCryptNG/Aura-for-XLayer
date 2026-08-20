import React, { useState } from 'react';
import {
  Play,
  Shield,
  Zap,
  ArrowRight,
  Code2,
  ShieldAlert,
  CheckCircle2,
  Repeat,
} from 'lucide-react';
import { RawTxInput } from '../lib/decoder';

interface DAppSandboxProps {
  onTriggerAnalysis: (input: RawTxInput) => void;
  currentChainId: number;
}

export const DAppSandbox: React.FC<DAppSandboxProps> = ({
  onTriggerAnalysis,
  currentChainId,
}) => {
  const [customTo, setCustomTo] = useState('0x8391a27f69201f8449c239d1089201a4e8291a27');
  const [customToken, setCustomToken] = useState('USDT');
  const [customAmount, setCustomAmount] = useState('1');
  const [customSlippage, setCustomSlippage] = useState(0.5);
  const [customCalldata, setCustomCalldata] = useState(
    '0x095ea7b30000000000000000000000008391a27f69201f8449c239d1089201a4e8291a27ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
  );

  // Trigger Demo 1: Drainer Trap
  const handleLaunchDemo1 = () => {
    onTriggerAnalysis({
      to: '0x8391a27f69201f8449c239d1089201a4e8291a27',
      chainId: currentChainId,
      data: '0x095ea7b30000000000000000000000008391a27f69201f8449c239d1089201a4e8291a27ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      customTokenSymbol: 'USDT',
      customAmount: 'UNLIMITED',
      actionTitle: 'Dangerous Unlimited USDT Permission',
    });
  };

  // Trigger Demo 2: Safe Transfer (1 USDT)
  const handleLaunchDemo2 = () => {
    onTriggerAnalysis({
      to: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
      chainId: currentChainId,
      data: '0xa9059cbb00000000000000000000000095222290dd7278aa3ddd389cc1e1d165cc4bafe500000000000000000000000000000000000000000000000000000000000f4240',
      customTokenSymbol: 'USDT',
      customAmount: '1',
      actionTitle: 'Safe 1 USDT Transfer',
    });
  };

  // Trigger Scenario 3: High Slippage Trap (Swap 5 USDT -> Unknown Token)
  const handleLaunchDemoDEX = () => {
    onTriggerAnalysis({
      to: '0x388c818ca8b9251b393131c08a736a67ccb19297',
      chainId: currentChainId,
      data: '0x38ed1739',
      customTokenSymbol: 'USDT',
      customAmount: '5',
      customSlippage: 8.5,
      actionTitle: 'Swap 5 USDT → Unknown Token (Bad Price)',
    });
  };

  // Trigger Scenario 4: Safe Swap (Swap 1 USDT -> OKB)
  const handleLaunchDemoAgent = () => {
    onTriggerAnalysis({
      to: '0x388c818ca8b9251b393131c08a736a67ccb19297',
      chainId: currentChainId,
      data: '0x38ed1739',
      customTokenSymbol: 'USDT',
      customAmount: '1',
      customSlippage: 0.5,
      actionTitle: 'Swap 1 USDT → OKB (Safe Rate)',
    });
  };

  // Custom execution
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerAnalysis({
      to: customTo,
      chainId: currentChainId,
      data: customCalldata,
      customTokenSymbol: customToken,
      customAmount: customAmount,
      customSlippage: customSlippage,
      actionTitle: 'Custom Transaction Check',
    });
  };

  return (
    <div className="space-y-6 pb-16 sm:pb-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#10172a] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Interactive Safety Demos</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Click any scenario to see how AURA protects you from dangerous approvals and scams before you sign.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Flagship Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Demo 1: Dangerous Trap */}
        <div className="bg-[#10172a] border border-[#5e1c25] rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-[#852737] transition-all shadow-lg group">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#38141d] text-[#fca5a5] border border-[#671e2a]">
                Dangerous Trap
              </span>
              <span className="text-[10px] text-[#fca5a5] font-bold">High Risk</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Try Drainer Trap (demo only)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A fake website asks for permission to take all your USDT. See how AURA detects it and lets you limit it to a safe amount.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs font-mono font-semibold text-[#fca5a5]">Unlimited Risk</div>
            <button
              onClick={handleLaunchDemo1}
              className="px-3.5 py-2 rounded-xl bg-[#38141d] hover:bg-[#4a1824] text-[#fecdd3] border border-[#671e2a] text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#fca5a5]" />
              <span>Test This</span>
            </button>
          </div>
        </div>

        {/* Demo 2: Normal Transfer */}
        <div className="bg-[#10172a] border border-emerald-900/40 rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-emerald-700/60 transition-all shadow-lg group">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Safe Transfer
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">Low Risk</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Try Normal Transfer (1 USDT)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A standard 1 USDT transfer to a friend. AURA confirms the destination and ensures no dangerous permissions are given.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs font-mono font-semibold text-emerald-400">1 USDT</div>
            <button
              onClick={handleLaunchDemo2}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Test This</span>
            </button>
          </div>
        </div>

        {/* Demo 3: High Slippage Trap */}
        <div className="bg-[#10172a] border border-amber-900/40 rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-amber-700/60 transition-all shadow-lg group">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Bad Rate Warning
              </span>
              <span className="text-[10px] text-amber-400 font-bold">Price Warning</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Swap 5 USDT → Unknown Token
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A swap with an excessive 8.5% price difference that would lose you money on an unverified token.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs font-mono font-semibold text-amber-400">8.5% Loss</div>
            <button
              onClick={handleLaunchDemoDEX}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-amber-950/40 cursor-pointer"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Test This</span>
            </button>
          </div>
        </div>

        {/* Demo 4: Safe DEX Swap */}
        <div className="bg-[#10172a] border border-teal-900/40 rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-teal-700/60 transition-all shadow-lg group">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                Safe Swap
              </span>
              <span className="text-[10px] text-teal-400 font-bold">Verified</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Swap 1 USDT → OKB
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A 1 USDT swap routed through the official OKX DEX contract with verified fair pricing and low gas.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs font-mono font-semibold text-teal-400">0.5% Fair Rate</div>
            <button
              onClick={handleLaunchDemoAgent}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-teal-950/40 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Test This</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Transaction Checker */}
      <div className="bg-[#10172a] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2.5">
          <Code2 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Check Any Custom Transaction</h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Paste any contract address or transaction data to translate what it does into plain English.
        </p>

        <form onSubmit={handleCustomSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contract Address (To)</label>
              <input
                type="text"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1222] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                placeholder="0x..."
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Token Symbol</label>
              <input
                type="text"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1222] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                placeholder="USDT / USDC / OKB"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Transaction Data</label>
            <textarea
              value={customCalldata}
              onChange={(e) => setCustomCalldata(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1222] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              placeholder="0x095ea7b3..."
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              <span>Check Transaction Safety</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
