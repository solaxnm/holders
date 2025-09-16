import React, { useState, useMemo } from 'react';
import { ExportButton } from './ExportButton';
import { TokenHolder, SortConfig } from '../types';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Calendar, 
  TrendingUp, 
  Users, 
  ExternalLink,
  Copy,
  Award,
  Clock,
  Percent,
  DollarSign,
  Activity
} from 'lucide-react';

interface HoldersTableProps {
  holders: TokenHolder[];
  tokenSymbol?: string;
}

export const HoldersTable: React.FC<HoldersTableProps> = ({ holders, tokenSymbol = 'Token' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'rank', direction: 'asc' });
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const filteredAndSortedHolders = useMemo(() => {
    let filtered = holders.filter(holder =>
      holder.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [holders, searchTerm, sortConfig]);

  const handleSort = (field: keyof TokenHolder) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const SortIcon = ({ field }: { field: keyof TokenHolder }) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const getTopHolderStats = () => {
    const totalHolders = holders.length;
    const nonAMMHolders = holders.filter(h => !h.isPumpfunAMM);
    const top10Holdings = nonAMMHolders.slice(0, 10).reduce((sum, holder) => sum + holder.percentage, 0);
    const avgDaysHeld = holders.filter(h => h.daysHeld).reduce((sum, h) => sum + (h.daysHeld || 0), 0) / holders.filter(h => h.daysHeld).length;
    const whaleCount = nonAMMHolders.filter(h => h.percentage >= 1).length;
    const totalCirculating = nonAMMHolders.reduce((sum, holder) => sum + holder.balance, 0);

    return { totalHolders, top10Holdings, avgDaysHeld, whaleCount, totalCirculating };
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 via-yellow-500 to-yellow-600';
    if (rank === 2) return 'from-gray-300 via-gray-400 to-gray-500';
    if (rank === 3) return 'from-amber-600 via-amber-700 to-amber-800';
    if (rank <= 10) return 'from-blue-500 via-blue-600 to-blue-700';
    if (rank <= 50) return 'from-purple-500 via-purple-600 to-purple-700';
    return 'from-gray-400 via-gray-500 to-gray-600';
  };

  const getHolderCategory = (percentage: number) => {
    if (percentage >= 5) return { label: 'Whale', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900' };
    if (percentage >= 1) return { label: 'Large Holder', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900' };
    if (percentage >= 0.1) return { label: 'Medium Holder', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900' };
    return { label: 'Small Holder', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900' };
  };

  const stats = getTopHolderStats();

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Holders</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalHolders.toLocaleString()}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-500 rounded-lg">
              <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Top 10 Holdings</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.top10Holdings.toFixed(1)}%</p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-500 rounded-lg">
              <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Avg Days Held</p>
              <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">
                {isNaN(stats.avgDaysHeld) ? 'N/A' : Math.round(stats.avgDaysHeld)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-500 rounded-lg">
              <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-4 border border-red-200 dark:border-red-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Whales (≥1%)</p>
              <p className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-100">{stats.whaleCount}</p>
            </div>
            <div className="p-2 sm:p-3 bg-red-500 rounded-lg">
              <Award className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Circulating</p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                {(stats.totalCirculating / 1e6).toFixed(1)}M
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-indigo-500 rounded-lg">
              <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Enhanced Search */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b dark:border-gray-600">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Token Holders</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Detailed analysis of {tokenSymbol} distribution</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search addresses..."
                  className="block w-full sm:w-64 pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
              <ExportButton holders={holders} tokenSymbol={tokenSymbol} />
            </div>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th
                  className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  onClick={() => handleSort('rank')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Rank</span>
                    <SortIcon field="rank" />
                  </div>
                </th>
                <th
                  className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  onClick={() => handleSort('address')}
                >
                  <div className="flex items-center space-x-1">
                    <span className="hidden sm:inline">Holder Details</span>
                    <span className="sm:hidden">Holder</span>
                    <SortIcon field="address" />
                  </div>
                </th>
                <th
                  className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  onClick={() => handleSort('balance')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Holdings</span>
                    <SortIcon field="balance" />
                  </div>
                </th>
                <th
                  className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  onClick={() => handleSort('percentage')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Share</span>
                    <SortIcon field="percentage" />
                  </div>
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  onClick={() => handleSort('daysHeld')}
                >
                  <div className="flex items-center space-x-1">
                    <span className="hidden xl:inline">Holding Period</span>
                    <span className="xl:hidden">Days</span>
                    <SortIcon field="daysHeld" />
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedHolders.map((holder, index) => {
                const category = getHolderCategory(holder.percentage);
                return (
                  <tr key={holder.address} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r ${getRankBadgeColor(holder.rank)} flex items-center justify-center text-white font-bold shadow-lg`}>
                          {holder.rank <= 3 ? (
                            <Award className="h-3 w-3 sm:h-5 sm:w-5" />
                          ) : (
                            <span className="text-xs sm:text-sm">{holder.rank}</span>
                          )}
                        </div>
                        {holder.rank <= 3 && (
                          <div className="hidden sm:block text-xs font-medium text-gray-600 dark:text-gray-400">
                            #{holder.rank}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="space-y-2">
                        {holder.isPumpfunAMM ? (
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                                <span className="hidden sm:inline">Pump.fun AMM (SolanaM-WSOL) Market</span>
                                <span className="sm:hidden">AMM Pool</span>
                              </span>
                              <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                                <span className="hidden sm:inline">Liquidity Pool</span>
                                <span className="sm:hidden">LP</span>
                              </span>
                            </div>
                            <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1 break-all">
                              {formatAddress(holder.address)}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center space-x-2">
                              <div className="text-xs sm:text-sm font-mono text-gray-900 dark:text-white break-all">
                                {formatAddress(holder.address)}
                              </div>
                              <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${category.bg} ${category.color} whitespace-nowrap`}>
                                <span className="hidden sm:inline">{category.label}</span>
                                <span className="sm:hidden">
                                  {category.label === 'Whale' ? 'W' : 
                                   category.label === 'Large Holder' ? 'L' : 
                                   category.label === 'Medium Holder' ? 'M' : 'S'}
                                </span>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="space-y-1">
                        <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                          {holder.balanceFormatted}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                          {holder.balance.toLocaleString()} {tokenSymbol || 'Token'}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                            {holder.percentage.toFixed(3)}%
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(holder.percentage * 10, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4">
                      {holder.daysHeld ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {holder.daysHeld} days
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 hidden xl:block">
                            Since {holder.firstTransactionDate?.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            holder.daysHeld >= 30 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            holder.daysHeld >= 7 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {holder.daysHeld >= 30 ? 'Long-term' : holder.daysHeld >= 7 ? 'Medium-term' : 'Short-term'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">No data</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <button
                          onClick={() => copyToClipboard(holder.address)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                          title="Copy address"
                        >
                          {copiedAddress === holder.address ? (
                            <span className="text-green-600 text-xs font-medium">
                              <span className="hidden sm:inline">Copied!</span>
                              <span className="sm:hidden">✓</span>
                            </span>
                          ) : (
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                        </button>
                        <a
                          href={`https://solscan.io/account/${holder.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200"
                          title="View on Solscan"
                        >
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAndSortedHolders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No holders found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};