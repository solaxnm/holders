import React, { useState } from 'react';
import { Header } from './components/Header';
import { TokenInput } from './components/TokenInput';
import { HoldersTable } from './components/HoldersTable';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { ThemeProvider } from './hooks/useTheme';
import { TokenHolder, TokenInfo } from './types';
import { solanaService } from './services/solanaService';

function AppContent() {
  const [holders, setHolders] = useState<TokenHolder[]>([]);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTokenSubmit = async (tokenAddress: string) => {
    setLoading(true);
    setError(null);
    setHolders([]);
    setTokenInfo(null);

    try {
      const [info, holdersList] = await Promise.all([
        solanaService.getTokenInfo(tokenAddress),
        solanaService.getTokenHolders(tokenAddress, 1000)
      ]);

      setTokenInfo({ ...info, holdersCount: holdersList.length });
      setHolders(holdersList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (tokenInfo) {
      handleTokenSubmit(tokenInfo.address);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TokenInput onTokenSubmit={handleTokenSubmit} loading={loading} />
        
        {loading && <LoadingSpinner />}
        
        {error && <ErrorMessage message={error} onRetry={handleRetry} />}
        
        {holders.length > 0 && !loading && !error && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Token Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Token Address</p>
                  </div>
                  <p className="font-mono text-xs sm:text-sm text-gray-900 dark:text-white break-all bg-gray-100 dark:bg-gray-600 p-2 rounded">
                    {tokenInfo?.address}
                  </p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Decimals</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {tokenInfo?.decimals}
                  </p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Supply</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {tokenInfo?.totalSupply.toLocaleString()}
                  </p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Holders</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {tokenInfo?.holdersCount}
                  </p>
                </div>
              </div>
            </div>
            
            <HoldersTable holders={holders} tokenSymbol={tokenInfo?.symbol} />
          </div>
        )}
        
        {holders.length === 0 && !loading && !error && (
          <div className="text-center py-12 sm:py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl sm:text-3xl">🔍</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
                Ready to Analyze Token Holders
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed px-4">
                Enter a Solana token address above to view detailed holder analytics including rankings, amounts, and holding duration.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;