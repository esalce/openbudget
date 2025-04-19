// src/types/transaction.ts
export enum TransactionType {
    EXPENSE = 'expense',
    INCOME = 'income',
    TRANSFER = 'transfer'
  }
  
  export interface Transaction {
    id: string;
    date: string; // ISO date string
    accountId: string;
    amount: number; // Positive for income, negative for expenses
    payee: string;
    categoryId: string | null; // null for uncategorized or income
    cleared: boolean;
    notes?: string | null;
    transactionType: TransactionType;
    
    // For transfers
    transferAccountId?: string | null;
    
    // For splits
    parentTransactionId?: string | null;
  }
  
  // For use when creating a new transaction (without ID)
  export type NewTransaction = Omit<Transaction, 'id'>;
  
  // For use when updating an existing transaction
  export type TransactionUpdate = Partial<Omit<Transaction, 'id'>>;