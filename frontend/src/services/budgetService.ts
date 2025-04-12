// src/services/budgetService.ts
import { Budget } from '../types/budget';

// In-memory store for budgets
let budgets: Budget[] = [];

// Generate a simple UUID (for demo purposes)
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const budgetService = {
  // Get all budgets
  getAll: (): Budget[] => {
    return [...budgets];
  },
  
  // Create a new budget
  create: (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Budget => {
    const now = new Date();
    const newBudget: Budget = {
      id: generateId(),
      ...budgetData,
      createdAt: now,
      updatedAt: now
    };
    
    budgets.push(newBudget);
    return newBudget;
  },
  
  // Get a budget by ID
  getById: (id: string): Budget | undefined => {
    return budgets.find(budget => budget.id === id);
  },
  
  // For testing/demo purposes - add some sample budgets
  addSampleBudgets: () => {
    if (budgets.length === 0) {
      budgetService.create({ name: "Sample Household Budget", currency: "USD" });
    }
  }
};