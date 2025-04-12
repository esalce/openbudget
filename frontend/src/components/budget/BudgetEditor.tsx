// src/components/budgets/BudgetEditor.tsx
import React, { useState } from 'react';
import { useCategories } from '../../contexts/CategoryContext';
import { useBudgets } from '../../contexts/BudgetContext';
import CategoryDetailPane from './CategoryDetailPane';

const BudgetEditor: React.FC = () => {
  const { selectedBudgetId, budgets } = useBudgets();
  const { 
    categoryGroups, 
    categories, 
    selectedCategoryId,
    selectCategory,
    createCategoryGroup,
    createCategory,
    isLoading
  } = useCategories();
  
  const [isDetailPaneOpen, setIsDetailPaneOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newCategoryData, setNewCategoryData] = useState({
    groupId: '',
    name: '',
    targetAmount: ''
  });
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  
  const selectedBudget = budgets.find(budget => budget.id === selectedBudgetId);

  // Format number as currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleCategoryClick = (categoryId: string) => {
    selectCategory(categoryId);
    setIsDetailPaneOpen(true);
  };

  const handleDetailPaneClose = () => {
    setIsDetailPaneOpen(false);
  };

  const handleAddCategoryGroup = () => {
    if (!newGroupName.trim() || !selectedBudgetId) return;
    
    createCategoryGroup({
      name: newGroupName.trim(),
      budgetId: selectedBudgetId
    });
    
    setNewGroupName('');
    setShowAddGroup(false);
  };

  const handleAddCategory = () => {
    if (!newCategoryData.name.trim() || !newCategoryData.groupId || !selectedBudgetId) return;
    
    createCategory({
      name: newCategoryData.name.trim(),
      categoryGroupId: newCategoryData.groupId,
      targetAmount: parseFloat(newCategoryData.targetAmount) || 0
    });
    
    setNewCategoryData({
      groupId: '',
      name: '',
      targetAmount: ''
    });
    setShowAddCategory(false);
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Calculate totals for a category group
  const calculateGroupTotals = (groupId: string) => {
    const groupCategories = categories.filter(category => category.categoryGroupId === groupId);
    
    return {
      assigned: groupCategories.reduce((sum, cat) => sum + (cat.assigned || 0), 0),
      activity: groupCategories.reduce((sum, cat) => sum + (cat.activity || 0), 0),
      available: groupCategories.reduce((sum, cat) => sum + (cat.available || 0), 0)
    };
  };

  // Calculate budget totals
  const calculateBudgetTotals = () => {
    return {
      assigned: categories.reduce((sum, cat) => sum + (cat.assigned || 0), 0),
      activity: categories.reduce((sum, cat) => sum + (cat.activity || 0), 0),
      available: categories.reduce((sum, cat) => sum + (cat.available || 0), 0)
    };
  };

  // Get color for available amount
  const getAvailableColor = (amount: number): string => {
    if (amount < 0) return 'text-red-600';
    if (amount > 0) return 'text-green-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-500">Loading categories...</p>
      </div>
    );
  }

  if (!selectedBudget) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-500">Please select a budget to manage categories.</p>
      </div>
    );
  }

  const budgetTotals = calculateBudgetTotals();
  const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });

  return (
    <div className="relative">
      {/* Budget Summary */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{selectedBudget.name}</h2>
            <p className="text-sm text-gray-500">{currentMonth}</p>
          </div>
          <div className="mt-2 sm:mt-0 grid grid-cols-3 gap-6">
            <div>
              <span className="block text-xs text-gray-500">Assigned</span>
              <span className="font-medium text-green-600">{formatCurrency(budgetTotals.assigned)}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">Activity</span>
              <span className="font-medium text-purple-600">{formatCurrency(budgetTotals.activity)}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">Available</span>
              <span className={`font-medium ${getAvailableColor(budgetTotals.available)}`}>
                {formatCurrency(budgetTotals.available)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Filter categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex space-x-2 overflow-x-auto w-full sm:w-auto">
            <button className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-medium">
              All
            </button>
            <button className="hover:bg-gray-100 px-3 py-1 rounded text-sm font-medium text-gray-600">
              Underfunded
            </button>
            <button className="hover:bg-gray-100 px-3 py-1 rounded text-sm font-medium text-gray-600">
              Fixed Costs
            </button>
          </div>
        </div>
      </div>

      {/* Category Groups */}
      <div className="space-y-6">
        {categoryGroups.map(group => {
          const groupCategories = categories.filter(category => category.categoryGroupId === group.id);
          const groupTotals = calculateGroupTotals(group.id);
          const isCollapsed = collapsedGroups[group.id];
          
          return (
            <div key={group.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Group Header */}
              <div 
                className="bg-gray-50 px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleGroupCollapse(group.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="mr-2">
                      {isCollapsed ? (
                        <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">{group.name}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-right">
                      <span className="block text-xs text-gray-500">Assigned</span>
                      <span className="font-medium text-green-600">{formatCurrency(groupTotals.assigned)}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-gray-500">Activity</span>
                      <span className="font-medium text-purple-600">{formatCurrency(groupTotals.activity)}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-gray-500">Available</span>
                      <span className={`font-medium ${getAvailableColor(groupTotals.available)}`}>
                        {formatCurrency(groupTotals.available)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Categories */}
              {!isCollapsed && (
                <div className="divide-y divide-gray-200">
                  {groupCategories.length === 0 ? (
                    <div className="px-4 py-3 text-center text-gray-500 text-sm italic">
                      No categories in this group
                    </div>
                  ) : (
                    groupCategories.map(category => (
                      <div 
                        key={category.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                          selectedCategoryId === category.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-4 h-4 border border-gray-300 rounded mr-3 flex-shrink-0"></div>
                            <span className="font-medium text-gray-800">
                              {category.name}
                              <span className="ml-2 text-xs text-gray-400">
                                {category.targetAmount > 0 ? `Target: ${formatCurrency(category.targetAmount)}` : ''}
                              </span>
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-6">
                            <div className="text-right">
                              <span className="font-medium text-green-600">{formatCurrency(category.assigned || 0)}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-medium text-purple-600">{formatCurrency(category.activity || 0)}</span>
                            </div>
                            <div className="text-right">
                              <span className={`font-medium ${getAvailableColor(category.available || 0)}`}>
                                {formatCurrency(category.available || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Add new category button */}
                  <div className="px-4 py-2">
                    {showAddCategory && newCategoryData.groupId === group.id ? (
                      <div className="py-2 ml-7">
                        <div className="flex flex-col space-y-2">
                          <input
                            type="text"
                            placeholder="Category Name"
                            value={newCategoryData.name}
                            onChange={(e) => setNewCategoryData({...newCategoryData, name: e.target.value})}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              placeholder="Target Amount"
                              value={newCategoryData.targetAmount}
                              onChange={(e) => setNewCategoryData({...newCategoryData, targetAmount: e.target.value})}
                              className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setShowAddCategory(false);
                              setNewCategoryData({groupId: '', name: '', targetAmount: ''});
                            }}
                            className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddCategory}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setShowAddCategory(true);
                          setNewCategoryData({...newCategoryData, groupId: group.id});
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 ml-7"
                      >
                        + Add Category
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add New Category Group */}
        <div className="bg-white rounded-lg shadow-md p-4">
          {showAddGroup ? (
            <div>
              <input
                type="text"
                placeholder="Category Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowAddGroup(false);
                    setNewGroupName('');
                  }}
                  className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategoryGroup}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Group
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddGroup(true)}
              className="w-full py-2 flex items-center justify-center text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Category Group
            </button>
          )}
        </div>
      </div>

      {/* Detail Pane */}
      <CategoryDetailPane 
        isOpen={isDetailPaneOpen}
        onClose={handleDetailPaneClose}
      />
      
      {/* Overlay when detail pane is open */}
      {isDetailPaneOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-20"
          onClick={handleDetailPaneClose}
        />
      )}
    </div>
  );
};

export default BudgetEditor;