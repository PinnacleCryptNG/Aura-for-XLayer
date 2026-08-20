import { ChainConfig, ContractInfo, ApprovalItem, SecurityAlert } from '../types';

export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    id: 196,
    name: 'X Layer Mainnet',
    shortName: 'X Layer',
    nativeCurrency: {
      name: 'OKB',
      symbol: 'OKB',
      decimals: 18,
    },
    rpcUrl: 'https://rpc.xlayer.tech',
    blockExplorerUrl: 'https://www.okx.com/web3/explorer/xlayer',
    isTestnet: false,
  },
  {
    id: 1952,
    name: 'X Layer Testnet',
    shortName: 'X Layer Testnet',
    nativeCurrency: {
      name: 'OKB',
      symbol: 'OKB',
      decimals: 18,
    },
    rpcUrl: 'https://testrpc.xlayer.tech',
    blockExplorerUrl: 'https://www.okx.com/web3/explorer/xlayer-test',
    isTestnet: true,
  },
];

export const DEMO_CONTRACTS: Record<string, ContractInfo> = {
  // Flagship Demo 1 - Malicious / Risky unverified drainer trap
  '0x8391a27f69201f8449c239d1089201a4e8291a27': {
    address: '0x8391a27f69201f8449c239d1089201a4e8291a27',
    name: 'Unknown Website Trap',
    status: 'UNKNOWN',
    verified: false,
    ageDays: 2,
    interactionCount: 14,
    reputationScore: 18,
    category: 'Unverified Drainer Trap',
  },
  // Flagship Demo 2 - OKX DEX Smart Router (verified protocol)
  '0x388c818ca8b9251b393131c08a736a67ccb19297': {
    address: '0x388c818ca8b9251b393131c08a736a67ccb19297',
    name: 'OKX DEX Router (Verified)',
    status: 'VERIFIED',
    verified: true,
    ageDays: 410,
    interactionCount: 1845000,
    reputationScore: 98,
    category: 'Verified Exchange',
  },
  // Inactive / Old approval spender
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': {
    address: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
    name: 'Old Trading App v1',
    status: 'SUSPICIOUS',
    verified: false,
    ageDays: 380,
    interactionCount: 890,
    reputationScore: 35,
    category: 'Old Application',
  },
  // Safe user recipient
  '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5': {
    address: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
    name: 'Friend\'s Wallet',
    status: 'KNOWN',
    verified: true,
    ageDays: 720,
    interactionCount: 42,
    reputationScore: 90,
    category: 'Individual',
  },
};

export const INITIAL_APPROVALS: ApprovalItem[] = [];

export const INITIAL_ALERTS: SecurityAlert[] = [];

export const DEFAULT_WALLET = {
  address: '',
  fullAddress: '',
  chainId: 196,
  nativeSymbol: 'OKB',
  nativeBalance: '0.00',
  totalPortfolioUsd: 0,
  monitoredAssetsCount: 0,
  healthScore: 0,
  tokens: [],
};


