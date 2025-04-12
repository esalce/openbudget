import React, { useState, useEffect } from 'react';
import { mockTransactionService, mockBudgetService, formatCurrency, Transaction, Budget, CategoryGroup } from '../services/mockData';

const ReportsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const transactionData = await mockTransactionService.getTransactions();
        const budgetData = await mockBudgetService.getBudgets();
        
        setTransactions(transactionData);
        setBudgets(budgetData);
      } catch (err) {
        setError('Failed to load report data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }
  
  // Calculate some statistics for reports
  const totalIncome = transactions
    .filter(t => t.transactionType === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.transactionType === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netIncome = totalIncome - totalExpenses;
  
  // Group expenses by category for the pie chart data
  const expensesByCategory: { [key: string]: number } = {};
  
  transactions
    .filter(t => t.transactionType === 'expense' && t.categoryId)
    .forEach(transaction => {
      // Find category name
      let categoryName = 'Unknown';
      
      budgets.forEach(budget => {
        budget.categoryGroups.forEach(group => {
          const category = group.categories.find(c => c.id === transaction.categoryId);
          if (category) {
            categoryName = category.name;
          }
        });
      });
      
      expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + transaction.amount;
    });
  
  // Sort expenses for the bar chart
  const sortedExpenses = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 expenses
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Budget Reports</h1>
        <p className="text-gray-600">Financial insights for the current month</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Income Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Income</span>
              <span className="text-green-600 font-medium">{formatCurrency(totalIncome, 'USD')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Expenses</span>
              <span className="text-red-600 font-medium">{formatCurrency(totalExpenses, 'USD')}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-800 font-medium">Net Income</span>
              <span className={`font-medium ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netIncome, 'USD')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Budget Progress</h2>
          {budgets.length > 0 && budgets[0].categoryGroups.map(group => (
            <div key={group.id} className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1">{group.name}</h3>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200">
                  <div 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    style={{ 
                      width: `${Math.min(100, calculateGroupProgress(group))}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-right">
                  {calculateGroupProgress(group).toFixed(0)}% used
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Top Expenses</h2>
          <div className="space-y-3">
            {sortedExpenses.map(([category, amount]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{category}</span>
                  <span className="text-gray-800 font-medium">{formatCurrency(amount, 'USD')}</span>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      style={{ 
                        width: `${(amount / totalExpenses * 100).toFixed(0)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Monthly Spending Breakdown</h2>
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Coming soon: Interactive charts showing your spending trends over time</p>
              <p className="text-gray-400 text-sm mt-2">
                Install a charting library like Chart.js to implement these visualizations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate category group progress percentage
function calculateGroupProgress(group: CategoryGroup): number {
  const totalBudgeted = group.categories.reduce((sum, cat) => sum + cat.monthlyTargetAmount, 0);
  const totalActivity = Math.abs(group.categories.reduce((sum, cat) => sum + cat.activity, 0));
  
  if (totalBudgeted === 0) return 0;
  return (totalActivity / totalBudgeted) * 100;
}

export default ReportsPage;