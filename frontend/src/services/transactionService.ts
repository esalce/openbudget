// src/services/transactionService.ts
import { Transaction, TransactionType } from '../types/transaction';

// In-memory store for transactions
let transactions: Transaction[] = [];

// Generate a simple UUID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Add some sample transactions for testing
const addSampleTransactions = (accountId: string): void => {
  if (transactions.length > 0) return; // Don't add if we already have transactions
  
  const sampleTransactions: Omit<Transaction, 'id'>[] = [
    {
      accountId,
      date: new Date().toISOString().split('T')[0],
      payee: 'Grocery Store',
      amount: -75.48,
      categoryId: null, // This would typically be a real category ID
      notes: 'Weekly grocery shopping',
      cleared: true,
      transactionType: TransactionType.EXPENSE
    },
    {
      accountId,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
      payee: 'Coffee Shop',
      amount: -4.50,
      categoryId: null,
      notes: 'Morning coffee',
      cleared: true,
      transactionType: TransactionType.EXPENSE
    },
    {
      accountId,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
      payee: 'Employer',
      amount: 2500.00,
      categoryId: null,
      notes: 'Bi-weekly salary',
      cleared: true,
      transactionType: TransactionType.INCOME
    },
    {
      accountId,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      payee: 'Restaurant',
      amount: -45.67,
      categoryId: null,
      notes: 'Dinner with friends',
      cleared: false,
      transactionType: TransactionType.EXPENSE
    }
  ];
  
  // Add each sample transaction
  sampleTransactions.forEach(transaction => {
    transactions.push({
      id: generateId(),
      ...transaction
    });
  });
};

export const transactionService = {
  // Get all transactions
  getAll: async (): Promise<Transaction[]> => {
    return [...transactions];
  },
  
  // Get transactions by account
  getByAccount: async (accountId: string): Promise<Transaction[]> => {
    return transactions.filter(t => t.accountId === accountId);
  },
  
  // Get a transaction by ID
  getById: async (id: string): Promise<Transaction | undefined> => {
    return transactions.find(t => t.id === id);
  },
  
  // Create a transaction
  create: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const newTransaction = {
      id: generateId(),
      ...transaction
    };
    
    transactions.push(newTransaction);
    return newTransaction;
  },
  
  // Update a transaction
  update: async (id: string, data: Partial<Omit<Transaction, 'id'>>): Promise<Transaction> => {
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    
    const updatedTransaction = {
      ...transactions[index],
      ...data
    };
    
    transactions[index] = updatedTransaction;
    return updatedTransaction;
  },
  
  // Delete a transaction
  delete: async (id: string): Promise<boolean> => {
    const initialLength = transactions.length;
    transactions = transactions.filter(t => t.id !== id);
    return transactions.length < initialLength;
  },
  
  // Add sample transactions for testing
  addSampleTransactions
};

export default transactionService;