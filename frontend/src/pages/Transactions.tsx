// src/pages/Transactions.tsx
import React, { useState, useEffect } from 'react';
import { mockBudgetService, formatCurrency } from '../services/mockData';
import TransactionForm from '../components/transactions/TransactionForm';
import { useTransactions } from '../contexts/TransactionContext';

const TransactionsPage: React.FC = () => {
  const { transactions, isLoading, error, refreshTransactions, deleteTransaction } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  
  // Create a map of category IDs to category names for display
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        // Get budgets for category mapping
        const budgetData = await mockBudgetService.getBudgets();
        
        // Build category map for easier lookup
        const categories: Record<string, string> = {};
        budgetData.forEach(budget => {
          budget.categoryGroups.forEach(group => {
            group.categories.forEach(category => {
              categories[category.id] = category.name;
            });
          });
        });
        
        setCategoryMap(categories);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchBudgets();
  }, []);
  
  const handleAddTransaction = () => {
    setShowForm(true);
  };
  
  const handleTransactionSuccess = async () => {
    setShowForm(false);
    // Refresh transactions list
    await refreshTransactions();
  };
  
  if (isLoading) {
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-gray-600">Showing all transactions</p>
        </div>
        <button 
          onClick={handleAddTransaction}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Transaction
        </button>
      </header>
      
      {showForm && (
        <div className="mb-6">
          <TransactionForm 
            onSuccess={handleTransactionSuccess} 
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Memo
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No transactions yet. Click "Add Transaction" to create one.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.payee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.categoryId ? categoryMap[transaction.categoryId] : 
                        (transaction.transactionType === 'income' ? 'Income' : 'Uncategorized')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.memo || '-'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.transactionType === 'income' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {transaction.cleared ? 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Cleared
                        </span> : 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Uncleared
                        </span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Edit
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={async () => {
                          if (window.confirm("Are you sure you want to delete this transaction?")) {
                            try {
                              await deleteTransaction(transaction.id);
                              // The transactions state will be automatically updated by the context
                            } catch (err) {
                              console.error('Error deleting transaction:', err);
                            }
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;