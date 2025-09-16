import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
        Error Loading Token Data
      </h3>
      
      <p className="text-red-600 dark:text-red-400 mb-4">
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};