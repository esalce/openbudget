// src/contexts/TransactionContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Transaction } from '../types/transaction';
import transactionService from '../services/transactionService';

interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  refreshTransactions: () => Promise<void>;
  // Fetch all transactions (alias for refreshTransactions)
  fetchTransactions: () => Promise<void>;
  // Fetch transactions for a specific account
  fetchAccountTransactions: (accountId: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
  updateTransaction: (transaction: Transaction) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<boolean>;
  getTransactionById: (id: string) => Transaction | undefined;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTransactions = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load transactions on initial mount
  useEffect(() => {
    refreshTransactions();
  }, []);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    try {
      const newTransaction = await transactionService.create(transaction);
      setTransactions((prev) => [...prev, newTransaction]);
      return newTransaction;
    } catch (err) {
      setError('Failed to add transaction');
      console.error(err);
      throw err;
    }
  }, []);

  const updateTransaction = useCallback(async (transaction: Transaction): Promise<Transaction> => {
    try {
      // Update transaction by id and data
      const { id, ...rest } = transaction;
      const updatedTransaction = await transactionService.update(id, rest);
      setTransactions((prev) =>
        prev.map((t) => (t.id === transaction.id ? updatedTransaction : t))
      );
      return updatedTransaction;
    } catch (err) {
      setError('Failed to update transaction');
      console.error(err);
      throw err;
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await transactionService.delete(id);
      if (success) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
      return success;
    } catch (err) {
      setError('Failed to delete transaction');
      console.error(err);
      throw err;
    }
  }, []);

  const getTransactionById = useCallback((id: string): Transaction | undefined => {
    return transactions.find((t) => t.id === id);
  }, [transactions]);

  // Alias for fetching all transactions
  const fetchTransactions = refreshTransactions;

  // Fetch transactions for a specific account
  const fetchAccountTransactions = useCallback(async (accountId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await transactionService.getByAccount(accountId);
      setTransactions(data);
    } catch (err) {
      setError('Failed to load transactions for account');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    transactions,
    isLoading,
    error,
    refreshTransactions,
    fetchTransactions,
    fetchAccountTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
  }), [
    transactions,
    isLoading,
    error,
    refreshTransactions,
    fetchTransactions,
    fetchAccountTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
  ]);

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};