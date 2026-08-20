export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type TransactionType =
  | 'TOKEN_APPROVAL'
  | 'UNLIMITED_APPROVAL'
  | 'NATIVE_TRANSFER'
  | 'TOKEN_TRANSFER'
  | 'NFT_APPROVAL_FOR_ALL'
  | 'DEX_SWAP'
  | 'CONTRACT_INTERACTION'
  | 'MESSAGE_SIGNATURE'
  | 'PERMIT_SIGNATURE'
  | 'SUSPICIOUS_DRAIN';

export type ContractStatus = 'VERIFIED' | 'KNOWN' | 'UNKNOWN' | 'SUSPICIOUS' | 'DANGEROUS';

export interface ChainConfig {
  id: number;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  blockExplorerUrl: string;
  isTestnet?: boolean;
}

export interface OklinkMetadata {
  verified: boolean;
  contractAddress: string;
  contractName: string;
  compilerVersion?: string;
  creatorAddress?: string;
  txCount: number;
  explorerUrl: string;
  verifiedAt?: string;
  hasAudit?: boolean;
  isOpenSource: boolean;
  reputationTag?: 'Official Verified' | 'Community Verified' | 'Unverified Bytecode' | 'Known Phishing';
}

export interface SwapDetails {
  inputTokenSymbol: string;
  inputTokenAmount: string;
  inputTokenUsd: number;
  outputTokenSymbol: string;
  expectedOutputAmount: string;
  minimumReceivedAmount: string;
  outputTokenUsd: number;
  slippageTolerancePercent: number;
  priceImpactPercent: number;
  isHighSlippage: boolean;
  isHoneypotRisk: boolean;
  routerName: string;
  routerAddress: string;
  mevProtection: boolean;
  okxDexOptimized: boolean;
}

export interface GasSavingsMetrics {
  xLayerGasOkb: string;
  xLayerGasUsd: number;
  ethereumL1GasUsd: number;
  gasSavedUsd: number;
  gasSavingsPercent: number;
  networkTps: number;
}

export interface ContractInfo {
  address: string;
  name: string;
  status: ContractStatus;
  verified: boolean;
  ageDays: number;
  interactionCount: number;
  deployer?: string;
  reputationScore: number; // 0 - 100
  category?: string;
  oklinkMeta?: OklinkMetadata;
}

export interface RiskSignal {
  id: string;
  signalType: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  evidence: Record<string, any>;
}

export interface AgentPolicyCompliance {
  passed: boolean;
  violations: string[];
  warnings: string[];
  maxSpendLimitExceeded: boolean;
  unverifiedContractBlocked: boolean;
  slippageLimitExceeded: boolean;
  policyName: string;
}

export interface DeterministicFacts {
  txType: TransactionType;
  network: string;
  chainId: number;
  fromAddress: string;
  targetAddress: string;
  contractName: string;
  contractStatus: ContractStatus;
  contractVerified: boolean;
  contractAgeDays: number;
  tokenSymbol?: string;
  tokenAddress?: string;
  tokenDecimals?: number;
  requestedAmountRaw?: string;
  requestedAmountFormatted?: string;
  isUnlimitedApproval: boolean;
  walletAssetBalanceFormatted?: string;
  walletAssetUsdValue?: number;
  potentialExposureUsd: number;
  walletExposurePercent: number;
  simulationSuccess: boolean;
  simulationAssetDeltas: {
    asset: string;
    delta: string;
    isDrain: boolean;
    to: string;
  }[];
  simulationError?: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  riskSignals: RiskSignal[];
  oklinkMeta: OklinkMetadata;
  swapDetails?: SwapDetails;
  gasMetrics: GasSavingsMetrics;
  agentPolicyCompliance?: AgentPolicyCompliance;
}

export interface AuraExplanation {
  summary: string;
  what_is_happening: string;
  what_user_is_giving: string;
  potential_impact: string;
  risk_explanation: string[];
  recommendation: 'SAFE_TO_PROCEED' | 'LIMIT_APPROVAL' | 'PROCEED_WITH_CAUTION' | 'REJECT_TRANSACTION';
  recommendation_detail: string;
  recommended_limit_amount?: string;
  confidence: number;
  uncertainty: string[];
}

export interface FullAnalysisResult {
  id: string;
  timestamp: string;
  facts: DeterministicFacts;
  explanation: AuraExplanation;
}

export interface ApprovalItem {
  id: string;
  chainId: number;
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
  spenderAddress: string;
  spenderName: string;
  spenderStatus: ContractStatus;
  allowanceFormatted: string;
  isUnlimited: boolean;
  riskLevel: RiskLevel;
  riskScore: number;
  potentialExposureUsd: number;
  lastUsedDaysAgo: number;
  createdAtDate: string;
  isRevoking?: boolean;
  oklinkExplorerUrl?: string;
  isLiveScanned?: boolean;
}

export interface DecisionRecord {
  id: string;
  timestamp: string;
  txHash?: string;
  actionTitle: string;
  network: string;
  chainId: number;
  targetAddress: string;
  targetName: string;
  riskLevel: RiskLevel;
  riskScore: number;
  userDecision: 'APPROVED' | 'MODIFIED_LIMITED' | 'REJECTED';
  originalExposureUsd: number;
  finalExposureUsd: number;
  savedExposureUsd: number;
  whyUserSignedRecord: string;
  summary: string;
  recommendation: string;
  facts: DeterministicFacts;
  isAgentAutonomous?: boolean;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'INFO';
  title: string;
  description: string;
  contractAddress?: string;
  tokenSymbol?: string;
  actionRequired: boolean;
  resolved: boolean;
  actionType?: 'REVOKE' | 'REVIEW' | 'IGNORE';
}

export interface AgentPolicyConfig {
  id: string;
  name: string;
  agentName: string;
  maxDailySpendUsd: number;
  maxPerTxSpendUsd: number;
  maxAllowedSlippagePercent: number;
  requireOklinkVerification: boolean;
  blockUnlimitedApprovals: boolean;
  allowedDEXsOnly: boolean;
  autoRevokeDormantAfterDays: number;
  enabled: boolean;
}

export interface AgentExecutionLog {
  id: string;
  timestamp: string;
  agentName: string;
  action: string;
  targetContract: string;
  requestedUsdValue: number;
  status: 'EXECUTED_SAFE' | 'BLOCKED_POLICY_VIOLATION' | 'MODIFIED_CAPPED';
  reason: string;
  mcpToolCall: string;
}
