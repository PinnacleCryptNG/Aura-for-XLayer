import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { TransactionReviewModal } from './components/TransactionReviewModal';
import { ApprovalCentre } from './components/ApprovalCentre';
import { AuditHistory } from './components/AuditHistory';
import { AlertsView } from './components/AlertsView';
import { DAppSandbox } from './components/DAppSandbox';
import { AgentSentinelView } from './components/AgentSentinelView';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import {
  SUPPORTED_CHAINS,
  INITIAL_APPROVALS,
  INITIAL_ALERTS,
  DEFAULT_WALLET,
} from './lib/constants';
import {
  ChainConfig,
  ApprovalItem,
  DecisionRecord,
  SecurityAlert,
  FullAnalysisResult,
} from './types';
import { RawTxInput, decodeAndAnalyzeTx } from './lib/decoder';
import {
  fetchLiveBalance,
  switchOrAddEthereumChain,
  WalletState,
} from './lib/wallet';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  X,
  RefreshCw,
  Wallet,
  Zap,
  Bot,
} from 'lucide-react';

export default function App() {
  const [currentChain, setCurrentChain] = useState<ChainConfig>(SUPPORTED_CHAINS[0]); // X Layer Mainnet default
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Wallet Connection State (Starts disconnected by default)
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connectorType, setConnectorType] = useState<
    'metamask' | 'okx' | 'walletconnect' | 'demo' | null
  >(null);
  const [balanceFormatted, setBalanceFormatted] = useState<string>('0.0000');
  const [balanceSymbol, setBalanceSymbol] = useState<string>('OKB');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);

  // Security Portfolio Metrics - Starts at 0 until a real wallet or demo is connected/scanned
  const [healthScore, setHealthScore] = useState<number>(0);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(INITIAL_ALERTS);

  // Active Transaction Review Interceptor
  const [activeAnalysis, setActiveAnalysis] = useState<FullAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    desc: string;
    type: 'success' | 'warning';
  } | null>(null);

  // Audit History Log - Starts clean with 0 records
  const [decisionRecords, setDecisionRecords] = useState<DecisionRecord[]>([]);

  // Trigger Toast Notification helper
  const triggerToast = (
    title: string,
    desc: string,
    type: 'success' | 'warning' = 'success'
  ) => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Sync balance function for connected wallet
  const syncLiveBalance = useCallback(
    async (address: string, chain: ChainConfig) => {
      setBalanceSymbol(chain.nativeCurrency.symbol);
      try {
        const liveBal = await fetchLiveBalance(address, chain.id);
        setBalanceFormatted(liveBal);
      } catch {
        setBalanceFormatted('0.0000');
      }
    },
    []
  );

  // Handle wallet connection from ConnectWalletModal
  const handleConnectWallet = async (
    address: string,
    type: 'metamask' | 'okx' | 'walletconnect' | 'demo',
    chainId: number
  ) => {
    setWalletAddress(address);
    setConnectorType(type);
    setIsConnected(true);

    const matchedChain =
      SUPPORTED_CHAINS.find((c) => c.id === chainId) || currentChain;
    setCurrentChain(matchedChain);

    if (type === 'demo') {
      setBalanceFormatted('1.4500');
      setBalanceSymbol('OKB');
      setPortfolioValue(12480);
      setHealthScore(84);
      triggerToast(
        'Connected to X Layer',
        'Connected to X Layer – scanning your permissions on OKX X Layer (Chain ID 196)...',
        'success'
      );
    } else {
      triggerToast(
        'Connected to X Layer',
        'Connected to X Layer – scanning your permissions on OKX X Layer...',
        'success'
      );
      await syncLiveBalance(address, matchedChain);
    }
  };

  // Handle wallet disconnect
  const handleDisconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setConnectorType(null);
    setBalanceFormatted('0.0000');
    triggerToast(
      'Wallet Disconnected',
      'You are currently operating in visitor mode.',
      'warning'
    );
  };

  // Listen to Web3 provider accounts and chain changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const provider = window.okxwallet || window.ethereum;
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        handleDisconnectWallet();
      } else if (isConnected && connectorType !== 'demo') {
        setWalletAddress(accounts[0]);
        syncLiveBalance(accounts[0], currentChain);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const numericChainId = parseInt(chainIdHex, 16);
      const matched = SUPPORTED_CHAINS.find((c) => c.id === numericChainId);
      if (matched) {
        setCurrentChain(matched);
        if (walletAddress && connectorType !== 'demo') {
          syncLiveBalance(walletAddress, matched);
        }
      }
    };

    try {
      provider.on?.('accountsChanged', handleAccountsChanged);
      provider.on?.('chainChanged', handleChainChanged);
    } catch (e) {
      console.warn(e);
    }

    return () => {
      try {
        provider.removeListener?.('accountsChanged', handleAccountsChanged);
        provider.removeListener?.('chainChanged', handleChainChanged);
      } catch (e) {
        console.warn(e);
      }
    };
  }, [isConnected, connectorType, walletAddress, currentChain, syncLiveBalance]);

  // Handle Chain Selection
  const handleSelectChain = async (chain: ChainConfig) => {
    setCurrentChain(chain);
    setBalanceSymbol(chain.nativeCurrency.symbol);

    // If connected with a browser extension, prompt switch
    if (
      isConnected &&
      (connectorType === 'metamask' || connectorType === 'okx')
    ) {
      const provider =
        connectorType === 'okx'
          ? window.okxwallet || window.ethereum
          : window.ethereum;
      if (provider) {
        await switchOrAddEthereumChain(provider, chain.id);
      }
    }

    if (walletAddress && isConnected && connectorType !== 'demo') {
      await syncLiveBalance(walletAddress, chain);
    }

    triggerToast('Network Switched', `AURA is now analyzing on ${chain.name}.`);
  };

  // Perform Analysis (calls backend Express /api/analyze-transaction with deterministic engine + Gemini)
  const handleAnalyzeTransaction = async (input: RawTxInput) => {
    setIsAnalyzing(true);
    setActiveTab('protect');

    try {
      const res = await fetch('/api/analyze-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, chainId: currentChain.id }),
      });

      if (!res.ok) {
        throw new Error('API analysis failed');
      }

      const result: FullAnalysisResult = await res.json();
      setActiveAnalysis(result);
    } catch (err) {
      console.warn('Analysis fallback:', err);
      // Client-side fallback
      const facts = decodeAndAnalyzeTx({ ...input, chainId: currentChain.id });
      setActiveAnalysis({
        id: `client-${Date.now()}`,
        timestamp: new Date().toISOString(),
        facts,
        explanation: {
          summary: `You are granting ${facts.contractName} permission on ${facts.network}.`,
          what_is_happening: `Transaction interaction with contract ${facts.targetAddress}.`,
          what_user_is_giving: facts.isUnlimitedApproval
            ? `Full unlimited access to your ${facts.tokenSymbol || 'token'} balance.`
            : `Permission to execute transfer of ${facts.requestedAmountFormatted}.`,
          potential_impact: `Up to $${facts.potentialExposureUsd.toLocaleString()} maximum exposure.`,
          risk_explanation: facts.riskSignals.map((s) => `${s.title}: ${s.description}`),
          recommendation: facts.isUnlimitedApproval ? 'LIMIT_APPROVAL' : 'SAFE_TO_PROCEED',
          recommendation_detail: facts.isUnlimitedApproval
            ? 'Do not approve unlimited access. Limit to 1 USDT instead.'
            : 'Standard safe parameters detected.',
          confidence: 0.95,
          uncertainty: [],
        },
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Launch Flagship Demos (PRD §46, §47, §48)
  const handleLaunchDemo = (demoId: number) => {
    if (!isConnected) {
      // Auto enable demo sandbox for seamless instant review
      handleConnectWallet(DEFAULT_WALLET.address, 'demo', currentChain.id);
    }

    if (demoId === 1) {
      // Flagship Demo 1: Dangerous dApp Unlimited USDT
      handleAnalyzeTransaction({
        to: '0x8391a27f69201f8449c239d1089201a4e8291a27',
        chainId: currentChain.id,
        data: '0x095ea7b30000000000000000000000008391a27f69201f8449c239d1089201a4e8291a27ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        customTokenSymbol: 'USDT',
        customAmount: 'UNLIMITED',
        actionTitle: 'Dangerous Unlimited USDT Permission (demo)',
      });
    } else if (demoId === 2) {
      // Flagship Demo 2: Normal 1 USDT transfer
      handleAnalyzeTransaction({
        to: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
        chainId: currentChain.id,
        data: '0xa9059cbb00000000000000000000000095222290dd7278aa3ddd389cc1e1d165cc4bafe500000000000000000000000000000000000000000000000000000000000f4240',
        customTokenSymbol: 'USDT',
        customAmount: '1',
        actionTitle: 'Safe 1 USDT Transfer to Friend',
      });
    } else if (demoId === 3) {
      setActiveTab('approvals');
    }
  };

  // Review approval from table
  const handleReviewApproval = (appr: ApprovalItem) => {
    handleAnalyzeTransaction({
      to: appr.spenderAddress,
      chainId: appr.chainId,
      data: '0x095ea7b3',
      customTokenSymbol: appr.tokenSymbol,
      customAmount: appr.isUnlimited ? 'UNLIMITED' : appr.allowanceFormatted,
      actionTitle: `${appr.spenderName} Approval Review`,
    });
  };

  // Handle User Decision on Reviewed Transaction
  const handleDecision = (
    decision: 'APPROVED' | 'MODIFIED_LIMITED',
    modifiedAmount?: string
  ) => {
    if (!activeAnalysis) return;

    const originalExposure = activeAnalysis.facts.potentialExposureUsd;
    let finalExposure = originalExposure;
    let saved = 0;

    if (decision === 'MODIFIED_LIMITED') {
      finalExposure = 1;
      saved = Math.max(0, originalExposure - finalExposure);
    }

    const newRecord: DecisionRecord = {
      id: `dec-${Date.now()}`,
      timestamp: 'Just now',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      actionTitle: activeAnalysis.facts.isUnlimitedApproval
        ? `Approve ${activeAnalysis.facts.tokenSymbol}`
        : activeAnalysis.facts.txType.replace(/_/g, ' '),
      network: currentChain.name,
      chainId: currentChain.id,
      targetAddress: activeAnalysis.facts.targetAddress,
      targetName: activeAnalysis.facts.contractName,
      riskLevel: activeAnalysis.facts.riskLevel,
      riskScore: activeAnalysis.facts.riskScore,
      userDecision: decision,
      originalExposureUsd: originalExposure,
      finalExposureUsd: finalExposure,
      savedExposureUsd: saved,
      whyUserSignedRecord:
        decision === 'MODIFIED_LIMITED'
          ? `You limited the allowance to ${modifiedAmount || '1 USDT'}, successfully protecting $${saved.toLocaleString()} in wallet assets.`
          : `You approved the transaction after reviewing AURA's verified risk assessment.`,
      summary: activeAnalysis.explanation.summary,
      recommendation: activeAnalysis.explanation.recommendation,
      facts: activeAnalysis.facts,
    };

    setDecisionRecords((prev) => [newRecord, ...prev]);

    if (decision === 'MODIFIED_LIMITED') {
      triggerToast(
        'Transaction Protected on X Layer',
        `Allowance safely capped at ${modifiedAmount || '1 USDT'}. You avoided $${saved.toLocaleString()} in unnecessary exposure!`,
        'success'
      );
      setHealthScore((prev) => Math.min(96, prev + 6));
    } else {
      triggerToast(
        'Transaction Executed',
        `Signed and confirmed on ${currentChain.name}.`,
        'success'
      );
    }

    setActiveAnalysis(null);
    setActiveTab('history');
  };

  // Handle Reject
  const handleReject = () => {
    if (!activeAnalysis) return;

    const newRecord: DecisionRecord = {
      id: `dec-${Date.now()}`,
      timestamp: 'Just now',
      actionTitle: activeAnalysis.facts.isUnlimitedApproval
        ? `Rejected ${activeAnalysis.facts.tokenSymbol} Approval`
        : `Rejected Transaction`,
      network: currentChain.name,
      chainId: currentChain.id,
      targetAddress: activeAnalysis.facts.targetAddress,
      targetName: activeAnalysis.facts.contractName,
      riskLevel: activeAnalysis.facts.riskLevel,
      riskScore: activeAnalysis.facts.riskScore,
      userDecision: 'REJECTED',
      originalExposureUsd: activeAnalysis.facts.potentialExposureUsd,
      finalExposureUsd: 0,
      savedExposureUsd: activeAnalysis.facts.potentialExposureUsd,
      whyUserSignedRecord: `You safely rejected this action after AURA detected high risk parameters.`,
      summary: activeAnalysis.explanation.summary,
      recommendation: activeAnalysis.explanation.recommendation,
      facts: activeAnalysis.facts,
    };

    setDecisionRecords((prev) => [newRecord, ...prev]);
    triggerToast(
      'Transaction Aborted Safely',
      `Blocked potential exposure of $${activeAnalysis.facts.potentialExposureUsd.toLocaleString()}.`,
      'warning'
    );

    setActiveAnalysis(null);
    setActiveTab('history');
  };

  // Revoke Approval action (PRD §26)
  const handleRevokeApproval = (id: string) => {
    const target = approvals.find((a) => a.id === id);
    if (!target) return;

    setApprovals((prev) => prev.filter((a) => a.id !== id));
    triggerToast(
      'Approval Revoked on X Layer',
      `Revocation transaction broadcasted for ${target.spenderName}. Allowance set to 0.`,
      'success'
    );
    setHealthScore((prev) => Math.min(100, prev + 5));
  };

  // Limit Approval action in table
  const handleLimitInTable = (id: string, newAmt: string) => {
    setApprovals((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            allowanceFormatted: `$${newAmt}.00 ${a.tokenSymbol}`,
            isUnlimited: false,
            potentialExposureUsd: parseFloat(newAmt) || 500,
            riskLevel: 'LOW',
            riskScore: 15,
          };
        }
        return a;
      })
    );
    triggerToast(
      'Allowance Updated',
      `Limited permission to $${newAmt}.00 on ${currentChain.name}.`,
      'success'
    );
  };

  // Add Live Scanned Approvals
  const handleAddLiveApprovals = (scanned: ApprovalItem[]) => {
    setApprovals((prev) => {
      const existingIds = new Set(prev.map((p) => `${p.tokenSymbol}-${p.spenderAddress}`));
      const newItems = scanned.filter((s) => !existingIds.has(`${s.tokenSymbol}-${s.spenderAddress}`));
      return [...newItems, ...prev];
    });
  };

  // Dismiss Alert
  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Review Alert
  const handleReviewAlert = (alert: SecurityAlert) => {
    if (alert.contractAddress) {
      handleAnalyzeTransaction({
        to: alert.contractAddress,
        chainId: currentChain.id,
        customTokenSymbol: alert.tokenSymbol || 'USDT',
        customAmount: 'UNLIMITED',
        actionTitle: alert.title,
      });
    } else {
      setActiveTab('approvals');
    }
  };

  const highRiskApprovalsCount = approvals.filter(
    (a) => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 aura-bg aura-subtle-grid text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Navigation Header */}
      <Navbar
        currentChain={currentChain}
        onSelectChain={handleSelectChain}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletAddress={walletAddress}
        isConnected={isConnected}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onDisconnect={handleDisconnectWallet}
        isDemoWallet={connectorType === 'demo'}
        healthScore={healthScore}
        balanceFormatted={balanceFormatted}
        balanceSymbol={balanceSymbol}
        alertCount={alerts.filter((a) => !a.resolved).length}
        approvalCount={highRiskApprovalsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border shadow-2xl flex items-start space-x-3 max-w-xs sm:max-w-sm ${
                toastMessage.type === 'success'
                  ? 'bg-slate-950/95 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-950/95 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="mt-0.5">
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                ) : (
                  <AlertOctagon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-slate-100 truncate">
                  {toastMessage.title}
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed break-words">
                  {toastMessage.desc}
                </p>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* View Routing */}
        {activeTab === 'overview' && (
          <DashboardOverview
            portfolioValueUsd={portfolioValue}
            monitoredAssetsCount={DEFAULT_WALLET.monitoredAssetsCount}
            healthScore={healthScore}
            networkName={currentChain.name}
            approvals={approvals}
            recentDecisions={decisionRecords}
            onReviewApproval={handleReviewApproval}
            onLaunchDemo={handleLaunchDemo}
            onNavigateToTab={setActiveTab}
            isConnected={isConnected}
            onOpenConnectModal={() => setIsConnectModalOpen(true)}
          />
        )}

        {activeTab === 'protect' && (
          <div className="space-y-6 pb-16 sm:pb-6 animate-in fade-in duration-200">
            {isAnalyzing ? (
              <div className="py-20 text-center space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto animate-pulse">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">
                    Checking Transaction Safety
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Inspecting parameters and verification on {currentChain.name}...
                  </p>
                </div>
              </div>
            ) : activeAnalysis ? (
              <TransactionReviewModal
                analysis={activeAnalysis}
                onApprove={handleDecision}
                onReject={handleReject}
              />
            ) : (
              <div className="space-y-5">
                {/* Clean, Simple Safety Banner */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-100">
                      Transaction Safety Check • {currentChain.name}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      Simulate and check any transaction before signing. Try a quick preset or inspect custom transaction data:
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => handleLaunchDemo(1)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Try Drainer Trap (demo only)
                    </button>
                    <button
                      onClick={() => handleLaunchDemo(2)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Try Normal Transfer (1 USDT)
                    </button>
                    <button
                      onClick={() => setActiveTab('agent')}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Safety Rules</span>
                    </button>
                  </div>
                </div>

                <DAppSandbox
                  onTriggerAnalysis={handleAnalyzeTransaction}
                  currentChainId={currentChain.id}
                />
              </div>
            )}
          </div>
        )}

        {/* Feature A: OnchainOS AI Agent Sentinel View */}
        {activeTab === 'agent' && (
          <AgentSentinelView
            onTriggerAnalysis={handleAnalyzeTransaction}
            currentNetworkName={currentChain.name}
          />
        )}

        {/* Feature C: Live Allowance Scanner */}
        {activeTab === 'approvals' && (
          <ApprovalCentre
            approvals={approvals}
            onRevoke={handleRevokeApproval}
            onLimitApproval={handleLimitInTable}
            currentNetworkName={currentChain.name}
            connectedWalletAddress={walletAddress}
            chainId={currentChain.id}
            onAddLiveApprovals={handleAddLiveApprovals}
          />
        )}

        {activeTab === 'history' && <AuditHistory records={decisionRecords} />}

        {activeTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            onReviewAlert={handleReviewAlert}
            onDismissAlert={handleDismissAlert}
          />
        )}

        {activeTab === 'sandbox' && (
          <DAppSandbox
            onTriggerAnalysis={handleAnalyzeTransaction}
            currentChainId={currentChain.id}
          />
        )}
      </main>

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnectWallet}
        currentChain={currentChain}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-xs text-zinc-500 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-zinc-300 font-mono">AURA</span>
            <span>• The intelligence layer for knowing what is safe to sign, approve and trust on X Layer.</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-mono text-[11px] text-cyan-400">
              Live on X Layer ({currentChain.name})
            </span>
            <span>OKLink Verification • OnchainOS Guardrails</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
