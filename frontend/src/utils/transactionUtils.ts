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
  }).format(amount);
};

/**
 * Calculate the sum of transaction amounts
 */
export const sumTransactions = (transactions: Transaction[]): number => {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
};

/**
 * Calculate income (positive transactions)
 */
export const calculateIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.amount > 0 || t.transactionType === TransactionType.INCOME)
    .reduce((total, transaction) => total + transaction.amount, 0);
};

/**
 * Calculate expenses (negative transactions)
 */
export const calculateExpenses = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.amount < 0 || t.transactionType === TransactionType.EXPENSE)
    .reduce((total, transaction) => total + transaction.amount, 0);
};

/**
 * Filter transactions by date range
 */
export const filterTransactionsByDateRange = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] => {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

/**
 * Get transactions for the current month
 */
export const getCurrentMonthTransactions = (transactions: Transaction[]): Transaction[] => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return filterTransactionsByDateRange(transactions, startOfMonth, endOfMonth);
};

/**
 * Get transactions for the previous month
 */
export const getPreviousMonthTransactions = (transactions: Transaction[]): Transaction[] => {
  const now = new Date();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
  return filterTransactionsByDateRange(transactions, startOfLastMonth, endOfLastMonth);
};

/**
 * Group transactions by category
 * Returns an object where keys are category IDs and values are the sum of transactions
 */
export const groupTransactionsByCategory = (transactions: Transaction[]): Record<string, number> => {
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
  const result: Record<string, Transaction[]> = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!result[monthKey]) {
      result[monthKey] = [];
    }
    
    result[monthKey].push(transaction);
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
  let balance = startingBalance;
  
  // Sort transactions by date (oldest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  return sortedTransactions.map(transaction => {
    balance += transaction.amount;
    return {
      ...transaction,
      runningBalance: balance
    };
  });
};