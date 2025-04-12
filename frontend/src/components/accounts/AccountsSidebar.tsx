// src/components/accounts/AccountsSidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAccounts } from '../../contexts/AccountContext';
import { Account, AccountType, AccountGroup } from '../../types/account';
import AddAccountModal from './AddAccountModal';

const AccountsSidebar: React.FC = () => {
  const { accounts, selectAccount, totalBalance } = useAccounts();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Group accounts by type
  const cashAccounts = accounts.filter(account => account.type === AccountType.CASH);
  const creditAccounts = accounts.filter(account => account.type === AccountType.CREDIT);
  const loanAccounts = accounts.filter(account => account.type === AccountType.LOAN);
  const trackingAccounts = accounts.filter(account => account.type === AccountType.TRACKING);

  // Format number as currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleAccountClick = (account: Account) => {
    selectAccount(account.id);
    navigate(`/accounts/${account.id}`);
  };

  const isAccountActive = (accountId: string) => {
    return location.pathname === `/accounts/${accountId}`;
  };

  return (
    <div className="w-64 bg-gray-800 text-gray-100 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-white">Accounts</h2>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="text-gray-400 hover:text-white"
              title="Add Account"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <Link 
              to="/accounts"
              className={`flex items-center justify-between px-3 py-2 rounded-md ${
                location.pathname === '/accounts' ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <span className="font-medium">All Accounts</span>
              <span className="text-sm">{formatCurrency(totalBalance)}</span>
            </Link>
          </div>

          {/* Budget Accounts */}
          <div className="mb-4">
            <h3 className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              Budget
            </h3>
            
            {/* Cash Accounts */}
            {cashAccounts.length > 0 && (
              <div className="mb-2">
                <h4 className="px-3 text-xs text-gray-500 mb-1">Cash</h4>
                {cashAccounts.map(account => (
                  <div
                    key={account.id}
                    onClick={() => handleAccountClick(account)}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-md ${
                      isAccountActive(account.id) ? 'bg-gray-700' : 'hover:bg-gray-700'
                    }`}
                  >
                    <span>{account.name}</span>
                    <span className="text-sm">{formatCurrency(account.balance)}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Credit Accounts */}
            {creditAccounts.length > 0 && (
              <div className="mb-2">
                <h4 className="px-3 text-xs text-gray-500 mb-1">Credit</h4>
                {creditAccounts.map(account => (
                  <div
                    key={account.id}
                    onClick={() => handleAccountClick(account)}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-md ${
                      isAccountActive(account.id) ? 'bg-gray-700' : 'hover:bg-gray-700'
                    }`}
                  >
                    <span>{account.name}</span>
                    <span className={`text-sm ${account.balance < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Loan Accounts */}
            {loanAccounts.length > 0 && (
              <div className="mb-2">
                <h4 className="px-3 text-xs text-gray-500 mb-1">Loans</h4>
                {loanAccounts.map(account => (
                  <div
                    key={account.id}
                    onClick={() => handleAccountClick(account)}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-md ${
                      isAccountActive(account.id) ? 'bg-gray-700' : 'hover:bg-gray-700'
                    }`}
                  >
                    <span>{account.name}</span>
                    <span className={`text-sm ${account.balance < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Tracking Accounts */}
          {trackingAccounts.length > 0 && (
            <div>
              <h3 className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                Tracking
              </h3>
              {trackingAccounts.map(account => (
                <div
                  key={account.id}
                  onClick={() => handleAccountClick(account)}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-md ${
                    isAccountActive(account.id) ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                >
                  <span>{account.name}</span>
                  <span className="text-sm">{formatCurrency(account.balance)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      <AddAccountModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
};

export default AccountsSidebar;