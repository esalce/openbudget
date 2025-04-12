// src/services/categoryService.ts
import { CategoryGroup, Category } from '../types/category';

// In-memory stores
let categoryGroups: CategoryGroup[] = [];
let categories: Category[] = [];

// Generate a simple UUID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const categoryService = {
  // Category Groups
  getAllCategoryGroups: (budgetId: string): CategoryGroup[] => {
    return categoryGroups.filter(group => group.budgetId === budgetId);
  },

  getCategoryGroupById: (id: string): CategoryGroup | undefined => {
    return categoryGroups.find(group => group.id === id);
  },

  createCategoryGroup: (data: Omit<CategoryGroup, 'id'>): CategoryGroup => {
    const newGroup: CategoryGroup = {
      id: generateId(),
      ...data,
      order: categoryGroups.filter(group => group.budgetId === data.budgetId).length
    };
    
    categoryGroups.push(newGroup);
    return newGroup;
  },

  updateCategoryGroup: (id: string, data: Partial<Omit<CategoryGroup, 'id'>>): CategoryGroup | undefined => {
    const index = categoryGroups.findIndex(group => group.id === id);
    if (index !== -1) {
      categoryGroups[index] = { ...categoryGroups[index], ...data };
      return categoryGroups[index];
    }
    return undefined;
  },

  deleteCategoryGroup: (id: string): boolean => {
    const initialLength = categoryGroups.length;
    categoryGroups = categoryGroups.filter(group => group.id !== id);
    
    // Also delete all categories in this group
    categories = categories.filter(category => category.categoryGroupId !== id);
    
    return categoryGroups.length < initialLength;
  },

  // Categories
  getAllCategories: (categoryGroupId: string): Category[] => {
    return categories.filter(category => category.categoryGroupId === categoryGroupId);
  },

  getCategoriesByBudgetId: (budgetId: string): Category[] => {
    const groupIds = categoryGroups
      .filter(group => group.budgetId === budgetId)
      .map(group => group.id);
    
    return categories.filter(category => groupIds.includes(category.categoryGroupId));
  },

  getCategoryById: (id: string): Category | undefined => {
    return categories.find(category => category.id === id);
  },

  createCategory: (data: Omit<Category, 'id'>): Category => {
    const newCategory: Category = {
      id: generateId(),
      ...data,
      assigned: data.assigned || 0,
      activity: data.activity || 0,
      available: data.available || 0,
      order: categories.filter(cat => cat.categoryGroupId === data.categoryGroupId).length
    };
    
    categories.push(newCategory);
    return newCategory;
  },

  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>): Category | undefined => {
    const index = categories.findIndex(category => category.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...data };
      return categories[index];
    }
    return undefined;
  },

  deleteCategory: (id: string): boolean => {
    const initialLength = categories.length;
    categories = categories.filter(category => category.id !== id);
    return categories.length < initialLength;
  },

  // Sample data for testing
  addSampleData: (budgetId: string): void => {
    if (categoryGroups.some(group => group.budgetId === budgetId)) {
      // Sample data already exists for this budget
      return;
    }

    // Create sample category groups
    const fixedCostsGroup = categoryService.createCategoryGroup({
      name: 'Fixed Costs',
      budgetId
    });

    const variableCostsGroup = categoryService.createCategoryGroup({
      name: 'Variable Costs',
      budgetId
    });

    const savingsGroup = categoryService.createCategoryGroup({
      name: 'Savings & Investments',
      budgetId
    });

    // Create sample categories
    categoryService.createCategory({
      name: 'Rent',
      categoryGroupId: fixedCostsGroup.id,
      targetAmount: 1200,
      assigned: 1200,
      activity: -1200,
      available: 0,
      note: 'Due on the 1st of each month'
    });

    categoryService.createCategory({
      name: 'Internet',
      categoryGroupId: fixedCostsGroup.id,
      targetAmount: 65,
      assigned: 65,
      activity: 0,
      available: 65
    });

    categoryService.createCategory({
      name: 'Phone',
      categoryGroupId: fixedCostsGroup.id,
      targetAmount: 50,
      assigned: 50,
      activity: 0,
      available: 50
    });

    categoryService.createCategory({
      name: 'Groceries',
      categoryGroupId: variableCostsGroup.id,
      targetAmount: 400,
      assigned: 400,
      activity: -125.65,
      available: 274.35
    });

    categoryService.createCategory({
      name: 'Dining Out',
      categoryGroupId: variableCostsGroup.id,
      targetAmount: 200,
      assigned: 200,
      activity: -85.20,
      available: 114.80
    });

    categoryService.createCategory({
      name: 'Emergency Fund',
      categoryGroupId: savingsGroup.id,
      targetAmount: 10000,
      assigned: 500,
      activity: 0,
      available: 500,
      note: 'Goal: 3-6 months of expenses'
    });

    categoryService.createCategory({
      name: 'Retirement',
      categoryGroupId: savingsGroup.id,
      targetAmount: 6000,
      assigned: 500,
      activity: 0,
      available: 500,
      note: 'Annual contribution goal'
    });
  }
};