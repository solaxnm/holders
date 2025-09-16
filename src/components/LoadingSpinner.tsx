import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full animate-spin">
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 border-solid rounded-full animate-spin"></div>
        </div>
      </div>
      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Fetching Token Holder Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Analyzing blockchain transactions and holder information...
        </p>
      </div>
    </div>
  );
};