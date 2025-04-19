// src/pages/Accounts.tsx - Updated version
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAccounts } from '../contexts/AccountContext';
import AccountTransactionsView from '../components/accounts/AccountTransactionsView';

const Accounts: React.FC = () => {
  const { accountId } = useParams<{ accountId?: string }>();
  const { accounts, isLoading } = useAccounts();

  // Format number as currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-40 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  // If viewing a specific account
  if (accountId) {
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Account Not Found</h1>
          <p className="text-gray-600">The account you're looking for doesn't exist or has been deleted.</p>
        </div>
      );
    }

    return (
      <div className="p-8">
        <AccountTransactionsView account={account} />
      </div>
    );
  }

  // If viewing all accounts
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">All Accounts</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                On Budget
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accounts.map(account => (
              <tr key={account.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/accounts/${account.id}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{account.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 capitalize">{account.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    account.group === 'budget' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {account.group === 'budget' ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`text-sm font-medium ${account.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(account.balance)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Accounts;