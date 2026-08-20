import {
  DeterministicFacts,
  RiskLevel,
  RiskSignal,
  ContractStatus,
  OklinkMetadata,
  SwapDetails,
  GasSavingsMetrics,
  AgentPolicyCompliance,
} from '../types';
import { DEMO_CONTRACTS, DEFAULT_WALLET } from './constants';

export interface RawTxInput {
  from?: string;
  to: string;
  value?: string; // in wei or ether string
  data?: string; // hex calldata
  chainId?: number;
  customTokenSymbol?: string;
  customTokenDecimals?: number;
  customAmount?: string;
  actionTitle?: string;
  agentName?: string;
  customSlippage?: number;
}

export function decodeAndAnalyzeTx(input: RawTxInput): DeterministicFacts {
  const chainId = input.chainId || 196;
  const isXLayer = chainId === 196 || chainId === 1952;
  const network =
    chainId === 196
      ? 'X Layer Mainnet'
      : chainId === 1952
      ? 'X Layer Testnet'
      : chainId === 1
      ? 'Ethereum Mainnet'
      : 'Sepolia';

  const fromAddress = input.from || DEFAULT_WALLET.fullAddress;
  const targetAddress = (input.to || '').toLowerCase();
  const data = (input.data || '0x').trim();
  const valueWei = input.value || '0';

  // Check known contracts dictionary or generate fallback
  const baseContractMeta = DEMO_CONTRACTS[targetAddress] || {
    address: targetAddress,
    name:
      targetAddress.length > 10
        ? `${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}`
        : 'Unknown Target',
    status: 'UNKNOWN' as ContractStatus,
    verified: false,
    ageDays: 1,
    interactionCount: 3,
    reputationScore: 25,
    category: 'Unverified Contract',
  };

  // Build OKLink Explorer Metadata
  const explorerBase =
    chainId === 196
      ? 'https://www.oklink.com/xlayer'
      : chainId === 1952
      ? 'https://www.oklink.com/xlayer-test'
      : 'https://etherscan.io';

  const oklinkMeta: OklinkMetadata = {
    verified: baseContractMeta.verified,
    contractAddress: targetAddress,
    contractName: baseContractMeta.name,
    compilerVersion: baseContractMeta.verified ? 'v0.8.24+commit.e11b9ed9' : 'None (Unverified)',
    creatorAddress: baseContractMeta.verified
      ? '0x1034c444f24c30c3cc8078dbb4ff3465bbdff2d1'
      : '0x0000000000000000000000000000000000000000',
    txCount: baseContractMeta.interactionCount,
    explorerUrl: `${explorerBase}/address/${targetAddress}`,
    verifiedAt: baseContractMeta.verified ? '2025-10-12 (Audited & Verified)' : undefined,
    hasAudit: baseContractMeta.verified,
    isOpenSource: baseContractMeta.verified,
    reputationTag: baseContractMeta.verified
      ? 'Official Verified'
      : baseContractMeta.status === 'SUSPICIOUS'
      ? 'Community Verified'
      : 'Unverified Bytecode',
  };

  let txType = 'CONTRACT_INTERACTION' as any;
  let tokenSymbol = input.customTokenSymbol || 'USDT';
  let tokenAddress = targetAddress;
  let requestedAmountRaw = '0';
  let requestedAmountFormatted = '$0.00';
  let isUnlimitedApproval = false;
  let walletAssetBalance = 8420;
  let walletAssetUsdValue = 8420;
  let potentialExposureUsd = 0;
  let simulationSuccess = true;
  let simulationAssetDeltas: DeterministicFacts['simulationAssetDeltas'] = [];
  let simulationError: string | undefined = undefined;
  let swapDetails: SwapDetails | undefined = undefined;

  // Calldata inspection
  const selector = data.slice(0, 10).toLowerCase();

  // 1. ERC20 approve(address,uint256) -> 0x095ea7b3
  if (selector === '0x095ea7b3' || data.startsWith('0x095ea7b3')) {
    txType = 'TOKEN_APPROVAL';
    tokenAddress = targetAddress;
    const spenderHex =
      data.length >= 74
        ? '0x' + data.slice(34, 74)
        : '0x8391a27f69201f8449c239d1089201a4e8291a27';
    const amountHex = data.length >= 138 ? data.slice(74, 138) : '';

    // Check if unlimited
    if (
      amountHex.startsWith('ffffffff') ||
      amountHex.includes('fffff') ||
      input.customAmount === 'UNLIMITED' ||
      !amountHex
    ) {
      isUnlimitedApproval = true;
      txType = 'UNLIMITED_APPROVAL';
      requestedAmountRaw =
        '115792089237316195423570985008687907853269984665640564039457584007913129639935';
      requestedAmountFormatted = 'Unlimited';
      potentialExposureUsd = walletAssetUsdValue; // Whole balance at risk
    } else {
      isUnlimitedApproval = false;
      const parsedNum = parseInt(amountHex || '0', 16) / 1e6 || 500;
      requestedAmountFormatted = `$${parsedNum.toLocaleString()} ${tokenSymbol}`;
      potentialExposureUsd = parsedNum;
    }

    simulationAssetDeltas = [
      {
        asset: tokenSymbol,
        delta: isUnlimitedApproval
          ? 'Full Balance Access Granted'
          : `Up to ${requestedAmountFormatted}`,
        isDrain: isUnlimitedApproval,
        to: spenderHex,
      },
    ];
  }
  // 2. DEX Swap Selectors (swapExactTokensForTokens 0x38ed1739, exactInputSingle 0x415565b0, swap 0x128acb08)
  else if (
    selector === '0x38ed1739' ||
    selector === '0x415565b0' ||
    selector === '0x128acb08' ||
    input.actionTitle?.toLowerCase().includes('swap') ||
    input.customSlippage !== undefined
  ) {
    txType = 'DEX_SWAP';
    const slippage = input.customSlippage !== undefined ? input.customSlippage : 12.5; // High slippage demo trap default or user set
    const inputAmt = '1,000.00 USDT';
    const inputUsd = 1000;
    const expectedOut = '17.24 OKB';
    const minOut = slippage > 5 ? '15.08 OKB (-12.5% max slippage)' : '17.15 OKB (-0.5% max slippage)';
    const outUsd = 1000;

    potentialExposureUsd = inputUsd;
    requestedAmountFormatted = `Swap 1,000 USDT for ~17.24 OKB`;

    swapDetails = {
      inputTokenSymbol: 'USDT',
      inputTokenAmount: '1,000.00',
      inputTokenUsd: inputUsd,
      outputTokenSymbol: 'OKB',
      expectedOutputAmount: expectedOut,
      minimumReceivedAmount: minOut,
      outputTokenUsd: outUsd,
      slippageTolerancePercent: slippage,
      priceImpactPercent: slippage > 5 ? 4.8 : 0.12,
      isHighSlippage: slippage > 3.0,
      isHoneypotRisk: slippage > 10.0,
      routerName: 'OKX DEX Smart Aggregator',
      routerAddress: targetAddress || '0x388c818ca8b9251b393131c08a736a67ccb19297',
      mevProtection: true,
      okxDexOptimized: true,
    };

    simulationAssetDeltas = [
      {
        asset: 'USDT',
        delta: '-1,000.00 USDT',
        isDrain: false,
        to: targetAddress,
      },
      {
        asset: 'OKB',
        delta: `+${expectedOut}`,
        isDrain: false,
        to: fromAddress,
      },
    ];
  }
  // 3. ERC20 transfer(address,uint256) -> 0xa9059cbb
  else if (selector === '0xa9059cbb') {
    txType = 'TOKEN_TRANSFER';
    const toRecipient =
      data.length >= 74
        ? '0x' + data.slice(34, 74)
        : '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5';
    requestedAmountFormatted = '$50.00 USDT';
    potentialExposureUsd = 50;
    simulationAssetDeltas = [
      {
        asset: 'USDT',
        delta: '-50.00 USDT',
        isDrain: false,
        to: toRecipient,
      },
    ];
  }
  // 4. ERC721 setApprovalForAll(address,bool) -> 0xa22cb465
  else if (selector === '0xa22cb465') {
    txType = 'NFT_APPROVAL_FOR_ALL';
    isUnlimitedApproval = true;
    potentialExposureUsd = 3500;
    requestedAmountFormatted = 'All NFT Collection Items';
    simulationAssetDeltas = [
      {
        asset: 'Collection NFTs',
        delta: 'Full Operator Access',
        isDrain: true,
        to: targetAddress,
      },
    ];
  }
  // 5. Native transfer (OKB / ETH)
  else if (data === '0x' || data === '' || BigInt(valueWei || '0') > 0n) {
    txType = 'NATIVE_TRANSFER';
    tokenSymbol = isXLayer ? 'OKB' : 'ETH';
    const valNum = parseFloat(valueWei || '0.5');
    potentialExposureUsd = valNum * 58;
    requestedAmountFormatted = `${valNum} ${tokenSymbol} (~$${potentialExposureUsd.toFixed(2)})`;
    simulationAssetDeltas = [
      {
        asset: tokenSymbol,
        delta: `-${valNum} ${tokenSymbol}`,
        isDrain: false,
        to: targetAddress,
      },
    ];
  }

  // Calculate wallet exposure percentage
  const exposurePercent = Math.min(
    100,
    Math.round(
      (potentialExposureUsd / (DEFAULT_WALLET.totalPortfolioUsd || 12480)) * 100
    )
  );

  // Compute Sub-Cent X Layer Gas Metrics ($0.00049 in OKB vs L1 $14.80)
  const xLayerGasOkb = '0.0000085';
  const xLayerGasUsd = 0.00049;
  const ethereumL1GasUsd = 14.8;
  const gasSavedUsd = 14.7995;
  const gasSavingsPercent = 99.99;

  const gasMetrics: GasSavingsMetrics = {
    xLayerGasOkb,
    xLayerGasUsd,
    ethereumL1GasUsd,
    gasSavedUsd,
    gasSavingsPercent,
    networkTps: 20000,
  };

  // Risk Engine Scoring (Deterministic - PRD §64, §65)
  let riskScore = 0;
  const riskSignals: RiskSignal[] = [];

  if (isUnlimitedApproval) {
    riskScore += 30;
    riskSignals.push({
      id: 'sig-unlimited',
      signalType: 'UNLIMITED_APPROVAL',
      severity: 'HIGH',
      title: 'Unlimited Token Permission',
      description: `Contract is requesting permission to spend your full ${tokenSymbol} balance without requiring future approvals.`,
      evidence: { allowance: 'UNLIMITED', token: tokenSymbol },
    });
  }

  if (!oklinkMeta.verified) {
    riskScore += 15;
    riskSignals.push({
      id: 'sig-unverified',
      signalType: 'UNVERIFIED_CONTRACT',
      severity: 'MODERATE',
      title: 'Unverified Bytecode on OKLink Explorer',
      description:
        'Contract source code has not been published or verified on OKLink Explorer. Internal logic and security audits cannot be verified.',
      evidence: { oklinkVerified: false, address: targetAddress },
    });
  }

  if (baseContractMeta.ageDays < 7) {
    riskScore += 15;
    riskSignals.push({
      id: 'sig-new-contract',
      signalType: 'NEW_CONTRACT',
      severity: 'MODERATE',
      title: 'Newly Deployed Contract on X Layer',
      description: `Contract was deployed only ${baseContractMeta.ageDays} day(s) ago and has insufficient historical volume.`,
      evidence: { ageDays: baseContractMeta.ageDays, deployedAt: '2 days ago' },
    });
  }

  if (exposurePercent > 50) {
    riskScore += 25;
    riskSignals.push({
      id: 'sig-high-exposure',
      signalType: 'HIGH_WALLET_EXPOSURE',
      severity: 'HIGH',
      title: 'Critical Wallet Exposure',
      description: `Potential exposure of $${potentialExposureUsd.toLocaleString()} represents ${exposurePercent}% of your active portfolio value.`,
      evidence: { potentialExposureUsd, exposurePercent },
    });
  }

  // Swap Specific Slippage & Frontrunning Risks
  if (swapDetails && swapDetails.isHighSlippage) {
    riskScore += 35;
    riskSignals.push({
      id: 'sig-high-slippage',
      signalType: 'EXCESSIVE_SLIPPAGE',
      severity: 'CRITICAL',
      title: `Excessive Slippage Risk (${swapDetails.slippageTolerancePercent}%)`,
      description: `Slippage tolerance is set to ${swapDetails.slippageTolerancePercent}%. This creates extreme vulnerability to sandwich attacks, MEV bots, and predatory front-running.`,
      evidence: {
        slippage: `${swapDetails.slippageTolerancePercent}%`,
        minReceived: swapDetails.minimumReceivedAmount,
      },
    });
  }

  if (isUnlimitedApproval && !oklinkMeta.verified) {
    riskScore += 15;
    riskSignals.push({
      id: 'sig-asset-drain-risk',
      signalType: 'ASSET_MOVEMENT',
      severity: 'CRITICAL',
      title: 'Drain Vector Detected in Simulation',
      description:
        'The requested allowance enables the target contract to initiate unauthorized fund transfers at any time without further signing prompts.',
      evidence: { simulationStatus: 'PERMISSIVE_ALLOWANCE_GRANTED' },
    });
  }

  // Safe offset if verified on OKLink and long history
  if (oklinkMeta.verified && baseContractMeta.ageDays > 100 && !isUnlimitedApproval && (!swapDetails || !swapDetails.isHighSlippage)) {
    riskScore = Math.max(0, riskScore - 20);
    riskSignals.push({
      id: 'sig-verified-history',
      signalType: 'VERIFIED_REPUTATION',
      severity: 'LOW',
      title: 'OKLink Verified & Established History',
      description: `Source code verified on OKLink Explorer with ${baseContractMeta.interactionCount.toLocaleString()} historic interactions and ${baseContractMeta.ageDays} days onchain.`,
      evidence: {
        interactions: baseContractMeta.interactionCount,
        ageDays: baseContractMeta.ageDays,
        oklinkStatus: 'VERIFIED',
      },
    });
  }

  // Cap risk score
  riskScore = Math.min(100, Math.max(0, riskScore));

  let riskLevel: RiskLevel = 'LOW';
  if (riskScore >= 80) riskLevel = 'CRITICAL';
  else if (riskScore >= 60) riskLevel = 'HIGH';
  else if (riskScore >= 30) riskLevel = 'MODERATE';
  else riskLevel = 'LOW';

  // Evaluate OnchainOS AI Agent Security Policy
  const violations: string[] = [];
  const warnings: string[] = [];

  if (isUnlimitedApproval) {
    violations.push('Agent Policy Violation: Infinite token approvals are strictly forbidden for autonomous execution.');
  }
  if (!oklinkMeta.verified) {
    violations.push('Agent Policy Violation: Interaction with unverified bytecode contracts is prohibited.');
  }
  if (swapDetails && swapDetails.slippageTolerancePercent > 2.0) {
    violations.push(`Agent Policy Violation: Slippage tolerance of ${swapDetails.slippageTolerancePercent}% exceeds the maximum 2.0% agent ceiling.`);
  }
  if (potentialExposureUsd > 2500) {
    violations.push(`Agent Policy Violation: Transaction exposure ($${potentialExposureUsd.toLocaleString()}) exceeds the single-action $2,500 budget cap.`);
  }

  const agentPolicyCompliance: AgentPolicyCompliance = {
    passed: violations.length === 0,
    violations,
    warnings,
    maxSpendLimitExceeded: potentialExposureUsd > 2500,
    unverifiedContractBlocked: !oklinkMeta.verified,
    slippageLimitExceeded: (swapDetails?.slippageTolerancePercent || 0) > 2.0,
    policyName: 'OnchainOS Standard Autonomous Policy',
  };

  return {
    txType,
    network,
    chainId,
    fromAddress,
    targetAddress,
    contractName: baseContractMeta.name,
    contractStatus: baseContractMeta.status,
    contractVerified: oklinkMeta.verified,
    contractAgeDays: baseContractMeta.ageDays,
    tokenSymbol,
    tokenAddress,
    requestedAmountRaw,
    requestedAmountFormatted,
    isUnlimitedApproval,
    walletAssetBalanceFormatted: `${walletAssetBalance.toLocaleString()} ${tokenSymbol}`,
    walletAssetUsdValue,
    potentialExposureUsd,
    walletExposurePercent: exposurePercent,
    simulationSuccess,
    simulationAssetDeltas,
    simulationError,
    riskScore,
    riskLevel,
    riskSignals,
    oklinkMeta,
    swapDetails,
    gasMetrics,
    agentPolicyCompliance,
  };
}
