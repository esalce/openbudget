// src/pages/Dashboard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useBudgets } from '../contexts/BudgetContext';

const Dashboard: React.FC = () => {
  const { selectedBudgetId, budgets } = useBudgets();
  const selectedBudget = budgets.find(budget => budget.id === selectedBudgetId);

  // Mock data for dashboard
  const recentTransactions = [
    { id: 1, date: '11/24/2023', payee: 'Employer', category: 'Income', amount: 3000, type: 'income' },
    { id: 2, date: '11/19/2023', payee: 'Software Company', category: 'Software Subscriptions', amount: -50, type: 'expense' },
    { id: 3, date: '11/14/2023', payee: 'Movie Theater', category: 'Entertainment', amount: -50, type: 'expense' },
    { id: 4, date: '11/9/2023', payee: 'Internet Provider', category: 'Internet', amount: -80, type: 'expense' },
    { id: 5, date: '11/4/2023', payee: 'Restaurant', category: 'Dining Out', amount: -120, type: 'expense' },
  ];

  const topSpendingCategories = [
    { category: 'Groceries', amount: 150 },
    { category: 'Dining Out', amount: 120 },
    { category: 'Entertainment', amount: 50 },
  ];

  // Format amount as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to OpenBudget</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Dashboard Content - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Budget Summary Card */}
          {selectedBudget && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Personal Budget</h2>
                <Link 
                  to={`/budget/${selectedBudgetId}`}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  View Details
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Budgeted</p>
                  <p className="text-xl font-medium text-blue-600">$3,780.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Spent</p>
                  <p className="text-xl font-medium text-red-600">$320.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Available</p>
                  <p className="text-xl font-medium text-green-600">$3,460.00</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Budget Progress</h3>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200">
                    <div style={{ width: "8%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>8% spent</span>
                    <span>$3,460.00 remaining</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Transactions Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
              <Link 
                to="/transactions"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                View All
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentTransactions.map(transaction => (
                <div key={transaction.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{transaction.payee}</p>
                      <p className="text-xs text-gray-500">{transaction.date} • {transaction.category}</p>
                    </div>
                    <span className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Your Budgets Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Your Budgets</h2>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                Create New Budget
              </button>
            </div>
            
            <div className="space-y-3">
              {budgets.map(budget => (
                <div 
                  key={budget.id} 
                  className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => window.location.href = `/budget/${budget.id}`}
                >
                  <span className="font-medium">{budget.name}</span>
                  <span className="text-gray-500 text-sm">USD</span>
                </div>
              ))}
              
              {budgets.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p>No budgets yet. Create your first budget to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Spending Categories Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Spending Categories</h2>
            <div className="space-y-4">
              {topSpendingCategories.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">{item.category}</span>
                    <span className="text-sm text-gray-700">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(item.amount / topSpendingCategories[0].amount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md">
                Add Transaction
              </button>
              <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md">
                Manage Budget
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;