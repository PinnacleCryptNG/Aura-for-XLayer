import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Wallet,
  ChevronDown,
  ExternalLink,
  Copy,
  LogOut,
  LayoutDashboard,
  Sliders,
  History,
  Bell,
  Zap,
  Check,
  Bot,
  Flame,
  Activity,
} from 'lucide-react';
import { SUPPORTED_CHAINS } from '../lib/constants';
import { ChainConfig } from '../types';

interface NavbarProps {
  currentChain: ChainConfig;
  onSelectChain: (chain: ChainConfig) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  walletAddress: string | null;
  isConnected: boolean;
  onOpenConnectModal: () => void;
  onDisconnect: () => void;
  isDemoWallet: boolean;
  healthScore: number;
  balanceFormatted?: string;
  balanceSymbol?: string;
  alertCount?: number;
  approvalCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentChain,
  onSelectChain,
  activeTab,
  setActiveTab,
  walletAddress,
  isConnected,
  onOpenConnectModal,
  onDisconnect,
  isDemoWallet,
  healthScore,
  balanceFormatted = '0.00',
  balanceSymbol = 'OKB',
  alertCount = 2,
  approvalCount = 4,
}) => {
  const [chainMenuOpen, setChainMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const chainRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chainRef.current && !chainRef.current.contains(event.target as Node)) {
        setChainMenuOpen(false);
      }
      if (walletRef.current && !walletRef.current.contains(event.target as Node)) {
        setWalletMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'protect', label: 'Sentinel Interceptor', icon: ShieldAlert },
    { id: 'agent', label: 'Agent Guardrails', icon: Bot, tag: 'MCP' },
    { id: 'approvals', label: 'Approvals', icon: Sliders, count: approvalCount },
    { id: 'history', label: 'Audit Log', icon: History },
    { id: 'alerts', label: 'Alerts', icon: Bell, count: alertCount },
    { id: 'sandbox', label: 'Simulator', icon: Zap },
  ];

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  return (
    <>
      {/* Top Main Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/70 shadow-lg shadow-black/20">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Brand Logo & Status */}
            <div
              className="flex items-center space-x-3 cursor-pointer shrink-0 group"
              onClick={() => setActiveTab('overview')}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-emerald-500/10 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:border-cyan-400/70 transition-all duration-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-zinc-950 animate-pulse" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-black tracking-tight text-white font-mono bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text">
                    AURA
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 shadow-inner">
                    X LAYER
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] text-zinc-400 font-mono">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                  <span>Sentinel Online</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800/80 shadow-inner">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/80 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-cyan-400' : 'text-zinc-500'
                      }`}
                    />
                    <span>{tab.label}</span>

                    {tab.tag && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                        {tab.tag}
                      </span>
                    )}

                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                          tab.id === 'alerts'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Medium Screens Navigation (lg to xl) */}
            <nav className="hidden lg:flex xl:hidden items-center p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800/80">
              {navTabs.slice(0, 5).map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-zinc-800 text-white border border-zinc-700/80 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-cyan-400' : 'text-zinc-500'
                      }`}
                    />
                    <span>{tab.label.split(' ')[0]}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="text-[9px] px-1.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Bar: Gas + Chain Selector + Wallet Button */}
            <div className="flex items-center space-x-2.5 shrink-0">
              {/* X Layer Sub-Cent Gas Badge (hidden on mobile) */}
              <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-[11px] font-mono text-zinc-400">
                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-zinc-300 font-semibold">&lt;$0.001</span>
                <span className="text-[9px] text-zinc-400">GAS</span>
              </div>

              {/* Chain Selector */}
              <div className="relative" ref={chainRef}>
                <button
                  onClick={() => setChainMenuOpen(!chainMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-200 transition-all cursor-pointer shadow-sm"
                >
                  <div className="relative flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="absolute w-3 h-3 rounded-full bg-cyan-400/30 animate-ping" />
                  </div>
                  <span className="hidden sm:inline font-mono font-semibold">{currentChain.name}</span>
                  <span className="sm:hidden font-mono font-bold text-[11px]">{currentChain.shortName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 transition-transform duration-200" />
                </button>

                {chainMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/90 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3.5 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/80 flex items-center justify-between font-mono">
                      <span>Supported Networks</span>
                      <span className="text-cyan-400">OKLink Audited</span>
                    </div>

                    <div className="p-1.5 space-y-1">
                      {SUPPORTED_CHAINS.map((chain) => {
                        const isSelected = currentChain.id === chain.id;
                        const isXLayer = chain.id === 196 || chain.id === 1952;
                        return (
                          <button
                            key={chain.id}
                            onClick={() => {
                              onSelectChain(chain);
                              setChainMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20'
                                : 'text-zinc-300 hover:bg-zinc-800/80'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isXLayer ? 'bg-cyan-400 shadow-sm shadow-cyan-400' : 'bg-indigo-400'
                                }`}
                              />
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-medium">{chain.name}</span>
                                  {chain.isTestnet && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                                      Testnet
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">ID {chain.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Wallet Button: Connect or Connected Pill */}
              {!isConnected ? (
                <button
                  onClick={onOpenConnectModal}
                  className="py-1.5 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-400 hover:from-emerald-400 hover:to-cyan-300 text-zinc-950 font-bold text-xs flex items-center space-x-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5 text-zinc-950" />
                  <span className="tracking-tight">Connect Wallet</span>
                </button>
              ) : (
                <div className="relative" ref={walletRef}>
                  <button
                    onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                    className="flex items-center space-x-2 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-200 transition-all cursor-pointer shadow-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                    <span className="font-mono font-medium">{truncatedAddress}</span>
                    <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {healthScore}/100
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  {walletMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-3.5 z-50 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-zinc-400 font-mono">
                            Connected Account
                          </div>
                          <div className="text-xs font-bold font-mono text-zinc-100 mt-0.5">
                            {walletAddress}
                          </div>
                        </div>
                        {isDemoWallet ? (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                            Demo
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                            Web3 Live
                          </span>
                        )}
                      </div>

                      {/* Balance & Score */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                          <div className="text-[10px] text-zinc-400">Balance</div>
                          <div className="font-bold text-zinc-200 mt-0.5 truncate">
                            {balanceFormatted} {balanceSymbol}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                          <div className="text-[10px] text-zinc-400">Health Rating</div>
                          <div className="font-bold text-emerald-400 mt-0.5">
                            {healthScore} / 100
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-1 text-xs">
                        <button
                          onClick={handleCopyAddress}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:bg-zinc-800/80 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center space-x-2">
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                            <span>{copied ? 'Address Copied!' : 'Copy Address'}</span>
                          </span>
                        </button>

                        <a
                          href={`${currentChain.blockExplorerUrl}/address/${walletAddress}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:bg-zinc-800/80 transition-colors"
                        >
                          <span className="flex items-center space-x-2">
                            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                            <span>View on OKLink Explorer</span>
                          </span>
                        </a>

                        <button
                          onClick={() => {
                            setWalletMenuOpen(false);
                            onDisconnect();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/30 transition-colors font-medium cursor-pointer"
                        >
                          <span className="flex items-center space-x-2">
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Disconnect Session</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 safe-area-pb shadow-lg shadow-black/50">
        <div className="flex items-center justify-around">
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'protect', label: 'Sentinel', icon: ShieldAlert },
            { id: 'agent', label: 'Agents', icon: Bot },
            { id: 'approvals', label: 'Approvals', icon: Sliders, count: approvalCount },
            { id: 'history', label: 'Audit', icon: History },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <IconComponent className="w-5 h-5" />
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
