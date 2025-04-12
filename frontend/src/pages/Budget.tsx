import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockBudgetService, formatCurrency, Budget, CategoryGroup } from '../services/mockData';

const BudgetPage: React.FC = () => {
  const { budgetId = '1' } = useParams(); // Default to first budget if no ID provided
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        setLoading(true);
        const data = await mockBudgetService.getBudgetById(budgetId);
        if (data) {
          setBudget(data);
        } else {
          setError('Budget not found');
        }
      } catch (err) {
        setError('Failed to load budget');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBudget();
  }, [budgetId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !budget) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error || 'Unable to load budget'}</div>
      </div>
    );
  }
  
  // Calculate totals
  const budgeted = budget.categoryGroups.reduce((total, group) => 
    total + group.categories.reduce((groupTotal, category) => 
      groupTotal + category.monthlyTargetAmount, 0), 0);
  
  const activity = budget.categoryGroups.reduce((total, group) => 
    total + group.categories.reduce((groupTotal, category) => 
      groupTotal + category.activity, 0), 0);
  
  const available = budget.categoryGroups.reduce((total, group) => 
    total + group.categories.reduce((groupTotal, category) => 
      groupTotal + category.availableBalance, 0), 0);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{budget.name}</h1>
        <p className="text-gray-600">Budget for November 2023</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold text-gray-700">Budgeted</h2>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(budgeted, budget.currency)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold text-gray-700">Activity</h2>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(activity, budget.currency)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold text-gray-700">Available</h2>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(available, budget.currency)}</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {budget.categoryGroups.map((group) => (
          <CategoryGroupComponent key={group.id} group={group} currency={budget.currency} />
        ))}
      </div>
    </div>
  );
};

interface CategoryGroupProps {
  group: CategoryGroup;
  currency: string;
}

const CategoryGroupComponent: React.FC<CategoryGroupProps> = ({ group, currency }) => {
  // Calculate group totals
  const groupBudgeted = group.categories.reduce((total, category) => total + category.monthlyTargetAmount, 0);
  const groupActivity = group.categories.reduce((total, category) => total + category.activity, 0);
  const groupAvailable = group.categories.reduce((total, category) => total + category.availableBalance, 0);
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-100 p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">{group.name}</h3>
        <div className="flex space-x-4">
          <span className="text-blue-600 font-medium">{formatCurrency(groupBudgeted, currency)}</span>
          <span className="text-red-600 font-medium">{formatCurrency(groupActivity, currency)}</span>
          <span className="text-green-600 font-medium">{formatCurrency(groupAvailable, currency)}</span>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {group.categories.map((category) => (
          <div key={category.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
            <div>
              <h4 className="font-medium">{category.name}</h4>
              {category.monthlyTargetAmount > 0 && (
                <p className="text-xs text-gray-500">Target: {formatCurrency(category.monthlyTargetAmount, currency)}</p>
              )}
            </div>
            <div className="flex space-x-8">
              <div className="w-24 text-right">
                <span className="text-blue-600">{formatCurrency(category.monthlyTargetAmount, currency)}</span>
              </div>
              <div className="w-24 text-right">
                <span className={`${category.activity < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(category.activity, currency)}
                </span>
              </div>
              <div className="w-24 text-right">
                <span className={`${category.availableBalance < 0 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                  {formatCurrency(category.availableBalance, currency)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetPage;