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
    { id: 'protect', label: 'Check Transaction', icon: ShieldCheck },
    { id: 'approvals', label: 'App Permissions', icon: Sliders, count: approvalCount },
    { id: 'agent', label: 'Safety Rules', icon: Bot, tag: 'Auto' },
    { id: 'history', label: 'History', icon: History },
    { id: 'alerts', label: 'Alerts', icon: Bell, count: alertCount },
    { id: 'sandbox', label: 'Simulator', icon: Zap },
  ];

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  return (
    <>
      {/* Top Main Navbar */}
      <header className="sticky top-0 z-40 bg-[#0b1222]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Brand Logo & Status */}
            <div
              className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer shrink-0 group"
              onClick={() => setActiveTab('overview')}
            >
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:border-emerald-400/70 transition-all duration-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0b1222] animate-pulse" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-white font-mono">
                    AURA
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono font-semibold px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                    X LAYER
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-300 font-mono">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                  <span>{isConnected ? 'Shield Active' : 'Ready to Protect'}</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center p-1 bg-slate-900/90 rounded-2xl border border-slate-800/80 shadow-inner">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-sm border border-slate-700 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{tab.label}</span>

                    {tab.tag && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                        {tab.tag}
                      </span>
                    )}

                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                          tab.id === 'alerts'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-[#4a1521] text-[#fca5a5] border border-[#671e2a]'
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
            <nav className="hidden lg:flex xl:hidden items-center p-1 bg-slate-900/90 rounded-2xl border border-slate-800/80">
              {navTabs.slice(0, 5).map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{tab.label.split(' ')[0]}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="text-[9px] px-1.5 rounded-full bg-[#4a1521] text-[#fca5a5] border border-[#671e2a] font-mono font-bold">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Bar: Chain Selector + Connect Wallet Button */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              {/* Chain Selector */}
              <div className="relative" ref={chainRef}>
                <button
                  onClick={() => setChainMenuOpen(!chainMenuOpen)}
                  className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-all cursor-pointer shadow-sm"
                >
                  <div className="relative flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="absolute w-3 h-3 rounded-full bg-emerald-400/30 animate-ping" />
                  </div>
                  <span className="hidden md:inline font-mono font-semibold">{currentChain.name}</span>
                  <span className="md:hidden font-mono font-bold text-[11px]">{currentChain.shortName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" />
                </button>

                {chainMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3.5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between font-mono">
                      <span>Select Network</span>
                      <span className="text-emerald-400">Verified</span>
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
                                ? 'bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20'
                                : 'text-slate-300 hover:bg-slate-800/80'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isXLayer ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-indigo-400'
                                }`}
                              />
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-medium">{chain.name}</span>
                                </div>
                              </div>
                            </div>
                            {chain.id === 1952 && (
                              <span className="text-[10px] text-emerald-400 font-medium">Default</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Wallet Button: Connect or Connected Pill - Placed fully inside header */}
              {!isConnected ? (
                <button
                  onClick={onOpenConnectModal}
                  className="py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 hover:brightness-105 active:scale-95 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center space-x-1.5 sm:space-x-2 transition-all shadow-md shadow-emerald-950/40 shrink-0 whitespace-nowrap cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 shrink-0" />
                  <span className="tracking-tight">Connect Wallet</span>
                </button>
              ) : (
                <div className="relative shrink-0" ref={walletRef}>
                  <button
                    onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                    className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs text-slate-200 transition-all cursor-pointer shadow-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                    <span className="font-mono font-medium">{truncatedAddress}</span>
                    <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {healthScore}% Safe
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {walletMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-3.5 z-50 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                            Connected Account
                          </div>
                          <div className="text-xs font-bold font-mono text-slate-100 mt-0.5">
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
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                          <div className="text-[10px] text-slate-400">Balance</div>
                          <div className="font-bold text-slate-200 mt-0.5 truncate">
                            {balanceFormatted} {balanceSymbol}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                          <div className="text-[10px] text-slate-400">Safety Score</div>
                          <div className="font-bold text-emerald-400 mt-0.5">
                            {healthScore}%
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-1 text-xs">
                        <button
                          onClick={handleCopyAddress}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800/80 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center space-x-2">
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                            <span>{copied ? 'Address Copied!' : 'Copy Address'}</span>
                          </span>
                        </button>

                        <a
                          href={`${currentChain.blockExplorerUrl}/address/${walletAddress}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800/80 transition-colors"
                        >
                          <span className="flex items-center space-x-2">
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            <span>View on OKLink Explorer</span>
                          </span>
                        </a>

                        <button
                          onClick={() => {
                            setWalletMenuOpen(false);
                            onDisconnect();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#fca5a5] hover:bg-[#38141d]/50 transition-colors font-medium cursor-pointer"
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

      {/* Mobile Bottom Navigation Bar: Evenly Spaced with Very Clear Active State */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b1222]/95 backdrop-blur-xl border-t border-slate-800/90 py-1 px-2 safe-area-pb shadow-xl shadow-black/60">
        <div className="grid grid-cols-5 gap-1 w-full max-w-md mx-auto items-center">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'protect', label: 'Check', icon: ShieldCheck },
            { id: 'agent', label: 'Rules', icon: Bot },
            { id: 'approvals', label: 'Permissions', icon: Sliders, count: approvalCount },
            { id: 'history', label: 'History', icon: History },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ef4444] ring-2 ring-[#0b1222]" />
                  )}
                </div>
                <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'font-bold text-emerald-300' : 'font-medium text-slate-400'}`}>
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
