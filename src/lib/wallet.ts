import { createPublicClient, http, formatEther, Address, parseAbi } from 'viem';
import { SUPPORTED_CHAINS } from './constants';
import { ApprovalItem, ContractStatus, RiskLevel } from '../types';

declare global {
  interface Window {
    ethereum?: any;
    okxwallet?: any;
  }
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number;
  connectorType: 'metamask' | 'okx' | 'walletconnect' | 'demo' | null;
  balanceFormatted: string;
  balanceSymbol: string;
  isConnecting: boolean;
  error: string | null;
}

// X Layer Chain Definitions for wallet_addEthereumChain
export const XLAYER_PARAMS: Record<number, any> = {
  196: {
    chainId: '0xc4', // 196
    chainName: 'X Layer Mainnet',
    nativeCurrency: {
      name: 'OKB',
      symbol: 'OKB',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.xlayer.tech'],
    blockExplorerUrls: ['https://www.oklink.com/xlayer'],
  },
  1952: {
    chainId: '0x7a0', // 1952
    chainName: 'X Layer Testnet',
    nativeCurrency: {
      name: 'OKB',
      symbol: 'OKB',
      decimals: 18,
    },
    rpcUrls: ['https://testrpc.xlayer.tech'],
    blockExplorerUrls: ['https://www.oklink.com/xlayer-test'],
  },
};

// Popular X Layer Tokens & Key Spenders for Live Scanning
export const XLAYER_POPULAR_TOKENS = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x1E4a5963aBFD975d8c9021ce480b42188849D41d',
    decimals: 6,
    priceUsd: 1.0,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035',
    decimals: 6,
    priceUsd: 1.0,
  },
  {
    symbol: 'WOKB',
    name: 'Wrapped OKB',
    address: '0xe538905cf8410324e03a5a23c1c177a474d59b2b',
    decimals: 18,
    priceUsd: 58.0,
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1',
    decimals: 8,
    priceUsd: 94000.0,
  },
];

export const XLAYER_KNOWN_SPENDERS = [
  {
    name: 'OKX DEX Aggregator Router',
    address: '0x388c818ca8b9251b393131c08a736a67ccb19297',
    status: 'VERIFIED' as ContractStatus,
    verified: true,
    reputationScore: 98,
  },
  {
    name: 'ExampleSwap Router v3',
    address: '0x8391a27f69201f8449c239d1089201a4e8291a27',
    status: 'UNKNOWN' as ContractStatus,
    verified: false,
    reputationScore: 18,
  },
  {
    name: 'Legacy Aggregator v1',
    address: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
    status: 'SUSPICIOUS' as ContractStatus,
    verified: false,
    reputationScore: 35,
  },
  {
    name: 'StakingRewardsPool',
    address: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
    status: 'KNOWN' as ContractStatus,
    verified: true,
    reputationScore: 88,
  },
];

const ERC20_ABI = parseAbi([
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]);

/**
 * Creates a public client for the specified chain to read live on-chain balances
 */
export function getViemPublicClient(chainId: number) {
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId) || SUPPORTED_CHAINS[0];
  return createPublicClient({
    transport: http(chain.rpcUrl),
  });
}

/**
 * Fetch real native balance on X Layer or EVM
 */
export async function fetchLiveBalance(address: string, chainId: number): Promise<string> {
  try {
    const client = getViemPublicClient(chainId);
    const balanceWei = await client.getBalance({
      address: address as Address,
    });
    const formatted = parseFloat(formatEther(balanceWei)).toFixed(4);
    return formatted;
  } catch (err) {
    console.warn('Failed to fetch on-chain balance via RPC:', err);
    return '0.0000';
  }
}

/**
 * Scans live on-chain token allowances on X Layer
 */
export async function scanLiveXLayerAllowances(
  walletAddress: string,
  chainId: number = 196
): Promise<ApprovalItem[]> {
  const client = getViemPublicClient(chainId);
  const results: ApprovalItem[] = [];
  const explorerBase =
    chainId === 196 ? 'https://www.oklink.com/xlayer' : 'https://www.oklink.com/xlayer-test';

  for (const token of XLAYER_POPULAR_TOKENS) {
    for (const spender of XLAYER_KNOWN_SPENDERS) {
      try {
        const allowanceRaw = (await (client as any).readContract({
          address: token.address as Address,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [walletAddress as Address, spender.address as Address],
        })) as bigint;

        if (allowanceRaw > 0n) {
          const isUnlimited =
            allowanceRaw >
            115792089237316195423570985008687907853269984665640564039457584007913129639900n ||
            allowanceRaw > 1000000000000000000000000n;

          const divisor = 10 ** token.decimals;
          const formattedUnits = isUnlimited
            ? 'Unlimited'
            : `$${(Number(allowanceRaw) / divisor).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })} ${token.symbol}`;

          const exposureUsd = isUnlimited
            ? 8420 // Portfolio cap exposure
            : Math.min(8420, (Number(allowanceRaw) / divisor) * token.priceUsd);

          let riskLevel: RiskLevel = 'LOW';
          let riskScore = 15;

          if (isUnlimited && !spender.verified) {
            riskLevel = 'HIGH';
            riskScore = 82;
          } else if (isUnlimited && spender.verified) {
            riskLevel = 'MODERATE';
            riskScore = 48;
          }

          results.push({
            id: `live-${token.symbol}-${spender.address.slice(2, 6)}`,
            chainId,
            tokenSymbol: token.symbol,
            tokenName: token.name,
            tokenAddress: token.address,
            spenderAddress: spender.address,
            spenderName: spender.name,
            spenderStatus: spender.status,
            allowanceFormatted: formattedUnits,
            isUnlimited,
            riskLevel,
            riskScore,
            potentialExposureUsd: exposureUsd,
            lastUsedDaysAgo: 2,
            createdAtDate: 'Live On-Chain Scan',
            oklinkExplorerUrl: `${explorerBase}/address/${spender.address}`,
            isLiveScanned: true,
          });
        }
      } catch (err) {
        // Contract call error or no allowance
        console.debug(`No allowance for ${token.symbol} on ${spender.name}:`, err);
      }
    }
  }

  return results;
}

/**
 * Requests network switch or addition to MetaMask/OKX
 */
export async function switchOrAddEthereumChain(
  provider: any,
  targetChainId: number
): Promise<boolean> {
  if (!provider) return false;

  const hexChainId = `0x${targetChainId.toString(16)}`;

  try {
    // Attempt switch
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
    return true;
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (
      switchError.code === 4902 ||
      switchError?.data?.originalError?.code === 4902 ||
      switchError.message?.includes('Unrecognized chain')
    ) {
      const params = XLAYER_PARAMS[targetChainId];
      if (params) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [params],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add chain to wallet:', addError);
          return false;
        }
      }
    }
    console.error('Failed to switch chain:', switchError);
    return false;
  }
}
