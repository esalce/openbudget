// src/components/budgets/BudgetList.tsx
import React, { useState } from 'react';
import { useBudgets } from '../../contexts/BudgetContext';
import NewBudgetModal from './NewBudgetModal';

const BudgetList: React.FC = () => {
  const { budgets, selectedBudgetId, selectBudget, createBudget, isLoading } = useBudgets();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateBudget = (budgetData: { name: string; currency: string }) => {
    createBudget(budgetData);
  };

  // Format date to a readable string
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Your Budgets</h2>
        <button
          onClick={handleOpenModal}
          className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create New Budget
        </button>
      </div>

      {isLoading ? (
        <div className="py-4 text-center text-gray-500">Loading budgets...</div>
      ) : budgets.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p className="mb-2">You don't have any budgets yet.</p>
          <p>Create your first budget to get started!</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {budgets.map((budget) => (
            <li 
              key={budget.id}
              className={`py-3 px-2 cursor-pointer hover:bg-gray-50 ${
                selectedBudgetId === budget.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => selectBudget(budget.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-md font-medium text-gray-800">{budget.name}</h3>
                  <p className="text-xs text-gray-500">Created: {formatDate(budget.createdAt)}</p>
                </div>
                <span className="text-sm font-medium text-gray-600">{budget.currency}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <NewBudgetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleCreateBudget}
      />
    </div>
  );
};

export default BudgetList;