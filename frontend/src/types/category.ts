// src/types/category.ts
export interface CategoryGroup {
    id: string;
    name: string;
    budgetId: string;
    order?: number;
  }
  
  export interface Category {
    id: string;
    name: string;
    categoryGroupId: string;
    targetAmount: number;
    assigned?: number;
    activity?: number;
    available?: number;
    note?: string;
    order?: number;
  }