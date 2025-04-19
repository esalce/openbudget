// src/utils/transactionUtils.ts
import { Transaction, TransactionType } from '../types/transaction';

/**
 * Format a number as currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount / 100); // Convert from cents to dollars
};

/**
 * Calculate the sum of transaction amounts
 */
export const sumTransactions = (transactions: Transaction[]): number => {
  if (!transactions || transactions.length === 0) return 0;
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
};

/**
 * Calculate income (positive transactions)
 */
export const calculateIncome = (transactions: Transaction[]): number => {
  if (!transactions || transactions.length === 0) return 0;
  return transactions
    .filter(t => t.transactionType === TransactionType.INCOME)
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
};

/**
 * Calculate expenses (negative transactions)
 */
export const calculateExpenses = (transactions: Transaction[]): number => {
  if (!transactions || transactions.length === 0) return 0;
  return transactions
    .filter(t => t.transactionType === TransactionType.EXPENSE)
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
};

/**
 * Filter transactions by date range
 */
export const filterTransactionsByDateRange = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] => {
  if (!transactions || transactions.length === 0) return [];
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

/**
 * Get transactions for the current month
 */
export const getCurrentMonthTransactions = (transactions: Transaction[]): Transaction[] => {
  if (!transactions || transactions.length === 0) return [];
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return filterTransactionsByDateRange(transactions, startOfMonth, endOfMonth);
};

/**
 * Get transactions for the previous month
 */
export const getPreviousMonthTransactions = (transactions: Transaction[]): Transaction[] => {
  if (!transactions || transactions.length === 0) return [];
  
  const now = new Date();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  
  return filterTransactionsByDateRange(transactions, startOfLastMonth, endOfLastMonth);
};

/**
 * Group transactions by category
 * Returns an object where keys are category IDs and values are the sum of transactions
 */
export const groupTransactionsByCategory = (transactions: Transaction[]): Record<string, number> => {
  if (!transactions || transactions.length === 0) return {};
  
  const result: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    if (transaction.categoryId) {
      if (!result[transaction.categoryId]) {
        result[transaction.categoryId] = 0;
      }
      result[transaction.categoryId] += transaction.amount;
    }
  });
  
  return result;
};

/**
 * Group transactions by month
 * Returns an object where keys are month strings (YYYY-MM) and values are arrays of transactions
 */
export const groupTransactionsByMonth = (
  transactions: Transaction[]
): Record<string, Transaction[]> => {
  if (!transactions || transactions.length === 0) return {};
  
  const result: Record<string, Transaction[]> = {};
  
  transactions.forEach(transaction => {
    try {
      const date = new Date(transaction.date);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date found in transaction: ${transaction.id}`);
        return; // Skip this transaction
      }
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!result[monthKey]) {
        result[monthKey] = [];
      }
      
      result[monthKey].push(transaction);
    } catch (error) {
      console.error(`Error processing transaction ${transaction.id}:`, error);
    }
  });
  
  return result;
};

/**
 * Calculate running balance for a list of transactions
 * Returns the transactions with an added 'runningBalance' property
 */
export const calculateRunningBalance = (
  transactions: Transaction[],
  startingBalance: number = 0
): (Transaction & { runningBalance: number })[] => {
  if (!transactions || transactions.length === 0) return [];
  
  let balance = startingBalance;
  
  // Sort transactions by date (oldest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    // If dates are equal, sort by ID to ensure stable order
    if (dateA === dateB) {
      return a.id.localeCompare(b.id);
    }
    
    return dateA - dateB;
  });
  
  return sortedTransactions.map(transaction => {
    balance += transaction.amount;
    return {
      ...transaction,
      runningBalance: balance
    };
  });
};

/**
 * Get the total amount for a specific category in a given time period
 */
export const getCategoryTotal = (
  transactions: Transaction[],
  categoryId: string,
  startDate?: Date,
  endDate?: Date
): number => {
  if (!transactions || transactions.length === 0 || !categoryId) return 0;
  
  let filteredTransactions = transactions.filter(t => t.categoryId === categoryId);
  
  if (startDate && endDate) {
    filteredTransactions = filterTransactionsByDateRange(filteredTransactions, startDate, endDate);
  }
  
  return sumTransactions(filteredTransactions);
};

/**
 * Get transactions for a specific account
 */
export const getAccountTransactions = (
  transactions: Transaction[],
  accountId: string
): Transaction[] => {
  if (!transactions || transactions.length === 0 || !accountId) return [];
  
  return transactions.filter(t => t.accountId === accountId);
};

/**
 * Format a date as YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get today's date formatted as YYYY-MM-DD
 */
export const getTodayFormatted = (): string => {
  return formatDate(new Date());
};