import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { solanaService } from '../services/solanaService';

interface TokenInputProps {
  onTokenSubmit: (tokenAddress: string) => void;
  loading: boolean;
}

export const TokenInput: React.FC<TokenInputProps> = ({ onTokenSubmit, loading }) => {
  const [tokenAddress, setTokenAddress] = useState('EBuTz34KVi94uoiggg8BuR5DFsDkiTM572AL2Qzepump');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tokenAddress.trim()) {
      setError('Please enter a token address');
      return;
    }

    if (!solanaService.isValidSolanaAddress(tokenAddress)) {
      setError('Invalid Solana address format');
      return;
    }

    onTokenSubmit(tokenAddress.trim());
  };

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600 p-6 sm:p-8 mb-6 sm:mb-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Search className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Solana Token Holder Tracker
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg px-4">
        Enter a Solana token address to view holder rankings, amounts, and holding duration
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Enter Solana token address..."
            className="block w-full pl-10 pr-3 py-3 sm:py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm text-base sm:text-lg"
            disabled={loading}
          />
        </div>
        
        {error && (
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-base sm:text-lg"
        >
          {loading ? 'Loading...' : 'Analyze Token Holders'}
        </button>
      </form>
    </div>
  );
};