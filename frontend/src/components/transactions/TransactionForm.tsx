// src/components/transactions/TransactionForm.tsx
import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';
import { useCategories } from '../../contexts/CategoryContext';
import { useAccounts } from '../../contexts/AccountContext';
import { Transaction, TransactionType } from '../../types/transaction';

interface TransactionFormProps {
  transaction?: Transaction; // For editing existing transaction
  accountId?: string; // Pre-selected account when adding from account page
  onClose: () => void;
  onSuccess?: (transaction: Transaction) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  transaction, 
  accountId, 
  onClose, 
  onSuccess 
}) => {
  const { addTransaction, updateTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { categoryGroups, categories } = useCategories();
  
  // Initialize form state
  const [formData, setFormData] = useState({
    accountId: accountId || transaction?.accountId || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    payee: transaction?.payee || '',
    amount: transaction ? Math.abs(transaction.amount).toString() : '', // Convert to string for input
    categoryId: transaction?.categoryId || '',
    notes: transaction?.notes || '',
    cleared: transaction?.cleared || false,
    transactionType: transaction?.transactionType || TransactionType.EXPENSE
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        accountId: transaction.accountId,
        date: transaction.date,
        payee: transaction.payee,
        amount: Math.abs(transaction.amount).toString(),
        categoryId: transaction.categoryId || '',
        notes: transaction.notes || '',
        cleared: transaction.cleared,
        transactionType: transaction.transactionType
      });
    } else if (accountId) {
      setFormData(prev => ({
        ...prev,
        accountId
      }));
    }
  }, [transaction, accountId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear validation error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleTransactionTypeChange = (type: TransactionType) => {
    setFormData(prev => ({
      ...prev,
      transactionType: type,
      // Clear category for income or transfers
      categoryId: type !== TransactionType.EXPENSE ? '' : prev.categoryId
    }));
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.accountId) {
      newErrors.accountId = 'Account is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.payee.trim()) {
      newErrors.payee = 'Payee is required';
    }
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    // Require category for expenses
    if (formData.transactionType === TransactionType.EXPENSE && !formData.categoryId) {
      newErrors.categoryId = 'Category is required for expenses';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Convert amount based on transaction type
      let amount = Number(formData.amount);
      if (formData.transactionType === TransactionType.EXPENSE) {
        amount = -amount; // Make amount negative for expenses
      }
      
      const transactionData = {
        ...formData,
        amount,
        categoryId: formData.categoryId || null // Set to null if empty string
      };
      
      let savedTransaction: Transaction | undefined;
      
      if (transaction) {
        // Update existing transaction
        savedTransaction = await updateTransaction(transaction.id, transactionData);
        
        // Handle the potential undefined return value
        if (!savedTransaction) {
          throw new Error('Failed to update transaction. Transaction not found.');
        }
      } else {
        // Create new transaction
        savedTransaction = await addTransaction(transactionData);
      }
      
      // Only call onSuccess if we have a valid transaction
      if (savedTransaction && onSuccess) {
        onSuccess(savedTransaction);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      setErrors({
        submit: typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : 'Failed to save transaction. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {transaction ? 'Edit Transaction' : 'Add Transaction'}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Error message for form submission */}
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-300 rounded-md">
            {errors.submit}
          </div>
        )}
        
        {/* Transaction Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Type
          </label>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              type="button"
              className={`flex-1 py-2 px-4 text-sm font-medium ${
                formData.transactionType === TransactionType.EXPENSE
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => handleTransactionTypeChange(TransactionType.EXPENSE)}
            >
              Expense
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 text-sm font-medium ${
                formData.transactionType === TransactionType.INCOME
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => handleTransactionTypeChange(TransactionType.INCOME)}
            >
              Income
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 text-sm font-medium ${
                formData.transactionType === TransactionType.TRANSFER
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => handleTransactionTypeChange(TransactionType.TRANSFER)}
            >
              Transfer
            </button>
          </div>
        </div>
        
        {/* Account Selector */}
        <div className="mb-4">
          <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
            Account
          </label>
          <select
            id="accountId"
            name="accountId"
            value={formData.accountId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.accountId ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          >
            <option value="">Select an account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          {errors.accountId && (
            <p className="mt-1 text-sm text-red-600">{errors.accountId}</p>
          )}
        </div>
        
        {/* Date Field */}
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>
        
        {/* Payee Field */}
        <div className="mb-4">
          <label htmlFor="payee" className="block text-sm font-medium text-gray-700 mb-1">
            Payee
          </label>
          <input
            type="text"
            id="payee"
            name="payee"
            value={formData.payee}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.payee ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter payee name"
          />
          {errors.payee && (
            <p className="mt-1 text-sm text-red-600">{errors.payee}</p>
          )}
        </div>
        
        {/* Amount Field */}
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="text"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`block w-full pl-7 pr-3 py-2 border ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="0.00"
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>
        
        {/* Category Field - Only for Expenses */}
        {formData.transactionType === TransactionType.EXPENSE && (
          <div className="mb-4">
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="">Select a category</option>
              {categoryGroups.map(group => (
                <optgroup key={group.id} label={group.name}>
                  {categories
                    .filter(category => category.categoryGroupId === group.id)
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
            )}
          </div>
        )}
        
        {/* Notes Field */}
        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional notes about this transaction"
          />
        </div>
        
        {/* Cleared Status */}
        <div className="mb-6">
          <div className="flex items-center">
            <input
              id="cleared"
              name="cleared"
              type="checkbox"
              checked={formData.cleared}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="cleared" className="ml-2 block text-sm text-gray-700">
              Cleared
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Mark as cleared if this transaction has been processed by your bank
          </p>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : transaction ? 'Update' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;