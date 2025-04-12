// src/contexts/BudgetContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Budget } from '../types/budget';
import { budgetService } from '../services/budgetService';

interface BudgetContextType {
  budgets: Budget[];
  selectedBudgetId: string | null;
  isLoading: boolean;
  createBudget: (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  selectBudget: (budgetId: string) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const useBudgets = (): BudgetContextType => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
};

interface BudgetProviderProps {
  children: ReactNode;
}

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load budgets on initial mount
  useEffect(() => {
    // For demo purposes, add a sample budget if none exist
    budgetService.addSampleBudgets();
    
    // Fetch all budgets
    const allBudgets = budgetService.getAll();
    setBudgets(allBudgets);
    
    // Select the first budget if available and none is selected
    if (allBudgets.length > 0 && !selectedBudgetId) {
      setSelectedBudgetId(allBudgets[0].id);
    }
    
    setIsLoading(false);
  }, []);

  const createBudget = (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBudget = budgetService.create(budgetData);
    setBudgets(prevBudgets => [...prevBudgets, newBudget]);
    
    // Auto-select the newly created budget
    setSelectedBudgetId(newBudget.id);
    
    return newBudget;
  };

  const selectBudget = (budgetId: string) => {
    // Make sure the budget exists before selecting it
    const budgetExists = budgets.some(budget => budget.id === budgetId);
    if (budgetExists) {
      setSelectedBudgetId(budgetId);
      return true;
    }
    return false;
  };

  const value = {
    budgets,
    selectedBudgetId,
    isLoading,
    createBudget,
    selectBudget
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};