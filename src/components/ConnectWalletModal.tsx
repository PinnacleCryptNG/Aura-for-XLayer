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
        setErrorMessage('MetaMask extension not detected in browser. You can install it or try Sample Wallet Mode.');
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
        setErrorMessage('OKX Wallet extension not detected in browser. Please install OKX Wallet or test with Sample Wallet Mode.');
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
      onConnect('0x8F3b79D4eB8929b1390A7d1e89F23b7A8494E29', 'walletconnect', currentChain.id);
      onClose();
      setConnectingType(null);
    }, 1200);
  };

  // Quick Sample Wallet Connect
  const handleConnectDemo = () => {
    onConnect('0x71C26d15b090E6c8dF6FaB38A2D731a5472849b2', 'demo', currentChain.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#121a2d]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Connect Wallet</h3>
              <p className="text-xs text-slate-300">
                Network: <span className="text-emerald-400 font-medium">{currentChain.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-[#38141d] border border-[#671e2a] text-[#fca5a5] flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Sub Navigation */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0b1222] rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('wallets')}
              className={`py-2 px-3 rounded-lg font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'wallets'
                  ? 'bg-slate-800 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Browser Wallets
            </button>
            <button
              onClick={() => setActiveTab('walletconnect')}
              className={`py-2 px-3 rounded-lg font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'walletconnect'
                  ? 'bg-slate-800 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mobile / QR Code
            </button>
          </div>

          {activeTab === 'wallets' ? (
            <div className="space-y-3">
              {/* OKX Wallet (Highlighted for X Layer) */}
              <button
                onClick={handleConnectOKX}
                disabled={!!connectingType}
                className="w-full p-4 rounded-2xl bg-[#121a2d] hover:bg-[#18233c] border border-emerald-500/30 hover:border-emerald-500/60 flex items-center justify-between transition-all group text-left cursor-pointer shadow-md"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-black border border-emerald-500/40 flex items-center justify-center font-black text-white text-xs font-mono">
                    OKX
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-xs sm:text-sm">OKX Wallet</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 font-mono">
                        Recommended • Native X Layer
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Native X Layer support & instant network sync
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Informational Note for OKX Wallet users */}
              <div className="p-3 rounded-xl bg-[#0b1222] border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                💡 <strong className="text-white">Complementary Safety:</strong> OKX Wallet lets you manage approvals. AURA adds an extra real-time simulation layer to explain exactly what will happen in plain words before you sign.
              </div>

              {/* MetaMask */}
              <button
                onClick={handleConnectMetaMask}
                disabled={!!connectingType}
                className="w-full p-4 rounded-2xl bg-[#121a2d] hover:bg-[#18233c] border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-base">
                    🦊
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-white text-xs sm:text-sm">MetaMask</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        Auto Network Switch
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Connect browser extension with X Layer (Chain 196)
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </button>

              {/* Sample Wallet Mode */}
              <div className="pt-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                    Or Try With Sample Wallet
                  </span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <button
                  onClick={handleConnectDemo}
                  className="w-full p-3.5 rounded-2xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-800/40 hover:border-emerald-700/60 flex items-center justify-between transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-emerald-300 text-xs sm:text-sm">
                          Use Sample Wallet
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                          Safe Test
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Test safe mode with a sample wallet address
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
              <div className="p-4 bg-[#121a2d] border border-slate-800 rounded-2xl text-center space-y-3">
                <div className="w-40 h-40 bg-[#0b1222] border border-slate-800 rounded-xl mx-auto flex flex-col items-center justify-center p-3 relative group">
                  <QrCode className="w-28 h-28 text-emerald-400" />
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">Scan with any Web3 Wallet</div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Scan this QR code with your mobile wallet app (OKX, MetaMask, Rainbow, Trust Wallet)
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {['OKX Mobile', 'Rainbow', 'Coinbase'].map((wallet) => (
                    <button
                      key={wallet}
                      onClick={() => handleWalletConnectSimulate(wallet)}
                      className="p-2.5 rounded-xl bg-[#0b1222] border border-slate-800 hover:border-slate-700 text-xs text-slate-200 font-medium transition-colors cursor-pointer"
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
        <div className="p-4 bg-[#121a2d] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>We never ask for private keys or passwords</span>
          </div>
          <span className="font-mono text-slate-400">Chain ID: {currentChain.id}</span>
        </div>
      </div>
    </div>
  );
};
