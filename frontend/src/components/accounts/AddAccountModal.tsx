// src/components/accounts/AddAccountModal.tsx
import React, { useState } from 'react';
import { useAccounts } from '../../contexts/AccountContext';
import { AccountType, AccountGroup } from '../../types/account';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const { createAccount } = useAccounts();
  
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>(AccountType.CASH);
  const [accountGroup, setAccountGroup] = useState<AccountGroup>(AccountGroup.BUDGET);
  const [startingBalance, setStartingBalance] = useState('0.00');
  const [errors, setErrors] = useState<{
    name?: string;
    balance?: string;
  }>({});

  const resetForm = () => {
    setAccountName('');
    setAccountType(AccountType.CASH);
    setAccountGroup(AccountGroup.BUDGET);
    setStartingBalance('0.00');
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {name?: string; balance?: string} = {};
    
    if (!accountName.trim()) {
      newErrors.name = 'Account name is required';
    }
    
    if (isNaN(parseFloat(startingBalance))) {
      newErrors.balance = 'Balance must be a valid number';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create the account
    let balance = parseFloat(startingBalance);
    
    // For credit and loan accounts, convert positive balances to negative
    // since they represent debt/liability
    if ((accountType === AccountType.CREDIT || accountType === AccountType.LOAN) && balance > 0) {
      balance = -balance;
    }
    
    createAccount({
      name: accountName.trim(),
      type: accountType,
      balance,
      group: accountGroup
    });
    
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add Account</h2>
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
          {/* Account Name */}
          <div className="mb-4">
            <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>
            <input
              type="text"
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="e.g., Chase Checking"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          {/* Account Type */}
          <div className="mb-4">
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              id="accountType"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as AccountType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={AccountType.CASH}>Cash</option>
              <option value={AccountType.CREDIT}>Credit Card</option>
              <option value={AccountType.LOAN}>Loan</option>
              <option value={AccountType.TRACKING}>Tracking</option>
            </select>
          </div>
          
          {/* Account Group (On/Off Budget) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Group
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  checked={accountGroup === AccountGroup.BUDGET}
                  onChange={() => setAccountGroup(AccountGroup.BUDGET)}
                />
                <span className="ml-2 text-sm text-gray-700">On Budget</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  checked={accountGroup === AccountGroup.TRACKING}
                  onChange={() => setAccountGroup(AccountGroup.TRACKING)}
                />
                <span className="ml-2 text-sm text-gray-700">Off Budget (Tracking)</span>
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {accountGroup === AccountGroup.BUDGET 
                ? "This account's balance will be included in your budget."
                : "This account's balance won't be included in your budget."}
            </p>
          </div>
          
          {/* Starting Balance */}
          <div className="mb-6">
            <label htmlFor="startingBalance" className="block text-sm font-medium text-gray-700 mb-1">
              Starting Balance
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                id="startingBalance"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                className={`block w-full pl-7 pr-3 py-2 border ${errors.balance ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="0.00"
              />
            </div>
            {errors.balance && <p className="mt-1 text-sm text-red-600">{errors.balance}</p>}
            {(accountType === AccountType.CREDIT || accountType === AccountType.LOAN) && (
              <p className="mt-1 text-xs text-gray-500">
                For {accountType === AccountType.CREDIT ? 'credit cards' : 'loans'}, enter a positive number if you have a balance to pay off. It will be converted to a negative balance.
              </p>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;