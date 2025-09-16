import React from 'react';
import { Moon, Sun, ExternalLink, Zap, Github } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { solanaService } from '../services/solanaService';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const currentEndpoint = solanaService.getCurrentEndpoint();

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg sm:text-xl">TH</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Token Holders
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                by <a href="https://solanam.com/" className="text-purple-500 hover:text-purple-600 transition-colors" target="_blank" rel="noopener noreferrer">SolanaM</a>
              </p>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* RPC Status - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="font-medium">{currentEndpoint.name}</span>
              {currentEndpoint.latency && (
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full font-semibold">
                  {currentEndpoint.latency}ms
                </span>
              )}
            </div>

            {/* GitHub Link */}
            <a 
              href="https://github.com/solaxnm/holders" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 sm:p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
              title="View on GitHub"
            >
              <Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </a>

            {/* External Link */}
            <a 
              href="https://solscan.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex p-2.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200 group"
              title="Open Solscan"
            >
              <ExternalLink className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </a>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              ) : (
                <Sun className="h-5 w-5 group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};