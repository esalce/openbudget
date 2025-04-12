// src/services/accountService.ts
import { Account, AccountType, AccountGroup } from '../types/account';

// In-memory store for accounts
let accounts: Account[] = [];

// Generate a simple UUID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const accountService = {
  // Get all accounts
  getAll: (): Account[] => {
    return [...accounts];
  },

  // Create a new account
  create: (accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Account => {
    const now = new Date();
    const newAccount: Account = {
      id: generateId(),
      ...accountData,
      createdAt: now,
      updatedAt: now
    };
    
    accounts.push(newAccount);
    return newAccount;
  },

  // Get an account by ID
  getById: (id: string): Account | undefined => {
    return accounts.find(account => account.id === id);
  },

  // Update an account
  update: (id: string, data: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>): Account | undefined => {
    const index = accounts.findIndex(account => account.id === id);
    if (index !== -1) {
      accounts[index] = { 
        ...accounts[index], 
        ...data,
        updatedAt: new Date()
      };
      return accounts[index];
    }
    return undefined;
  },

  // Delete an account
  delete: (id: string): boolean => {
    const initialLength = accounts.length;
    accounts = accounts.filter(account => account.id !== id);
    return accounts.length < initialLength;
  },

  // Add sample accounts for testing
  addSampleAccounts: (): void => {
    if (accounts.length > 0) return; // Don't add samples if accounts already exist
    
    // Cash accounts (on budget)
    accountService.create({
      name: 'Chase Checking',
      type: AccountType.CASH,
      balance: 2500.75,
      group: AccountGroup.BUDGET
    });
    
    accountService.create({
      name: 'Ally Savings',
      type: AccountType.CASH,
      balance: 10000.50,
      group: AccountGroup.BUDGET
    });
    
    // Credit accounts (on budget)
    accountService.create({
      name: 'Chase Sapphire',
      type: AccountType.CREDIT,
      balance: -450.25,
      group: AccountGroup.BUDGET
    });
    
    accountService.create({
      name: 'Amex Gold',
      type: AccountType.CREDIT,
      balance: -1200.80,
      group: AccountGroup.BUDGET
    });
    
    // Loan accounts (on budget)
    accountService.create({
      name: 'Student Loan',
      type: AccountType.LOAN,
      balance: -15000.00,
      group: AccountGroup.BUDGET
    });
    
    accountService.create({
      name: 'Mortgage',
      type: AccountType.LOAN,
      balance: -250000.00,
      group: AccountGroup.BUDGET
    });
    
    // Tracking accounts (off budget)
    accountService.create({
      name: 'Vanguard 401(k)',
      type: AccountType.TRACKING,
      balance: 85000.00,
      group: AccountGroup.TRACKING
    });
    
    accountService.create({
      name: 'Fidelity Brokerage',
      type: AccountType.TRACKING,
      balance: 35000.00,
      group: AccountGroup.TRACKING
    });
  }
};