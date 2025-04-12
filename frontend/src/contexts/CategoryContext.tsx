// src/contexts/CategoryContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CategoryGroup, Category } from '../types/category';
import { categoryService } from '../services/categoryService';
import { useBudgets } from './BudgetContext';

interface CategoryContextType {
  categoryGroups: CategoryGroup[];
  categories: Category[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  createCategoryGroup: (data: Omit<CategoryGroup, 'id'>) => CategoryGroup;
  updateCategoryGroup: (id: string, data: Partial<Omit<CategoryGroup, 'id'>>) => CategoryGroup | undefined;
  deleteCategoryGroup: (id: string) => boolean;
  createCategory: (data: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => Category | undefined;
  deleteCategory: (id: string) => boolean;
  selectCategory: (categoryId: string | null) => void;
  getSelectedCategory: () => Category | undefined;
  refreshCategories: () => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const useCategories = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

interface CategoryProviderProps {
  children: ReactNode;
}

export const CategoryProvider: React.FC<CategoryProviderProps> = ({ children }) => {
  const { selectedBudgetId } = useBudgets();
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCategories = () => {
    if (selectedBudgetId) {
      // Load category groups and categories for the selected budget
      const groups = categoryService.getAllCategoryGroups(selectedBudgetId);
      setCategoryGroups(groups);
      
      const cats = categoryService.getCategoriesByBudgetId(selectedBudgetId);
      setCategories(cats);
      
      // If there are no categories yet, add sample data
      if (groups.length === 0) {
        categoryService.addSampleData(selectedBudgetId);
        
        // Reload the data after adding samples
        setCategoryGroups(categoryService.getAllCategoryGroups(selectedBudgetId));
        setCategories(categoryService.getCategoriesByBudgetId(selectedBudgetId));
      }
    } else {
      setCategoryGroups([]);
      setCategories([]);
    }
    
    setIsLoading(false);
  };

  // When the selected budget changes, load its categories
  useEffect(() => {
    setIsLoading(true);
    setSelectedCategoryId(null);
    refreshCategories();
  }, [selectedBudgetId]);

  const createCategoryGroup = (data: Omit<CategoryGroup, 'id'>): CategoryGroup => {
    const newGroup = categoryService.createCategoryGroup(data);
    setCategoryGroups([...categoryGroups, newGroup]);
    return newGroup;
  };

  const updateCategoryGroup = (
    id: string,
    data: Partial<Omit<CategoryGroup, 'id'>>
  ): CategoryGroup | undefined => {
    const updatedGroup = categoryService.updateCategoryGroup(id, data);
    if (updatedGroup) {
      setCategoryGroups(
        categoryGroups.map(group => (group.id === id ? updatedGroup : group))
      );
    }
    return updatedGroup;
  };

  const deleteCategoryGroup = (id: string): boolean => {
    const result = categoryService.deleteCategoryGroup(id);
    if (result) {
      setCategoryGroups(categoryGroups.filter(group => group.id !== id));
      
      // Also remove any categories that belonged to this group
      setCategories(categories.filter(cat => cat.categoryGroupId !== id));
      
      // If the selected category was in this group, deselect it
      if (selectedCategoryId && categories.find(
        cat => cat.id === selectedCategoryId && cat.categoryGroupId === id
      )) {
        setSelectedCategoryId(null);
      }
    }
    return result;
  };

  const createCategory = (data: Omit<Category, 'id'>): Category => {
    const newCategory = categoryService.createCategory(data);
    setCategories([...categories, newCategory]);
    return newCategory;
  };

  const updateCategory = (
    id: string,
    data: Partial<Omit<Category, 'id'>>
  ): Category | undefined => {
    const updatedCategory = categoryService.updateCategory(id, data);
    if (updatedCategory) {
      setCategories(
        categories.map(category => (category.id === id ? updatedCategory : category))
      );
    }
    return updatedCategory;
  };

  const deleteCategory = (id: string): boolean => {
    const result = categoryService.deleteCategory(id);
    if (result) {
      setCategories(categories.filter(category => category.id !== id));
      
      // If this was the selected category, deselect it
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
      }
    }
    return result;
  };

  const selectCategory = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  const getSelectedCategory = (): Category | undefined => {
    if (!selectedCategoryId) return undefined;
    return categories.find(category => category.id === selectedCategoryId);
  };

  const value = {
    categoryGroups,
    categories,
    selectedCategoryId,
    isLoading,
    createCategoryGroup,
    updateCategoryGroup,
    deleteCategoryGroup,
    createCategory,
    updateCategory,
    deleteCategory,
    selectCategory,
    getSelectedCategory,
    refreshCategories
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};