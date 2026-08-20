import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Filter,
  RefreshCw,
  Clock,
  ExternalLink,
  Search,
  Zap,
  Radio,
  Shield,
} from 'lucide-react';
import { ApprovalItem } from '../types';
import { scanLiveXLayerAllowances } from '../lib/wallet';

interface ApprovalCentreProps {
  approvals: ApprovalItem[];
  onRevoke: (id: string) => void;
  onLimitApproval: (id: string, newAmount: string) => void;
  currentNetworkName: string;
  connectedWalletAddress?: string | null;
  chainId?: number;
  onAddLiveApprovals?: (scanned: ApprovalItem[]) => void;
}

export const ApprovalCentre: React.FC<ApprovalCentreProps> = ({
  approvals,
  onRevoke,
  onLimitApproval,
  currentNetworkName,
  connectedWalletAddress,
  chainId = 196,
  onAddLiveApprovals,
}) => {
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Live Scanner State
  const [scanAddressInput, setScanAddressInput] = useState<string>(connectedWalletAddress || '');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  // Sort high risk items to the very top
  const sortedApprovals = [...approvals].sort((a, b) => {
    const aRisk = a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL' ? 1 : 0;
    const bRisk = b.riskLevel === 'HIGH' || b.riskLevel === 'CRITICAL' ? 1 : 0;
    return bRisk - aRisk;
  });

  const filtered = sortedApprovals.filter((appr) => {
    if (filterRisk === 'HIGH') return appr.riskLevel === 'HIGH' || appr.riskLevel === 'CRITICAL';
    if (filterRisk === 'INACTIVE') return appr.lastUsedDaysAgo >= 90;
    if (filterRisk === 'UNLIMITED') return appr.isUnlimited;
    if (filterRisk === 'LIVE') return appr.isLiveScanned;
    return true;
  });

  const totalExposure = approvals.reduce((acc, a) => acc + a.potentialExposureUsd, 0);
  const highRiskCount = approvals.filter((a) => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL').length;
  const inactiveCount = approvals.filter((a) => a.lastUsedDaysAgo >= 90).length;
  const liveCount = approvals.filter((a) => a.isLiveScanned).length;

  const handleRevokeClick = (id: string) => {
    setRevokingId(id);
    setTimeout(() => {
      onRevoke(id);
      setRevokingId(null);
    }, 800);
  };

  const handleRunLiveScan = async (targetAddr?: string) => {
    const addressToScan = targetAddr || scanAddressInput.trim();
    if (!addressToScan || !addressToScan.startsWith('0x') || addressToScan.length < 10) {
      setScanFeedback('Please enter a valid 0x wallet address to scan.');
      return;
    }

    setIsScanning(true);
    setScanFeedback(null);

    try {
      const liveResults = await scanLiveXLayerAllowances(addressToScan, chainId);
      if (liveResults.length > 0 && onAddLiveApprovals) {
        onAddLiveApprovals(liveResults);
        setScanFeedback(`Found ${liveResults.length} active token permissions on X Layer.`);
      } else {
        setScanFeedback(`No dangerous permissions found for ${addressToScan.slice(0, 6)}...${addressToScan.slice(-4)}.`);
      }
    } catch (err) {
      setScanFeedback('Scan completed via X Layer.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden pb-16 sm:pb-6 animate-in fade-in duration-200">
      {/* Header & Stats Banner */}
      <div className="bg-[#10172a] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-white">App Permissions</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                {currentNetworkName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              These apps have permission to take tokens from your wallet. When an app has unlimited access, it can take all your tokens at any time. Limit or remove permissions you do not use.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="px-4 py-2.5 bg-[#0b1222] rounded-2xl border border-slate-800 text-left sm:text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Total at Risk</div>
              <div className="text-base sm:text-lg font-bold text-white font-mono">
                ${totalExposure.toLocaleString()}
              </div>
            </div>
            <div className="px-4 py-2.5 bg-[#2b1016] rounded-2xl border border-[#5e1c25] text-left sm:text-right">
              <div className="text-[10px] uppercase font-bold text-[#fca5a5] font-mono">Needs Action</div>
              <div className="text-base sm:text-lg font-bold text-[#fca5a5] font-mono">
                {highRiskCount} Dangerous
              </div>
            </div>
          </div>
        </div>

        {/* OKX Wallet complementary safety note */}
        <div className="p-3.5 rounded-2xl bg-[#0b1222] border border-slate-800/80 flex items-start space-x-3 text-xs text-slate-300">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Complementary Safety on X Layer:</span> While OKX Wallet provides built-in approval views, AURA provides pre-signing simulation and plain-English risk translation so you never grant dangerous allowances in the first place.
          </div>
        </div>
      </div>

      {/* Live Wallet Scanner */}
      <div className="bg-[#10172a] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold text-white">
              Scan Any Wallet for Permissions
            </h3>
          </div>
          <span className="text-[10px] text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40 font-mono">
            Live Check
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Enter any wallet address to check which apps have active permissions to spend USDT, USDC, OKB, and other tokens.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={scanAddressInput}
              onChange={(e) => setScanAddressInput(e.target.value)}
              placeholder="Enter wallet address (0x...)"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0b1222] border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            onClick={() => handleRunLiveScan()}
            disabled={isScanning}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-colors shadow-md shadow-emerald-950/40 cursor-pointer shrink-0"
          >
            {isScanning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5" />
            )}
            <span>{isScanning ? 'Checking Wallet...' : 'Scan Permissions'}</span>
          </button>
        </div>

        {/* Quick Test Addresses */}
        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400 pt-1">
          <span className="text-slate-500 text-[11px]">Quick Check:</span>
          {connectedWalletAddress && (
            <button
              onClick={() => {
                setScanAddressInput(connectedWalletAddress);
                handleRunLiveScan(connectedWalletAddress);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-[11px] cursor-pointer"
            >
              My Wallet
            </button>
          )}
          <button
            onClick={() => {
              const addr = '0x71C26d15b090E6c8dF6FaB38A2D731a5472849b2';
              setScanAddressInput(addr);
              handleRunLiveScan(addr);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
          >
            Sample Wallet #1
          </button>
          <button
            onClick={() => {
              const addr = '0x1034c444f24c30c3cc8078dbb4ff3465bbdff2d1';
              setScanAddressInput(addr);
              handleRunLiveScan(addr);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
          >
            Sample Wallet #2
          </button>
        </div>

        {scanFeedback && (
          <div className="p-3 rounded-xl bg-[#0b1222] border border-slate-800 text-xs sm:text-sm text-slate-200 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{scanFeedback}</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center space-x-1 text-xs text-slate-400 mr-1 shrink-0 font-mono">
          <Filter className="w-3.5 h-3.5" />
          <span>Show:</span>
        </div>
        {[
          { id: 'ALL', label: `All (${approvals.length})` },
          { id: 'HIGH', label: `Dangerous (${highRiskCount})` },
          { id: 'INACTIVE', label: `Not used in 90d (${inactiveCount})` },
          { id: 'UNLIMITED', label: 'Unlimited Only' },
          { id: 'LIVE', label: `Live Scanned (${liveCount})` },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterRisk(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              filterRisk === f.id
                ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-[#10172a] hover:bg-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Approvals Table / Grid */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-[#10172a] border border-slate-800 rounded-3xl space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-200">No permissions found in this category</p>
            <p className="text-xs text-slate-400">Your wallet is clean and protected.</p>
          </div>
        ) : (
          filtered.map((appr) => {
            const isHighRisk = appr.riskLevel === 'HIGH' || appr.riskLevel === 'CRITICAL';
            const oklinkUrl =
              appr.oklinkExplorerUrl || `https://www.okx.com/web3/explorer/xlayer/address/${appr.spenderAddress}`;

            return (
              <div
                key={appr.id}
                className={`p-5 rounded-3xl border transition-all shadow-sm ${
                  isHighRisk
                    ? 'bg-[#10172a] border-[#5e1c25] hover:border-[#852737]'
                    : 'bg-[#10172a] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Token & Spender Info */}
                  <div className="flex items-start space-x-4">
                    <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0 font-mono">
                      {appr.tokenSymbol}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-bold text-white text-sm sm:text-base">{appr.tokenSymbol}</span>
                        <span className="text-slate-400 text-xs sm:text-sm">• {appr.tokenName}</span>
                        <span
                          className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                            isHighRisk
                              ? 'bg-[#38141d] text-[#fca5a5] border border-[#671e2a]'
                              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          }`}
                        >
                          {isHighRisk ? 'DANGEROUS' : 'SAFE'}
                        </span>
                        {appr.isLiveScanned && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            ON-CHAIN
                          </span>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-[#f5f1eb]">{appr.spenderName}</span>
                        <a
                          href={oklinkUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-mono text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1"
                        >
                          <span>({appr.spenderAddress.slice(0, 6)}...{appr.spenderAddress.slice(-4)})</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {isHighRisk ? (
                        <p className="text-xs sm:text-sm text-[#fca5a5] pt-0.5 leading-relaxed">
                          ⚠️ This app can take all your {appr.tokenSymbol}. We recommend limiting it or removing access.
                        </p>
                      ) : (
                        <div className="flex items-center space-x-2 text-xs text-slate-400 pt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Last active {appr.lastUsedDaysAgo} days ago</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Permission Amount & Action Buttons */}
                  <div className="flex items-center justify-between lg:justify-end space-x-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="text-left lg:text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Current Allowance</div>
                      <div
                        className={`text-sm sm:text-base font-bold font-mono mt-0.5 ${
                          appr.isUnlimited ? 'text-[#fca5a5]' : 'text-white'
                        }`}
                      >
                        {appr.isUnlimited ? 'Unlimited (All Funds)' : appr.allowanceFormatted}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        ${appr.potentialExposureUsd.toLocaleString()} at risk
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 shrink-0">
                      {appr.isUnlimited && (
                        <button
                          onClick={() => onLimitApproval(appr.id, '1')}
                          title="Limit to safe 1 USDT cap"
                          className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-950/40 cursor-pointer flex items-center space-x-1"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Limit to 1 USDT</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleRevokeClick(appr.id)}
                        disabled={revokingId === appr.id}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-[#38141d] hover:text-[#fca5a5] text-slate-200 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-all border border-slate-700 hover:border-[#671e2a] cursor-pointer disabled:opacity-50"
                      >
                        {revokingId === appr.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Remove Access</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
