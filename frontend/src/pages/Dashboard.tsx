import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockBudgetService, mockTransactionService, formatCurrency, Budget, Transaction } from '../services/mockData';

const Dashboard: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const budgetData = await mockBudgetService.getBudgets();
        const transactionData = await mockTransactionService.getTransactions();
        
        setBudgets(budgetData);
        
        // Sort transactions by date (newest first) and take only the most recent 5
        const sortedTransactions = [...transactionData].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 5);
        
        setRecentTransactions(sortedTransactions);
      } catch (err) {
        setError('Failed to load dashboard data');
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
  
  // Get the primary budget (first one)
  const primaryBudget = budgets.length > 0 ? budgets[0] : null;
  
  // Calculate totals for the primary budget
  const budgeted = primaryBudget 
    ? primaryBudget.categoryGroups.reduce((total, group) => 
        total + group.categories.reduce((groupTotal, category) => 
          groupTotal + category.monthlyTargetAmount, 0), 0)
    : 0;
  
  const spent = primaryBudget 
    ? Math.abs(primaryBudget.categoryGroups.reduce((total, group) => 
        total + group.categories.reduce((groupTotal, category) => 
          groupTotal + (category.activity < 0 ? category.activity : 0), 0), 0))
    : 0;
  
  const available = primaryBudget 
    ? primaryBudget.categoryGroups.reduce((total, group) => 
        total + group.categories.reduce((groupTotal, category) => 
          groupTotal + category.availableBalance, 0), 0)
    : 0;
  
  // Find categories with the highest spending
  type CategorySpending = { name: string; spent: number };
  
  const topSpendingCategories: CategorySpending[] = [];
  
  if (primaryBudget) {
    const allCategories: CategorySpending[] = [];
    
    primaryBudget.categoryGroups.forEach(group => {
      group.categories.forEach(category => {
        if (category.activity < 0) {
          allCategories.push({
            name: category.name,
            spent: Math.abs(category.activity)
          });
        }
      });
    });
    
    // Sort by highest spending and take top 3
    topSpendingCategories.push(...allCategories
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 3));
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to OpenBudget</p>
      </header>
      
      {primaryBudget ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Budget Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{primaryBudget.name}</h2>
                <Link to={`/budget/${primaryBudget.id}`} className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                  View Details →
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-1">Budgeted</p>
                  <p className="text-xl font-semibold text-blue-600">{formatCurrency(budgeted, primaryBudget.currency)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-1">Spent</p>
                  <p className="text-xl font-semibold text-red-600">{formatCurrency(spent, primaryBudget.currency)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-1">Available</p>
                  <p className="text-xl font-semibold text-green-600">{formatCurrency(available, primaryBudget.currency)}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-2">Budget Progress</h3>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200">
                    <div 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      style={{ width: `${Math.min(100, (spent / budgeted) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{((spent / budgeted) * 100).toFixed(0)}% spent</span>
                    <span>{formatCurrency(budgeted - spent, primaryBudget.currency)} remaining</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recent Transactions</h2>
                <Link to="/transactions" className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                  View All →
                </Link>
              </div>
              
              {recentTransactions.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {recentTransactions.map(transaction => {
                    // Find category name
                    let categoryName = 'Uncategorized';
                    if (transaction.categoryId) {
                      budgets.forEach(budget => {
                        budget.categoryGroups.forEach(group => {
                          const category = group.categories.find(c => c.id === transaction.categoryId);
                          if (category) {
                            categoryName = category.name;
                          }
                        });
                      });
                    } else if (transaction.transactionType === 'income') {
                      categoryName = 'Income';
                    }
                    
                    return (
                      <div key={transaction.id} className="py-3 flex justify-between">
                        <div>
                          <p className="font-medium">{transaction.payee}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{new Date(transaction.date).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span>{categoryName}</span>
                          </div>
                        </div>
                        <div className={`font-semibold ${
                          transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transactionType === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount, 'USD')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent transactions</p>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Your Budgets</h2>
              
              {budgets.length > 0 ? (
                <div className="space-y-3">
                  {budgets.map(budget => (
                    <Link 
                      key={budget.id}
                      to={`/budget/${budget.id}`}
                      className="block p-3 rounded hover:bg-gray-50 transition duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{budget.name}</h3>
                        <span className="text-gray-500 text-sm">{budget.currency}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-3">No budgets found</p>
              )}
              
              <button className="w-full mt-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded">
                Create New Budget
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Top Spending Categories</h2>
              
              {topSpendingCategories.length > 0 ? (
                <div className="space-y-4">
                  {topSpendingCategories.map(category => (
                    <div key={category.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{category.name}</span>
                        <span>{formatCurrency(category.spent, primaryBudget.currency)}</span>
                      </div>
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div 
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                            style={{ width: `${Math.min(100, (category.spent / spent) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-3">No spending data</p>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link to="/transactions" className="block w-full py-2 px-3 text-center bg-green-500 hover:bg-green-600 text-white font-medium rounded">
                  Add Transaction
                </Link>
                <Link to="/budget" className="block w-full py-2 px-3 text-center bg-blue-500 hover:bg-blue-600 text-white font-medium rounded">
                  Manage Budget
                </Link>
                <Link to="/reports" className="block w-full py-2 px-3 text-center bg-purple-500 hover:bg-purple-600 text-white font-medium rounded">
                  View Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to OpenBudget!</h2>
          <p className="text-gray-600 mb-6">You don't have any budgets yet. Create your first budget to get started with your financial journey.</p>
          <button className="py-2 px-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded">
            Create Your First Budget
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;