// src/components/budgets/CategoryDetailPane.tsx
import React, { useState, useEffect } from 'react';
import { Category } from '../../types/category';
import { useCategories } from '../../contexts/CategoryContext';

interface CategoryDetailPaneProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryDetailPane: React.FC<CategoryDetailPaneProps> = ({ isOpen, onClose }) => {
  const { selectedCategoryId, getSelectedCategory, updateCategory } = useCategories();
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Format number as currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Load category data when selected category changes
  useEffect(() => {
    if (selectedCategoryId) {
      const selectedCategory = getSelectedCategory();
      setCategory(selectedCategory);
      
      if (selectedCategory) {
        setTargetAmount(selectedCategory.targetAmount.toString());
        setNote(selectedCategory.note || '');
      }
    } else {
      setCategory(undefined);
    }
  }, [selectedCategoryId, getSelectedCategory]);

  const handleSave = () => {
    if (!selectedCategoryId || !category) return;

    setIsSaving(true);
    
    const updatedData: Partial<Omit<Category, 'id'>> = {
      targetAmount: parseFloat(targetAmount) || 0,
      note: note
    };
    
    updateCategory(selectedCategoryId, updatedData);
    setIsSaving(false);
  };

  // If no category is selected or pane is closed, don't render
  if (!isOpen || !category) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-30"
         style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-lg font-medium text-gray-800">Category Details</h2>
            <p className="text-sm text-gray-500">{category.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Target Section */}
          <div className="mb-8">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">TARGET</h3>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="targetAmount"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Target: Monthly amount you want to budget
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Refill Up To Target Each Month</h4>
              <p className="text-xs text-gray-500">
                The target will reset each month. Any leftover amount from the previous month will reduce the amount needed in the current month.
              </p>
            </div>
          </div>

          {/* Summary Section */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-3">SUMMARY</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <p className="text-xs text-gray-500">Assigned</p>
                <p className="text-lg font-medium">{formatCurrency(category.assigned || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Activity</p>
                <p className="text-lg font-medium">{formatCurrency(category.activity || 0)}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-t border-b border-gray-200">
              <p className="text-sm font-medium">Available</p>
              <p className={`text-lg font-medium ${category.available && category.available < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(category.available || 0)}</p>
            </div>
          </div>
          
          {/* Notes Section */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-2">NOTES</h3>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Add a note about this category..."
            />
          </div>

          {/* Transactions Section - For Future Implementation */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">RECENT TRANSACTIONS</h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">See All</button>
            </div>
            <div className="bg-gray-50 rounded text-center py-4 px-2">
              <p className="text-sm text-gray-500">No transactions in this category</p>
            </div>
          </div>
        </div>
        
        {/* Footer with Save Button */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPane;