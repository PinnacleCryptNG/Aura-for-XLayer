import React, { useState } from 'react';
import {
  X,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  QrCode,
  Smartphone,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { ChainConfig } from '../types';
import { XLAYER_PARAMS, switchOrAddEthereumChain } from '../lib/wallet';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (
    address: string,
    type: 'metamask' | 'okx' | 'walletconnect' | 'demo',
    chainId: number
  ) => void;
  currentChain: ChainConfig;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  currentChain,
}) => {
  const [activeTab, setActiveTab] = useState<'wallets' | 'walletconnect'>('wallets');
  const [connectingType, setConnectingType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Connect with browser extension (MetaMask or standard window.ethereum)
  const handleConnectMetaMask = async () => {
    setConnectingType('metamask');
    setErrorMessage(null);

    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // Request account
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts && accounts.length > 0) {
          const userAddress = accounts[0];

          // Switch or add current chain (X Layer)
          try {
            await switchOrAddEthereumChain(window.ethereum, currentChain.id);
          } catch (netErr) {
            console.warn('Network switch skipped/deferred:', netErr);
          }

          onConnect(userAddress, 'metamask', currentChain.id);
          onClose();
        } else {
          setErrorMessage('No accounts selected in MetaMask.');
        }
      } else {
        // Not installed fallback
        setErrorMessage('MetaMask extension not detected in browser. You can install it or use the Demo X Layer Sandbox.');
      }
    } catch (err: any) {
      console.error('MetaMask connection error:', err);
      setErrorMessage(err?.message || 'Connection was rejected by user.');
    } finally {
      setConnectingType(null);
    }
  };

  // Connect with OKX Wallet (Native to X Layer)
  const handleConnectOKX = async () => {
    setConnectingType('okx');
    setErrorMessage(null);

    try {
      const okxProvider = typeof window !== 'undefined' ? (window.okxwallet || window.ethereum) : null;
      if (okxProvider) {
        const accounts = await okxProvider.request({
          method: 'eth_requestAccounts',
        });

        if (accounts && accounts.length > 0) {
          const userAddress = accounts[0];
          try {
            await switchOrAddEthereumChain(okxProvider, currentChain.id);
          } catch (e) {
            console.warn(e);
          }
          onConnect(userAddress, 'okx', currentChain.id);
          onClose();
        } else {
          setErrorMessage('No accounts selected in OKX Wallet.');
        }
      } else {
        setErrorMessage('OKX Wallet extension not detected in browser. Please install OKX Wallet or test with the X Layer Sandbox.');
      }
    } catch (err: any) {
      console.error('OKX Wallet connection error:', err);
      setErrorMessage(err?.message || 'Connection was rejected by user.');
    } finally {
      setConnectingType(null);
    }
  };

  // WalletConnect simulation / mobile pairing
  const handleWalletConnectSimulate = (walletName: string) => {
    setConnectingType('walletconnect');
    setTimeout(() => {
      // Generated address for mobile pairing
      const randomAddr = '0x8F3b...4E29';
      onConnect('0x8F3b79D4eB8929b1390A7d1e89F23b7A8494E29', 'walletconnect', currentChain.id);
      onClose();
      setConnectingType(null);
    }, 1200);
  };

  // One-click Demo X Layer Sandbox
  const handleConnectDemo = () => {
    onConnect('0x71C26d15b090E6c8dF6FaB38A2D731a5472849b2', 'demo', currentChain.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Connect to AURA</h3>
              <p className="text-[11px] text-zinc-400">
                Active on <span className="text-cyan-400 font-medium">{currentChain.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Sub Navigation */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('wallets')}
              className={`py-1.5 px-3 rounded-lg font-medium transition-all ${
                activeTab === 'wallets'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Browser Wallets
            </button>
            <button
              onClick={() => setActiveTab('walletconnect')}
              className={`py-1.5 px-3 rounded-lg font-medium transition-all ${
                activeTab === 'walletconnect'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              WalletConnect / Mobile
            </button>
          </div>

          {activeTab === 'wallets' ? (
            <div className="space-y-2.5">
              {/* OKX Wallet (Highlighted for X Layer) */}
              <button
                onClick={handleConnectOKX}
                disabled={!!connectingType}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-900/80 hover:from-zinc-850 hover:to-zinc-800 border border-zinc-800 hover:border-cyan-500/50 flex items-center justify-between transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-black border border-zinc-700 flex items-center justify-center font-black text-white text-xs font-mono">
                    OKX
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-zinc-100 text-xs">OKX Wallet</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/20">
                        Native X Layer
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Direct integration with X Layer ecosystem
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* MetaMask */}
              <button
                onClick={handleConnectMetaMask}
                disabled={!!connectingType}
                className="w-full p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-xs">
                    🦊
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-zinc-100 text-xs">MetaMask</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Connect via browser extension or mobile app
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
              </button>

              {/* Hackathon Demo Account Option */}
              <div className="pt-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-zinc-500 uppercase font-mono tracking-wider">
                    Or Test Instantly
                  </span>
                  <div className="flex-grow border-t border-zinc-800"></div>
                </div>

                <button
                  onClick={handleConnectDemo}
                  className="w-full p-3 rounded-2xl bg-emerald-950/20 hover:bg-emerald-950/30 border border-emerald-800/40 hover:border-emerald-700/60 flex items-center justify-between transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-emerald-300 text-xs">
                          Launch Demo X Layer Sandbox
                        </span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                          Preloaded
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Test with simulated $12,480 portfolio & live drain traps
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* WalletConnect QR Card */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-center space-y-3">
                <div className="w-40 h-40 bg-zinc-950 border border-zinc-800 rounded-xl mx-auto flex flex-col items-center justify-center p-3 relative group">
                  <QrCode className="w-28 h-28 text-cyan-400" />
                  <div className="text-[10px] text-zinc-400 mt-1 font-mono">Scan with any Web3 Wallet</div>
                </div>

                <p className="text-[11px] text-zinc-400">
                  Scan this QR code with your mobile wallet app (OKX, MetaMask, Rainbow, Trust Wallet)
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {['OKX Mobile', 'Rainbow', 'Coinbase'].map((wallet) => (
                    <button
                      key={wallet}
                      onClick={() => handleWalletConnectSimulate(wallet)}
                      className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-300 font-medium transition-colors"
                    >
                      {wallet}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-900/40 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>AURA never asks for private keys or seed phrases</span>
          </div>
          <span className="font-mono text-zinc-400">Chain ID: {currentChain.id}</span>
        </div>
      </div>
    </div>
  );
};
