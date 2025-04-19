// src/components/transactions/TransactionModal.tsx
import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';
import { useAccounts } from '../../contexts/AccountContext';
import { useCategories } from '../../contexts/CategoryContext';
import { Transaction, TransactionType } from '../../types/transaction';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction; // If provided, we're editing; otherwise, we're adding
  accountId?: string; // Used to pre-select account for new transactions
  onSuccess?: () => void; // Callback after successful save
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  accountId,
  onSuccess
}) => {
  const { addTransaction, updateTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { categoryGroups, categories } = useCategories();
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccount, setSelectedAccount] = useState(accountId || '');
  const [amount, setAmount] = useState('0.00');
  const [payee, setPayee] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [cleared, setCleared] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.EXPENSE);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Initialize form values when editing an existing transaction
  useEffect(() => {
    if (transaction) {
      setDate(new Date(transaction.date).toISOString().split('T')[0]);
      setSelectedAccount(transaction.accountId);
      setAmount(Math.abs(transaction.amount).toString());
      setPayee(transaction.payee);
      setSelectedCategory(transaction.categoryId);
      setNotes(transaction.notes || '');
      setCleared(transaction.cleared);
      setTransactionType(transaction.transactionType);
    } else {
      // Reset form for new transaction
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedAccount(accountId || '');
      setAmount('0.00');
      setPayee('');
      setSelectedCategory(null);
      setNotes('');
      setCleared(false);
      setTransactionType(TransactionType.EXPENSE);
    }
  }, [transaction, accountId]);
  
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!date) newErrors.date = 'Date is required';
    if (!selectedAccount) newErrors.account = 'Account is required';
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }
    
    if (!payee.trim()) newErrors.payee = 'Payee is required';
    
    // For expenses, category is typically required
    if (transactionType === TransactionType.EXPENSE && !selectedCategory) {
      newErrors.category = 'Category is required for expenses';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const parsedAmount = parseFloat(amount);
      // For expenses, convert to negative value
      const signedAmount = transactionType === TransactionType.EXPENSE 
        ? -Math.abs(parsedAmount) 
        : Math.abs(parsedAmount);
      
      const transactionData = {
        date,
        accountId: selectedAccount,
        amount: signedAmount,
        payee,
        categoryId: selectedCategory,
        notes,
        cleared,
        transactionType
      };
      
      if (transaction) {
        // Update existing transaction
        await updateTransaction(transaction.id, transactionData);
      } else {
        // Add new transaction
        await addTransaction(transactionData as Omit<Transaction, 'id'>);
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      setErrors({
        submit: 'Failed to save transaction. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        {/* Modal panel */}
        <div className="inline-block w-full max-w-lg pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle">
          <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {transaction ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
                disabled={isSubmitting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Transaction Type Tabs */}
              <div className="mb-4">
                <div className="flex border-b border-gray-200">
                  {Object.values(TransactionType).map(type => (
                    <button
                      key={type}
                      type="button"
                      className={`${
                        transactionType === type
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } flex-1 py-2 px-1 text-center border-b-2 font-medium text-sm`}
                      onClick={() => setTransactionType(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Date */}
              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>
              
              {/* Account */}
              <div className="mb-4">
                <label htmlFor="account" className="block text-sm font-medium text-gray-700">
                  Account
                </label>
                <select
                  id="account"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className={`mt-1 block w-full py-2 px-3 border ${
                    errors.account ? 'border-red-300' : 'border-gray-300'
                  } bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  required
                >
                  <option value="">Select an account</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
                {errors.account && <p className="mt-1 text-sm text-red-600">{errors.account}</p>}
              </div>
              
              {/* Payee */}
              <div className="mb-4">
                <label htmlFor="payee" className="block text-sm font-medium text-gray-700">
                  Payee
                </label>
                <input
                  type="text"
                  id="payee"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
                    errors.payee ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter payee name"
                  required
                />
                {errors.payee && <p className="mt-1 text-sm text-red-600">{errors.payee}</p>}
              </div>
              
              {/* Amount */}
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`block w-full pl-7 pr-12 shadow-sm sm:text-sm rounded-md ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
              </div>
              
              {/* Category */}
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className={`mt-1 block w-full py-2 px-3 border ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  } bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  disabled={transactionType === TransactionType.INCOME}
                >
                  <option value="">
                    {transactionType === TransactionType.INCOME ? 'Income (no category needed)' : 'Select a category'}
                  </option>
                  {categoryGroups.map(group => (
                    <optgroup key={group.id} label={group.name}>
                      {categories
                        .filter(cat => cat.categoryGroupId === group.id)
                        .map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>
              
              {/* Notes */}
              <div className="mb-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Add notes about this transaction"
                />
              </div>
              
              {/* Cleared Status */}
              <div className="mb-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="cleared"
                      type="checkbox"
                      checked={cleared}
                      onChange={(e) => setCleared(e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="cleared" className="font-medium text-gray-700">
                      Mark as cleared
                    </label>
                    <p className="text-gray-500">
                      This transaction has been processed by your bank
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Submit Error */}
              {errors.submit && (
                <div className="mb-4 p-2 bg-red-50 text-red-700 border border-red-200 rounded">
                  {errors.submit}
                </div>
              )}
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? 'Saving...' 
                    : transaction 
                      ? 'Update Transaction' 
                      : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;