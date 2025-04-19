// src/types/transaction.ts

/**
 * Transaction type enum
 */
export enum TransactionType {
  EXPENSE = 'expense',
  INCOME = 'income',
  TRANSFER = 'transfer'
}

/**
 * Transaction interface
 */
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  payee: string;
  categoryId: string | null;
  accountId?: string | null;
  memo: string | null;
  cleared: boolean;
  transactionType: TransactionType | 'expense' | 'income' | 'transfer';
}