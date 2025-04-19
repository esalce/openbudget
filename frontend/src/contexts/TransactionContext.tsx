// src/contexts/TransactionContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, TransactionType } from '../types/transaction';
import { useCategories } from './CategoryContext';

interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id'>>) => Promise<Transaction | undefined>;
  deleteTransaction: (id: string) => Promise<boolean>;
  fetchTransactions: () => Promise<Transaction[]>;
  fetchAccountTransactions: (accountId: string) => Promise<Transaction[]>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateCategory } = useCategories();

  // Sample mock data for testing
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      date: new Date().toISOString(),
      accountId: 'acc1',
      amount: -25.99,
      payee: 'Grocery Store',
      categoryId: 'cat1',
      cleared: true,
      notes: 'Weekly groceries',
      transactionType: TransactionType.EXPENSE
    },
    {
      id: '2',
      date: new Date().toISOString(),
      accountId: 'acc1',
      amount: 1200.00,
      payee: 'Employer',
      categoryId: null,
      cleared: true,
      notes: 'Salary',
      transactionType: TransactionType.INCOME
    }
  ];

  // Load initial mock data
  useEffect(() => {
    setTransactions(mockTransactions);
  }, []);

  const fetchTransactions = async (): Promise<Transaction[]> => {
    setError(null);
    setIsLoading(true);
    
    try {
      // In a real app, you'd fetch from an API here
      // For now, let's simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return transactions;
    } catch (error) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccountTransactions = async (accountId: string): Promise<Transaction[]> => {
    setError(null);
    setIsLoading(true);
    
    try {
      // In a real app, you'd fetch from an API here
      // For now, let's simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filtered = transactions.filter(t => t.accountId === accountId);
      return filtered;
    } catch (error) {
      setError('Failed to fetch account transactions');
      console.error('Error fetching account transactions:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id'>): Promise<Transaction> => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Create a new transaction with an ID
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substring(2, 15),
        ...transactionData,
      };
      
      // In a real app, you'd POST to an API here
      // For now, let's simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the transactions state
      setTransactions(prev => [...prev, newTransaction]);
      
      // If the transaction has a categoryId, update that category's activity and available amounts
      if (transactionData.categoryId) {
        // Calculate activity change based on transaction type and amount
        const activityChange = transactionData.amount;
        
        // Update category with the activity change
        await updateCategory(transactionData.categoryId, {
          activity: activityChange,
          available: -activityChange // Available decreases when activity increases for expenses
        });
      }
      
      return newTransaction;
    } catch (error) {
      setError('Failed to add transaction');
      console.error('Error adding transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (
    id: string, 
    data: Partial<Omit<Transaction, 'id'>>
  ): Promise<Transaction | undefined> => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Find the transaction
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) {
        setError('Transaction not found');
        return undefined;
      }
      
      // In a real app, you'd PUT to an API here
      // For now, let's simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the transaction
      const updatedTransaction = { ...transaction, ...data };
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
      
      // If categoryId changed, update both old and new categories
      if (data.categoryId && data.categoryId !== transaction.categoryId) {
        // Handle old category - reverse the effect
        if (transaction.categoryId) {
          await updateCategory(transaction.categoryId, {
            activity: -transaction.amount,
            available: transaction.amount
          });
        }
        
        // Handle new category
        await updateCategory(data.categoryId, {
          activity: updatedTransaction.amount,
          available: -updatedTransaction.amount
        });
      }
      // If just the amount changed but category is the same
      else if (data.amount !== undefined && transaction.categoryId) {
        const amountDifference = data.amount - transaction.amount;
        await updateCategory(transaction.categoryId, {
          activity: amountDifference,
          available: -amountDifference
        });
      }
      
      return updatedTransaction;
    } catch (error) {
      setError('Failed to update transaction');
      console.error('Error updating transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    
    try {
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) {
        setError('Transaction not found');
        return false;
      }
      
      // In a real app, you'd DELETE to an API here
      // For now, let's simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      // If the transaction had a categoryId, update that category
      if (transaction.categoryId) {
        // Reverse the effect of this transaction on the category
        await updateCategory(transaction.categoryId, {
          activity: -transaction.amount,
          available: transaction.amount
        });
      }
      
      return true;
    } catch (error) {
      setError('Failed to delete transaction');
      console.error('Error deleting transaction:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    transactions,
    isLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions,
    fetchAccountTransactions
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};