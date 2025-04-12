// src/contexts/AccountContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Account, AccountType, AccountGroup } from '../types/account';
import { accountService } from '../services/accountService';

interface AccountContextType {
  accounts: Account[];
  selectedAccountId: string | null;
  isLoading: boolean;
  totalBalance: number;
  createAccount: (accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Account;
  updateAccount: (id: string, data: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>) => Account | undefined;
  deleteAccount: (id: string) => boolean;
  selectAccount: (accountId: string | null) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccounts = (): AccountContextType => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
};

interface AccountProviderProps {
  children: ReactNode;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate total balance of on-budget accounts
  const totalBalance = accounts
    .filter(account => account.group === AccountGroup.BUDGET)
    .reduce((sum, account) => {
      if (account.type === AccountType.CREDIT || account.type === AccountType.LOAN) {
        // For credit cards and loans, the balance is inverted in the UI
        // Negative balance means you owe money, but that reduces your total available money
        return sum + account.balance;
      }
      return sum + account.balance;
    }, 0);

  // Load accounts on initial mount
  useEffect(() => {
    // Add sample accounts for testing if none exist
    accountService.addSampleAccounts();
    
    // Fetch all accounts
    const allAccounts = accountService.getAll();
    setAccounts(allAccounts);
    
    // Select the first account if available and none is selected
    if (allAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(allAccounts[0].id);
    }
    
    setIsLoading(false);
  }, []);

  const createAccount = (accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Account => {
    const newAccount = accountService.create(accountData);
    setAccounts(prevAccounts => [...prevAccounts, newAccount]);
    return newAccount;
  };

  const updateAccount = (
    id: string,
    data: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>
  ): Account | undefined => {
    const updatedAccount = accountService.update(id, data);
    if (updatedAccount) {
      setAccounts(
        accounts.map(account => (account.id === id ? updatedAccount : account))
      );
    }
    return updatedAccount;
  };

  const deleteAccount = (id: string): boolean => {
    const result = accountService.delete(id);
    if (result) {
      setAccounts(accounts.filter(account => account.id !== id));
      
      // If the selected account was deleted, select another one or null
      if (selectedAccountId === id) {
        if (accounts.length > 1) {
          const remainingAccounts = accounts.filter(account => account.id !== id);
          setSelectedAccountId(remainingAccounts[0].id);
        } else {
          setSelectedAccountId(null);
        }
      }
    }
    return result;
  };

  const selectAccount = (accountId: string | null) => {
    setSelectedAccountId(accountId);
  };

  const value = {
    accounts,
    selectedAccountId,
    isLoading,
    totalBalance,
    createAccount,
    updateAccount,
    deleteAccount,
    selectAccount
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};