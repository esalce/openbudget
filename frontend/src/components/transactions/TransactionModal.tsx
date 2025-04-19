// src/components/transactions/TransactionModal.tsx
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../../types/transaction';
import { useTransactions } from '../../contexts/TransactionContext';
import { mockBudgetService } from '../../services/mockData';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: string; // Optional: for editing existing transactions
  onSuccess?: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  transactionId,
  onSuccess
}) => {
  const { addTransaction, updateTransaction, getTransactionById } = useTransactions();
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [payee, setPayee] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [memo, setMemo] = useState('');
  const [cleared, setCleared] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.EXPENSE);
  
  // Additional state for UI
  const [categoryGroups, setCategoryGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories and transaction data (if editing)
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Get budget categories
        const budgets = await mockBudgetService.getBudgets();
        if (budgets.length > 0) {
          // Just use the first budget's categories for simplicity
          setCategoryGroups(budgets[0].categoryGroups);
        }

        // If editing, load transaction details
        if (transactionId) {
          const transaction = getTransactionById(transactionId);
          if (transaction) {
            setDate(transaction.date);
            setAmount(Math.abs(transaction.amount / 100).toString()); // Convert from cents to dollars
            setPayee(transaction.payee);
            setCategoryId(transaction.categoryId);
            setMemo(transaction.memo || '');
            setCleared(transaction.cleared);
            setTransactionType(transaction.transactionType as TransactionType);
          }
        }
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load form data');
        console.error(err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, transactionId, getTransactionById]);

  const resetForm = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setAmount('');
    setPayee('');
    setCategoryId(null);
    setMemo('');
    setCleared(false);
    setTransactionType(TransactionType.EXPENSE);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payee.trim() || !amount.trim()) {
      setError('Payee and amount are required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Format amount (convert to cents)
      const amountInCents = Math.round(parseFloat(amount) * 100);
      
      // Prepare transaction object
      const transactionData = {
        date,
        amount: transactionType === TransactionType.EXPENSE ? -amountInCents : amountInCents,
        payee,
        categoryId,
        memo: memo || null,
        cleared,
        transactionType
      };

      if (transactionId) {
        // Update existing transaction
        await updateTransaction({
          id: transactionId,
          ...transactionData
        });
      } else {
        // Add new transaction
        await addTransaction(transactionData);
      }
      
      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to save transaction');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{transactionId ? 'Edit Transaction' : 'Add Transaction'}</h3>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 mb-4">
            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={TransactionType.EXPENSE}>Expense</option>
                <option value={TransactionType.INCOME}>Income</option>
                <option value={TransactionType.TRANSFER}>Transfer</option>
              </select>
            </div>
            
            {/* Amount Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            {/* Payee Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payee
              </label>
              <input
                type="text"
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Payee name"
                required
              />
            </div>
            
            {/* Category Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Uncategorized</option>
                {categoryGroups.map(group => (
                  <optgroup key={group.id} label={group.name}>
                    {group.categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            
            {/* Memo Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Memo
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Optional note about this transaction"
              />
            </div>
            
            {/* Cleared Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="cleared"
                checked={cleared}
                onChange={() => setCleared(!cleared)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="cleared" className="ml-2 text-sm text-gray-700">
                Mark as cleared
              </label>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 border border-gray-300 rounded shadow-sm text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (transactionId ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;