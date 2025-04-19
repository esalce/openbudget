// src/components/transactions/EnhancedTransactionList.tsx
import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';
import { useAccounts } from '../../contexts/AccountContext';
import { useCategories } from '../../contexts/CategoryContext';
import { Transaction, TransactionType } from '../../types/transaction';
import TransactionModal from './TransactionModal';

interface EnhancedTransactionListProps {
  accountId?: string; // Optional: Filter to specific account
  showAccountColumn?: boolean; // Whether to show the account column
  limit?: number; // Optional: Limit number of transactions
}

const EnhancedTransactionList: React.FC<EnhancedTransactionListProps> = ({
  accountId,
  showAccountColumn = true,
  limit
}) => {
  const { transactions, isLoading, error, refreshTransactions, deleteTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { categories, categoryGroups } = useCategories();
  
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Handle initial data loading
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        await refreshTransactions();
      } catch (err) {
        console.error("Error loading transactions:", err);
      }
    };
    
    loadTransactions();
  }, [accountId, refreshTransactions]);
  
  // Filter and sort transactions
  useEffect(() => {
    let filtered = [...transactions];
    
    // Filter by account if specified
    if (accountId) {
      filtered = filtered.filter(t => t.accountId === accountId);
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Apply limit if specified
    if (limit && filtered.length > limit) {
      filtered = filtered.slice(0, limit);
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, accountId, limit]);
  
  // Format amount as currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Get account name by ID
  const getAccountName = (accountId?: string | null): string => {
    if (!accountId) return 'Unknown Account';
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : 'Unknown Account';
  };
  
  // Get category name by ID
  const getCategoryName = (categoryId: string | null): string => {
    if (!categoryId) return 'Uncategorized';
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return 'Unknown Category';
    
    const group = categoryGroups.find(g => g.id === category.categoryGroupId);
    return group ? `${group.name}: ${category.name}` : category.name;
  };
  
  // Handle edit transaction
  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };
  
  // Handle delete transaction
  const handleDelete = async (id: string) => {
    if (confirmDelete === id) {
      try {
        setIsDeleting(true);
        const success = await deleteTransaction(id);
        if (!success) {
          throw new Error("Failed to delete transaction");
        }
        setConfirmDelete(null);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      } finally {
        setIsDeleting(false);
      }
    } else {
      setConfirmDelete(id);
      // Auto-reset confirmation after 5 seconds for better UX
      setTimeout(() => {
        setConfirmDelete(state => state === id ? null : state);
      }, 5000);
    }
  };
  
  // Handle add transaction
  const handleAddTransaction = () => {
    setSelectedTransaction(undefined);
    setIsModalOpen(true);
  };
  
  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTransaction(undefined);
  };
  
  // Handle successful transaction add/edit
  const handleSuccess = async () => {
    // Refresh the transactions after successful save
    try {
      await refreshTransactions();
    } catch (err) {
      console.error("Error refreshing transactions:", err);
    }
  };
  
  if (isLoading && !isDeleting && filteredTransactions.length === 0) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">
          {accountId 
            ? `Transactions for ${getAccountName(accountId)}` 
            : 'All Transactions'}
        </h2>
        <button
          onClick={handleAddTransaction}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          disabled={isLoading}
        >
          Add Test
        </button>
      </div>
      
      {filteredTransactions.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No transactions found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                {showAccountColumn && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
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
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  {showAccountColumn && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getAccountName(transaction.accountId)}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.payee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.categoryId ? 
                      getCategoryName(transaction.categoryId) : 
                      (transaction.transactionType === TransactionType.INCOME ? 'Income' : 'Uncategorized')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.memo || '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(transaction.amount)}
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
                    <button 
                      onClick={() => handleEdit(transaction)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      disabled={isDeleting}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(transaction.id)}
                      className={`${
                        isDeleting && confirmDelete === transaction.id 
                          ? 'text-gray-400 cursor-not-allowed'
                          : confirmDelete === transaction.id 
                          ? 'text-red-800 font-semibold' 
                          : 'text-red-600 hover:text-red-900'
                      }`}
                      disabled={isDeleting}
                    >
                      {isDeleting && confirmDelete === transaction.id 
                        ? 'Deleting...' 
                        : confirmDelete === transaction.id 
                        ? 'Confirm' 
                        : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        transactionId={selectedTransaction?.id}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default EnhancedTransactionList;