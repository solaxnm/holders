import React, { useState } from 'react';
import { Download, FileText, Database, Table } from 'lucide-react';
import { TokenHolder } from '../types';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface ExportButtonProps {
  holders: TokenHolder[];
  tokenSymbol?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ holders, tokenSymbol = 'Token' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const prepareExportData = () => {
    return holders.map(holder => ({
      rank: holder.rank,
      address: holder.address,
      balance: holder.balance,
      balanceFormatted: holder.balanceFormatted,
      percentage: holder.percentage,
      daysHeld: holder.daysHeld || 'N/A',
      firstTransactionDate: holder.firstTransactionDate?.toISOString() || 'N/A',
      isPumpfunAMM: holder.isPumpfunAMM ? 'Yes' : 'No',
      holderType: holder.percentage >= 5 ? 'Whale' : 
                  holder.percentage >= 1 ? 'Large Holder' : 
                  holder.percentage >= 0.1 ? 'Medium Holder' : 'Small Holder'
    }));
  };

  const exportToJSON = () => {
    const data = prepareExportData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tokenSymbol}_holders.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const exportToCSV = () => {
    const data = prepareExportData();
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tokenSymbol}_holders.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const exportToExcel = () => {
    const data = prepareExportData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Token Holders');
    
    // Auto-size columns
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;
    
    XLSX.writeFile(workbook, `${tokenSymbol}_holders.xlsx`);
    setIsOpen(false);
  };

  if (holders.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export Data</span>
        <span className="sm:hidden">Export</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-2">
              <button
                onClick={exportToJSON}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <Database className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Export as JSON</span>
              </button>
              <button
                onClick={exportToCSV}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <FileText className="h-4 w-4 text-green-500" />
                <span className="font-medium">Export as CSV</span>
              </button>
              <button
                onClick={exportToExcel}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <Table className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">Export as Excel</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};