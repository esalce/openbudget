// Types for our mock data
export interface Category {
    id: string;
    name: string;
    monthlyTargetAmount: number;
    availableBalance: number;
    activity: number;
  }
  
  export interface CategoryGroup {
    id: string;
    name: string;
    categories: Category[];
  }
  
  export interface Budget {
    id: string;
    name: string;
    currency: string;
    startDate: string;
    categoryGroups: CategoryGroup[];
  }
  
  export interface Transaction {
    id: string;
    date: string;
    amount: number;
    payee: string;
    categoryId: string | null;
    memo: string | null;
    cleared: boolean;
    transactionType: 'expense' | 'income' | 'transfer';
  }
  
  // Generate mock data
  export const mockBudgets: Budget[] = [
    {
      id: '1',
      name: 'Personal Budget',
      currency: 'USD',
      startDate: '2023-01-01',
      categoryGroups: [
        {
          id: '101',
          name: 'Immediate Obligations',
          categories: [
            {
              id: '1001',
              name: 'Rent/Mortgage',
              monthlyTargetAmount: 150000,
              availableBalance: 150000,
              activity: 0,
            },
            {
              id: '1002',
              name: 'Electric',
              monthlyTargetAmount: 15000,
              availableBalance: 15000,
              activity: 0,
            },
            {
              id: '1003',
              name: 'Water',
              monthlyTargetAmount: 5000,
              availableBalance: 5000,
              activity: 0,
            },
            {
              id: '1004',
              name: 'Internet',
              monthlyTargetAmount: 8000,
              availableBalance: 8000,
              activity: 0,
            },
            {
              id: '1005',
              name: 'Groceries',
              monthlyTargetAmount: 60000,
              availableBalance: 45000,
              activity: -15000,
            },
          ],
        },
        {
          id: '102',
          name: 'True Expenses',
          categories: [
            {
              id: '1006',
              name: 'Auto Maintenance',
              monthlyTargetAmount: 10000,
              availableBalance: 10000,
              activity: 0,
            },
            {
              id: '1007',
              name: 'Home Maintenance',
              monthlyTargetAmount: 10000,
              availableBalance: 10000,
              activity: 0,
            },
            {
              id: '1008',
              name: 'Medical',
              monthlyTargetAmount: 20000,
              availableBalance: 20000,
              activity: 0,
            },
          ],
        },
        {
          id: '103',
          name: 'Quality of Life',
          categories: [
            {
              id: '1009',
              name: 'Dining Out',
              monthlyTargetAmount: 30000,
              availableBalance: 18000,
              activity: -12000,
            },
            {
              id: '1010',
              name: 'Entertainment',
              monthlyTargetAmount: 20000,
              availableBalance: 15000,
              activity: -5000,
            },
            {
              id: '1011',
              name: 'Vacation',
              monthlyTargetAmount: 50000,
              availableBalance: 50000,
              activity: 0,
            },
          ],
        },
      ],
    },
    {
      id: '2',
      name: 'Business Budget',
      currency: 'USD',
      startDate: '2023-01-01',
      categoryGroups: [
        {
          id: '201',
          name: 'Operating Expenses',
          categories: [
            {
              id: '2001',
              name: 'Rent',
              monthlyTargetAmount: 100000,
              availableBalance: 100000,
              activity: 0,
            },
            {
              id: '2002',
              name: 'Utilities',
              monthlyTargetAmount: 25000,
              availableBalance: 25000,
              activity: 0,
            },
            {
              id: '2003',
              name: 'Software Subscriptions',
              monthlyTargetAmount: 20000,
              availableBalance: 15000,
              activity: -5000,
            },
          ],
        },
        {
          id: '202',
          name: 'Taxes',
          categories: [
            {
              id: '2004',
              name: 'Income Tax',
              monthlyTargetAmount: 200000,
              availableBalance: 200000,
              activity: 0,
            },
            {
              id: '2005',
              name: 'Sales Tax',
              monthlyTargetAmount: 50000,
              availableBalance: 50000,
              activity: 0,
            },
          ],
        },
      ],
    },
  ];
  
  export const mockTransactions: Transaction[] = [
    {
      id: '1',
      date: '2023-11-01',
      amount: 150000,
      payee: 'Landlord',
      categoryId: '1001',
      memo: 'November Rent',
      cleared: true,
      transactionType: 'expense',
    },
    {
      id: '2',
      date: '2023-11-02',
      amount: 15000,
      payee: 'Grocery Store',
      categoryId: '1005',
      memo: 'Weekly groceries',
      cleared: true,
      transactionType: 'expense',
    },
    {
      id: '3',
      date: '2023-11-05',
      amount: 12000,
      payee: 'Restaurant',
      categoryId: '1009',
      memo: 'Dinner with friends',
      cleared: true,
      transactionType: 'expense',
    },
    {
      id: '4',
      date: '2023-11-10',
      amount: 8000,
      payee: 'Internet Provider',
      categoryId: '1004',
      memo: 'Monthly internet',
      cleared: true,
      transactionType: 'expense',
    },
    {
      id: '5',
      date: '2023-11-15',
      amount: 5000,
      payee: 'Movie Theater',
      categoryId: '1010',
      memo: 'Movie night',
      cleared: true,
      transactionType: 'expense',
    },
    {
      id: '6',
      date: '2023-11-20',
      amount: 5000,
      payee: 'Software Company',
      categoryId: '2003',
      memo: 'Monthly subscription',
      cleared: true,
      transactionType: 'expense',
    },
    {
      id: '7',
      date: '2023-11-25',
      amount: 300000,
      payee: 'Employer',
      categoryId: null,
      memo: 'Salary',
      cleared: true,
      transactionType: 'income',
    },
  ];
  
  // Mock service functions
  export const mockBudgetService = {
    getBudgets: () => Promise.resolve(mockBudgets),
    getBudgetById: (id: string) => Promise.resolve(mockBudgets.find(b => b.id === id) || null),
  };
  
  export const mockTransactionService = {
    getTransactions: () => Promise.resolve(mockTransactions),
    getTransactionsByBudgetId: (budgetId: string) => Promise.resolve(mockTransactions),
    addTransaction: (transaction: Omit<Transaction, 'id'>) => 
      Promise.resolve({ id: Math.random().toString(36).substring(2, 9), ...transaction }),
    updateTransaction: (transaction: Transaction) => Promise.resolve(transaction),
    deleteTransaction: (id: string) => Promise.resolve(true),
  };
  
  // Helper functions
  export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount / 100);
  };