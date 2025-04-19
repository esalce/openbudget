// src/components/transactions/TransactionForm.tsx
import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';
import { mockBudgetService } from '../../services/mockData';

interface TransactionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  transactionId?: string; // Optional: for editing existing transactions
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onSuccess, 
  onCancel, 
  transactionId 
}) => {
  const { addTransaction, updateTransaction, getTransactionById } = useTransactions();
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [payee, setPayee] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [memo, setMemo] = useState('');
  const [cleared, setCleared] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'transfer'>('expense');
  
  // Additional state for UI
  const [categoryGroups, setCategoryGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories and transaction data (if editing)
  useEffect(() => {
    const fetchData = async () => {
      try {
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
            setAmount(Math.abs(transaction.amount).toString());
            setPayee(transaction.payee);
            setCategoryId(transaction.categoryId);
            setMemo(transaction.memo || '');
            setCleared(transaction.cleared);
            setTransactionType(transaction.transactionType);
          }
        }
      } catch (err) {
        setError('Failed to load form data');
        console.error(err);
      }
    };

    fetchData();
  }, [transactionId, getTransactionById]);

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
        amount: transactionType === 'expense' ? -amountInCents : amountInCents,
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
      
      onSuccess();
    } catch (err) {
      setError('Failed to save transaction');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">
        {transactionId ? 'Edit Transaction' : 'Add Transaction'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as 'expense' | 'income' | 'transfer')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
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
          
          {/* Cleared Status */}
          <div className="flex items-center h-full pt-6">
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
        
        {/* Memo Field */}
        <div className="mb-6">
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
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
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
            {isLoading ? 'Saving...' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;