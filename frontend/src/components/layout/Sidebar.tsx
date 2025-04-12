// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAccounts } from '../../contexts/AccountContext';
import { Account, AccountType } from '../../types/account';
import AddAccountModal from '../accounts/AddAccountModal';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { accounts, selectAccount, totalBalance } = useAccounts();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    cash: false,
    credit: false,
    loans: false,
    tracking: false
  });
  
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
  
  const toggleGroupCollapse = (group: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };
  
  const calculateGroupTotal = (accountList: Account[]): number => {
    return accountList.reduce((sum, account) => sum + account.balance, 0);
  };
  
  const isAccountActive = (accountId: string) => {
    return location.pathname === `/accounts/${accountId}`;
  };

  // Main navigation items
  const mainNavItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )
    },
    {
      name: 'Budget',
      path: '/budget',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
      )
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      )
    },
  ];

  return (
    <aside className="w-72 bg-indigo-900 text-white h-full flex flex-col overflow-y-auto">
      {/* Logo and Account Header */}
      <div className="py-6 px-6 border-b border-indigo-800">
        <div className="flex items-center mb-2">
          <div className="mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">OpenBudget</h1>
            <p className="text-xs text-indigo-300">user@example.com</p>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="mt-6">
        <ul>
          {mainNavItems.map((item) => (
            <li key={item.path} className="mb-1 px-3">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 text-sm ${
                    isActive ? 'bg-indigo-800 text-white rounded-md' : 'text-indigo-100 hover:bg-indigo-800 hover:rounded-md'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}

          {/* All Accounts Link */}
          <li className="mt-4 mb-2 px-3">
            <NavLink
              to="/accounts"
              className={({ isActive }) => 
                `flex items-center justify-between px-4 py-3 text-sm ${
                  (isActive || location.pathname.startsWith('/accounts/')) ? 
                  'bg-indigo-800 text-white rounded-md' : 
                  'text-indigo-100 hover:bg-indigo-800 hover:rounded-md'
                }`
              }
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                All Accounts
              </div>
              <span className="text-sm font-medium">{formatCurrency(totalBalance)}</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Account Groups Section */}
      <div className="mt-1 flex-1 px-3">
        {/* CASH Accounts */}
        {cashAccounts.length > 0 && (
          <div className="mb-1">
            <button 
              onClick={() => toggleGroupCollapse('cash')}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-indigo-300 hover:bg-indigo-800 hover:rounded-md"
            >
              <div className="flex items-center">
                <svg className={`h-3 w-3 mr-1 transform ${collapsedGroups.cash ? '' : 'rotate-90'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                CASH
              </div>
              <span className="font-medium">{formatCurrency(calculateGroupTotal(cashAccounts))}</span>
            </button>
            
            {!collapsedGroups.cash && (
              <ul className="ml-4">
                {cashAccounts.map(account => (
                  <li key={account.id} className="mb-1">
                    <div
                      className={`pl-6 pr-4 py-2 flex justify-between items-center cursor-pointer rounded-md ${
                        isAccountActive(account.id) ? 'bg-indigo-800' : 'hover:bg-indigo-800'
                      }`}
                      onClick={() => handleAccountClick(account)}
                    >
                      <span className="text-sm">{account.name}</span>
                      <span className="text-sm font-medium">{formatCurrency(account.balance)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* CREDIT Accounts */}
        {creditAccounts.length > 0 && (
          <div className="mb-1">
            <button 
              onClick={() => toggleGroupCollapse('credit')}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-indigo-300 hover:bg-indigo-800 hover:rounded-md"
            >
              <div className="flex items-center">
                <svg className={`h-3 w-3 mr-1 transform ${collapsedGroups.credit ? '' : 'rotate-90'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                CREDIT
              </div>
              <span className={`font-medium ${calculateGroupTotal(creditAccounts) < 0 ? 'text-red-400' : ''}`}>
                {formatCurrency(calculateGroupTotal(creditAccounts))}
              </span>
            </button>
            
            {!collapsedGroups.credit && (
              <ul className="ml-4">
                {creditAccounts.map(account => (
                  <li key={account.id} className="mb-1">
                    <div
                      className={`pl-6 pr-4 py-2 flex justify-between items-center cursor-pointer rounded-md ${
                        isAccountActive(account.id) ? 'bg-indigo-800' : 'hover:bg-indigo-800'
                      }`}
                      onClick={() => handleAccountClick(account)}
                    >
                      <span className="text-sm">{account.name}</span>
                      <span className={`text-sm font-medium ${account.balance < 0 ? 'text-red-400' : ''}`}>
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* LOANS Accounts */}
        {loanAccounts.length > 0 && (
          <div className="mb-1">
            <button 
              onClick={() => toggleGroupCollapse('loans')}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-indigo-300 hover:bg-indigo-800 hover:rounded-md"
            >
              <div className="flex items-center">
                <svg className={`h-3 w-3 mr-1 transform ${collapsedGroups.loans ? '' : 'rotate-90'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                LOANS
              </div>
              <span className={`font-medium ${calculateGroupTotal(loanAccounts) < 0 ? 'text-red-400' : ''}`}>
                {formatCurrency(calculateGroupTotal(loanAccounts))}
              </span>
            </button>
            
            {!collapsedGroups.loans && (
              <ul className="ml-4">
                {loanAccounts.map(account => (
                  <li key={account.id} className="mb-1">
                    <div
                      className={`pl-6 pr-4 py-2 flex justify-between items-center cursor-pointer rounded-md ${
                        isAccountActive(account.id) ? 'bg-indigo-800' : 'hover:bg-indigo-800'
                      }`}
                      onClick={() => handleAccountClick(account)}
                    >
                      <span className="text-sm">{account.name}</span>
                      <span className={`text-sm font-medium ${account.balance < 0 ? 'text-red-400' : ''}`}>
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* TRACKING Accounts */}
        {trackingAccounts.length > 0 && (
          <div className="mb-1">
            <button 
              onClick={() => toggleGroupCollapse('tracking')}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-indigo-300 hover:bg-indigo-800 hover:rounded-md"
            >
              <div className="flex items-center">
                <svg className={`h-3 w-3 mr-1 transform ${collapsedGroups.tracking ? '' : 'rotate-90'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                TRACKING
              </div>
              <span className="font-medium">{formatCurrency(calculateGroupTotal(trackingAccounts))}</span>
            </button>
            
            {!collapsedGroups.tracking && (
              <ul className="ml-4">
                {trackingAccounts.map(account => (
                  <li key={account.id} className="mb-1">
                    <div
                      className={`pl-6 pr-4 py-2 flex justify-between items-center cursor-pointer rounded-md ${
                        isAccountActive(account.id) ? 'bg-indigo-800' : 'hover:bg-indigo-800'
                      }`}
                      onClick={() => handleAccountClick(account)}
                    >
                      <span className="text-sm">{account.name}</span>
                      <span className="text-sm font-medium">{formatCurrency(account.balance)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Add Account Button */}
        <div className="mt-6 mb-4 px-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center py-2 text-sm text-indigo-300 hover:text-white hover:bg-indigo-800 hover:rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Account
          </button>
        </div>
      </div>

      {/* Add Account Modal */}
      <AddAccountModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </aside>
  );
};

export default Sidebar;