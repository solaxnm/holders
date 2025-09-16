import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TokenHolder, TokenInfo } from '../types';

interface RPCEndpoint {
  name: string;
  url: string;
  ws: string;
  latency: number | null;
}

const RPC_ENDPOINTS: RPCEndpoint[] = [
  {
    name: 'Helius',
    url: 'https://mainnet.helius-rpc.com/?api-key=82463d8f-c081-4611-8ac3-7ef3f45e80f5',
    ws: 'wss://mainnet.helius-rpc.com/?api-key=82463d8f-c081-4611-8ac3-7ef3f45e80f5',
    latency: null
  },
  {
    name: 'QuickNode',
    url: 'https://solitary-skilled-tab.solana-mainnet.quiknode.pro/bc05f3059f4648368dd7b28cf3220a6f10a54432/',
    ws: 'wss://solitary-skilled-tab.solana-mainnet.quiknode.pro/bc05f3059f4648368dd7b28cf3220a6f10a54432',
    latency: null
  }
];

export class SolanaService {
  private connection: Connection;
  private currentEndpoint: RPCEndpoint;
  private readonly PUMPFUN_AMM_ADDRESS = 'NsumZem3j76AAucwXzy5kpgpvqWJJW5dK68YwP6yhjo';

  constructor() {
    this.currentEndpoint = RPC_ENDPOINTS[0];
    this.connection = new Connection(this.currentEndpoint.url, 'confirmed');
    this.testLatencies();
  }

  private async testLatencies(): Promise<void> {
    const latencyPromises = RPC_ENDPOINTS.map(async (endpoint) => {
      try {
        const start = Date.now();
        const testConnection = new Connection(endpoint.url, 'confirmed');
        await testConnection.getSlot();
        endpoint.latency = Date.now() - start;
      } catch (error) {
        console.warn(`Failed to test latency for ${endpoint.name}:`, error);
        endpoint.latency = 9999; // High latency for failed endpoints
      }
    });

    await Promise.all(latencyPromises);

    // Sort by latency and use the fastest endpoint
    const fastestEndpoint = RPC_ENDPOINTS
      .filter(endpoint => endpoint.latency !== null)
      .sort((a, b) => (a.latency || 9999) - (b.latency || 9999))[0];

    if (fastestEndpoint && fastestEndpoint !== this.currentEndpoint) {
      this.currentEndpoint = fastestEndpoint;
      this.connection = new Connection(this.currentEndpoint.url, 'confirmed');
      console.log(`Switched to ${this.currentEndpoint.name} RPC (${this.currentEndpoint.latency}ms)`);
    }
  }

  private async withRetry<T>(operation: () => Promise<T>, maxRetries: number = 2): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt + 1} failed for ${this.currentEndpoint.name}:`, error);

        if (attempt < maxRetries) {
          // Try next available endpoint
          const currentIndex = RPC_ENDPOINTS.indexOf(this.currentEndpoint);
          const nextIndex = (currentIndex + 1) % RPC_ENDPOINTS.length;
          this.currentEndpoint = RPC_ENDPOINTS[nextIndex];
          this.connection = new Connection(this.currentEndpoint.url, 'confirmed');
          console.log(`Switching to ${this.currentEndpoint.name} RPC for retry`);
        }
      }
    }

    throw lastError!;
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    return this.withRetry(async () => {
      try {
        const mintPublicKey = new PublicKey(tokenAddress);
        const mintInfo = await this.connection.getParsedAccountInfo(mintPublicKey);
        
        if (!mintInfo.value?.data || !('parsed' in mintInfo.value.data)) {
          throw new Error('Invalid token address or token not found');
        }

        const parsedData = mintInfo.value.data.parsed.info;
        
        return {
          address: tokenAddress,
          decimals: parsedData.decimals,
          totalSupply: parsedData.supply / Math.pow(10, parsedData.decimals),
          holdersCount: 0, // Will be updated after fetching holders
        };
      } catch (error) {
        console.error('Error fetching token info:', error);
        throw new Error('Failed to fetch token information. Please check the token address.');
      }
    });
  }

  async getTokenHolders(tokenAddress: string, limit: number = 100): Promise<TokenHolder[]> {
    return this.withRetry(async () => {
      try {
        const mintPublicKey = new PublicKey(tokenAddress);
        const tokenInfo = await this.getTokenInfo(tokenAddress);
        
        // Get all token accounts for this mint
        const tokenAccounts = await this.connection.getParsedProgramAccounts(
          TOKEN_PROGRAM_ID,
          {
            filters: [
              {
                dataSize: 165, // Size of token account
              },
              {
                memcmp: {
                  offset: 0,
                  bytes: mintPublicKey.toBase58(),
                },
              },
            ],
          }
        );

        const holders: TokenHolder[] = [];
        let totalBalance = 0;

        for (const account of tokenAccounts) {
          if ('parsed' in account.account.data) {
            const parsedData = account.account.data.parsed.info;
            const balance = parsedData.tokenAmount.uiAmount;
            
            if (balance > 0) {
              totalBalance += balance;
              
              // Try to get first transaction date (simplified approach)
              const firstTransactionDate = await this.getFirstTransactionDate(
                account.pubkey.toBase58()
              );
              
              const daysHeld = firstTransactionDate 
                ? Math.floor((Date.now() - firstTransactionDate.getTime()) / (1000 * 60 * 60 * 24))
                : undefined;

              const isPumpfunAMM = parsedData.owner === this.PUMPFUN_AMM_ADDRESS;

              holders.push({
                address: parsedData.owner,
                balance: balance,
                balanceFormatted: this.formatBalance(balance),
                rank: 0, // Will be set after sorting
                percentage: 0, // Will be calculated after getting total
                firstTransactionDate,
                daysHeld,
                isPumpfunAMM,
              });
            }
          }
        }

        // Sort by balance descending and assign ranks
        holders.sort((a, b) => b.balance - a.balance);
        holders.forEach((holder, index) => {
          holder.rank = index + 1;
          holder.percentage = (holder.balance / totalBalance) * 100;
        });

        return holders.slice(0, limit);
      } catch (error) {
        console.error('Error fetching token holders:', error);
        throw new Error('Failed to fetch token holders. Please try again.');
      }
    });
  }

  private async getFirstTransactionDate(accountAddress: string): Promise<Date | undefined> {
    return this.withRetry(async () => {
      try {
        const publicKey = new PublicKey(accountAddress);
        const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit: 1000 });
        
        if (signatures.length === 0) return undefined;
        
        // Get the oldest signature
        const oldestSignature = signatures[signatures.length - 1];
        return new Date(oldestSignature.blockTime! * 1000);
      } catch (error) {
        console.error('Error fetching first transaction date:', error);
        return undefined;
      }
    });
  }

  private formatBalance(balance: number): string {
    if (balance >= 1e9) return `${(balance / 1e9).toFixed(2)}B`;
    if (balance >= 1e6) return `${(balance / 1e6).toFixed(2)}M`;
    if (balance >= 1e3) return `${(balance / 1e3).toFixed(2)}K`;
    return balance.toFixed(2);
  }

  isValidSolanaAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  getCurrentEndpoint(): RPCEndpoint {
    return this.currentEndpoint;
  }

  getEndpointStats(): RPCEndpoint[] {
    return RPC_ENDPOINTS.map(endpoint => ({ ...endpoint }));
  }
}

export const solanaService = new SolanaService();