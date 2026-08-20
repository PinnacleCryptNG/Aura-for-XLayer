import React, { useState } from 'react';
import {
  Play,
  Shield,
  Zap,
  Sliders,
  ArrowRight,
  Code2,
  Lock,
  Layers,
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  Bot,
  Repeat,
} from 'lucide-react';
import { DEMO_CONTRACTS } from '../lib/constants';
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
  const [customType, setCustomType] = useState('UNLIMITED_APPROVAL');
  const [customToken, setCustomToken] = useState('USDT');
  const [customAmount, setCustomAmount] = useState('UNLIMITED');
  const [customSlippage, setCustomSlippage] = useState(0.5);
  const [customCalldata, setCustomCalldata] = useState(
    '0x095ea7b30000000000000000000000008391a27f69201f8449c239d1089201a4e8291a27ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
  );

  // Trigger Flagship Demo 1 (PRD §46)
  const handleLaunchDemo1 = () => {
    onTriggerAnalysis({
      to: '0x8391a27f69201f8449c239d1089201a4e8291a27',
      chainId: currentChainId,
      data: '0x095ea7b30000000000000000000000008391a27f69201f8449c239d1089201a4e8291a27ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      customTokenSymbol: 'USDT',
      customAmount: 'UNLIMITED',
      actionTitle: 'ExampleSwap Unlimited USDT Approval',
    });
  };

  // Trigger Flagship Demo 2 (PRD §47)
  const handleLaunchDemo2 = () => {
    onTriggerAnalysis({
      to: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
      chainId: currentChainId,
      data: '0xa9059cbb00000000000000000000000095222290dd7278aa3ddd389cc1e1d165cc4bafe50000000000000000000000000000000000000000000000000000000002faf080',
      customTokenSymbol: 'USDT',
      customAmount: '50',
      actionTitle: 'Standard 50 USDT Transfer',
    });
  };

  // Trigger Scenario 3: OKX DEX High-Slippage Frontrun Trap (Feature D)
  const handleLaunchDemoDEX = () => {
    onTriggerAnalysis({
      to: '0x388c818ca8b9251b393131c08a736a67ccb19297',
      chainId: currentChainId,
      data: '0x38ed1739',
      customTokenSymbol: 'USDT',
      customAmount: '1200',
      customSlippage: 8.5,
      actionTitle: 'OKX DEX Swap with 8.5% High Slippage',
    });
  };

  // Trigger Scenario 4: OnchainOS AI Agent Autonomous Trade (Feature A)
  const handleLaunchDemoAgent = () => {
    onTriggerAnalysis({
      to: '0x388c818ca8b9251b393131c08a736a67ccb19297',
      chainId: currentChainId,
      data: '0x38ed1739',
      customTokenSymbol: 'USDT',
      customAmount: '500',
      customSlippage: 0.5,
      actionTitle: 'OnchainOS Agent: OKX DEX Rebalance (500 USDT)',
    });
  };

  // Trigger Scenario 5: NFT Operator Approval
  const handleLaunchDemoNFT = () => {
    onTriggerAnalysis({
      to: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
      chainId: currentChainId,
      data: '0xa22cb4650000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d0000000000000000000000000000000000000000000000000000000000000001',
      actionTitle: 'NFT Operator Permission (setApprovalForAll)',
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
      actionTitle: `Custom ${customType}`,
    });
  };

  return (
    <div className="space-y-6 pb-16 sm:pb-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-zinc-100">Interactive dApp & Calldata Simulator</h2>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Test AURA’s pre-signing intelligence layer using X Layer scenario presets or raw Web3 calldata
        </p>
      </div>

      {/* 4 Flagship Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Demo 1: Unlimited Approval Trap */}
        <div className="bg-zinc-950 border border-rose-900/40 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-rose-800/80 transition-all shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Demo 1 • Trap
              </span>
              <span className="text-[10px] font-mono text-zinc-500">High Risk</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-100">
              Unverified DEX Unlimited USDT Drain
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              DApp requests unlimited access to your $8,420 USDT balance on unverified contract bytecode.
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
            <div className="text-[11px] font-mono text-rose-400">$8,420 Exposure</div>
            <button
              onClick={handleLaunchDemo1}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-rose-950/40 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Simulate</span>
            </button>
          </div>
        </div>

        {/* Demo 2: Normal Transfer */}
        <div className="bg-zinc-950 border border-emerald-900/40 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-emerald-800/80 transition-all shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Demo 2 • Safe
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Low Risk</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-100">
              Normal 50 USDT Personal Transfer
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Standard transfer to a known address on X Layer. No ongoing permissions granted.
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
            <div className="text-[11px] font-mono text-emerald-400">$50.00 Transfer</div>
            <button
              onClick={handleLaunchDemo2}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Simulate</span>
            </button>
          </div>
        </div>

        {/* Demo 3: OKX DEX High Slippage Interceptor */}
        <div className="bg-zinc-950 border border-amber-900/40 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-amber-800/80 transition-all shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Demo 3 • Slippage
              </span>
              <span className="text-[10px] font-mono text-zinc-500">DEX Attack</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-100">
              OKX DEX 8.5% High-Slippage Swap
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              DEX swap with excessive 8.5% slippage exposing user to sandwich attacks and MEV losses.
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
            <div className="text-[11px] font-mono text-amber-400">8.5% Slippage</div>
            <button
              onClick={handleLaunchDemoDEX}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-amber-950/40 cursor-pointer"
            >
              <Repeat className="w-3 h-3" />
              <span>Simulate</span>
            </button>
          </div>
        </div>

        {/* Demo 4: OnchainOS AI Agent Sentinel */}
        <div className="bg-zinc-950 border border-cyan-900/40 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-cyan-800/80 transition-all shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Demo 4 • Agent
              </span>
              <span className="text-[10px] font-mono text-cyan-400">OnchainOS</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-100">
              AI Agent Autonomous Rebalance
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              AI agent executing a 500 USDT swap verified by AURA's MCP deterministic policy engine.
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
            <div className="text-[11px] font-mono text-cyan-400">0.5% Slippage</div>
            <button
              onClick={handleLaunchDemoAgent}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-950/40 cursor-pointer"
            >
              <Bot className="w-3 h-3" />
              <span>Simulate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Raw Calldata Decoder Form */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-zinc-100">Custom Transaction Calldata Inspector</h3>
        </div>

        <form onSubmit={handleCustomSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 font-medium mb-1">Target Contract Address (To)</label>
              <input
                type="text"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                placeholder="0x..."
                required
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-medium mb-1">Token Symbol</label>
              <input
                type="text"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                placeholder="USDT / USDC / WOKB"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 font-medium mb-1">Transaction Calldata (Hex)</label>
            <textarea
              value={customCalldata}
              onChange={(e) => setCustomCalldata(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              placeholder="0x095ea7b3..."
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow"
            >
              <span>Analyze Calldata</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
