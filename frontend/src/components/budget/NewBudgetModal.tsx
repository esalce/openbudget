import React, { useState } from 'react';
import { Budget } from '../../types/budget';

interface NewBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const NewBudgetModal: React.FC<NewBudgetModalProps> = ({ isOpen, onClose, onSave }) => {
  const [budgetName, setBudgetName] = useState('');
  const [currency] = useState('USD'); // Default to USD for now
  const [nameError, setNameError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!budgetName.trim()) {
      setNameError('Budget name is required');
      return;
    }
    
    onSave({
      name: budgetName.trim(),
      currency,
    });
    
    // Reset form
    setBudgetName('');
    setNameError('');
    onClose();
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Create New Budget</h2>
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
          <div className="mb-4">
            <label htmlFor="budgetName" className="block text-sm font-medium text-gray-700 mb-1">
              Budget Name
            </label>
            <input
              type="text"
              id="budgetName"
              value={budgetName}
              onChange={(e) => {
                setBudgetName(e.target.value);
                if (e.target.value.trim()) setNameError('');
              }}
              className={`w-full px-3 py-2 border ${nameError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="e.g., My Household Budget"
            />
            {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <span className="text-gray-500">USD</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Currency selection will be available in future updates</p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBudgetModal;