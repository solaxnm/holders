export interface TokenHolder {
  address: string;
  balance: number;
  balanceFormatted: string;
  rank: number;
  percentage: number;
  firstTransactionDate?: Date;
  daysHeld?: number;
  isPumpfunAMM?: boolean;
}

export interface TokenInfo {
  address: string;
  name?: string;
  symbol?: string;
  decimals: number;
  totalSupply: number;
  holdersCount: number;
}

export interface SortConfig {
  field: keyof TokenHolder;
  direction: 'asc' | 'desc';
}