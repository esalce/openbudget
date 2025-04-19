// src/pages/Transactions.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAccounts } from '../contexts/AccountContext';
import { TransactionProvider } from '../contexts/TransactionContext';
import EnhancedTransactionList from '../components/transactions/EnhancedTransactionList';

const TransactionsPage: React.FC = () => {
  const { accountId } = useParams<{ accountId?: string }>();
  const { accounts } = useAccounts();
  const [filterType, setFilterType] = useState<'all' | 'cleared' | 'uncleared'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'thisMonth' | 'lastMonth' | 'thisYear'>('all');
  
  // Find account name if accountId is provided
  const accountName = accountId 
    ? accounts.find(a => a.id === accountId)?.name || 'Unknown Account'
    : 'All Accounts';

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        <p className="text-gray-600">
          {accountId ? `Transactions for ${accountName}` : 'All transactions'}
        </p>
      </header>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filterType === 'all'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('cleared')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filterType === 'cleared'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cleared
              </button>
              <button
                onClick={() => setFilterType('uncleared')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filterType === 'uncleared'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Uncleared
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setDateRange('all')}
                className={`px-3 py-1 text-sm rounded-md ${
                  dateRange === 'all'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Dates
              </button>
              <button
                onClick={() => setDateRange('thisMonth')}
                className={`px-3 py-1 text-sm rounded-md ${
                  dateRange === 'thisMonth'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setDateRange('lastMonth')}
                className={`px-3 py-1 text-sm rounded-md ${
                  dateRange === 'lastMonth'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Last Month
              </button>
              <button
                onClick={() => setDateRange('thisYear')}
                className={`px-3 py-1 text-sm rounded-md ${
                  dateRange === 'thisYear'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                This Year
              </button>
            </div>
          </div>
        </div>
        
        {/* Search field */}
        <div className="mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transaction List */}
      <TransactionProvider>
        <EnhancedTransactionList 
          accountId={accountId} 
          showAccountColumn={!accountId}
        />
      </TransactionProvider>
    </div>
  );
};

export default TransactionsPage;