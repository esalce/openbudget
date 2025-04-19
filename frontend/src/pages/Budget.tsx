// src/pages/Budget.tsx
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBudgets } from '../contexts/BudgetContext';
import { CategoryProvider } from '../contexts/CategoryContext';
import BudgetEditor from '../components/budget/BudgetEditor';

const Budget: React.FC = () => {
  const { budgetId } = useParams<{ budgetId?: string }>();
  const { budgets, selectedBudgetId, selectBudget } = useBudgets();
  const navigate = useNavigate();

  // Handle initial load and redirection
  useEffect(() => {
    // If we have a budget ID in the URL, select it
    if (budgetId) {
      selectBudget(budgetId);
    } 
    // If we have a selected budget but no budget ID in the URL, update the URL
    else if (selectedBudgetId) {
      navigate(`/budget/${selectedBudgetId}`, { replace: true });
    }
    // If no budget is selected and we have budgets, select the first one
    else if (budgets.length > 0) {
      navigate(`/budget/${budgets[0].id}`, { replace: true });
    }
  }, [budgetId, selectedBudgetId, budgets, navigate, selectBudget]);

  // Handle budget selection change
  const handleBudgetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBudgetId = e.target.value;
    navigate(`/budget/${newBudgetId}`);
  };

  // Find the selected budget
  const selectedBudget = budgets.find(budget => budget.id === (budgetId || selectedBudgetId));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Budget</h1>
        
        {budgets.length > 0 ? (
          <div className="w-full sm:w-64">
            <label htmlFor="budget-selector" className="sr-only">Select Budget</label>
            <select
              id="budget-selector"
              value={budgetId || selectedBudgetId || ''}
              onChange={handleBudgetChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="" disabled>Select a budget</option>
              {budgets.map(budget => (
                <option key={budget.id} value={budget.id}>
                  {budget.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {!selectedBudget ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {budgets.length > 0 ? (
            <p className="text-gray-600">Please select a budget to view details.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">You don't have any budgets yet.</p>
              <p className="text-gray-600">
                Go to the Dashboard to create your first budget.
              </p>
            </div>
          )}
        </div>
      ) : (
        <CategoryProvider>
          <BudgetEditor />
        </CategoryProvider>
      )}
    </div>
  );
};

export default Budget;