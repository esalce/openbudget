// src/components/accounts/AccountTransactionsView.tsx
import React, { useState } from 'react';
import { Account } from '../../types/account';
import { TransactionProvider } from '../../contexts/TransactionContext';
import EnhancedTransactionList from '../transactions/EnhancedTransactionList';
import TransactionModal from '../transactions/TransactionModal';

interface AccountTransactionsViewProps {
  account: Account;
}

const AccountTransactionsView: React.FC<AccountTransactionsViewProps> = ({ account }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Format number as currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Account Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{account.name}</h2>
          <div className="flex items-center mt-1">
            <span className="text-gray-500 mr-2">Current Balance:</span>
            <span className={`font-medium text-xl ${account.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(account.balance)}
            </span>
          </div>
        </div>

        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Account Type:</span> {account.type}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">On Budget:</span> {account.group === 'budget' ? 'Yes' : 'No'}
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            Add Transaction
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <TransactionProvider>
        <EnhancedTransactionList
          accountId={account.id}
          showAccountColumn={false}
        />
      </TransactionProvider>

      {/* Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        accountId={account.id}
      />
    </div>
  );
};

export default AccountTransactionsView;