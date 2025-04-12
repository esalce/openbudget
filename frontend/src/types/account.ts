// src/types/account.ts
export enum AccountType {
    CASH = 'cash',
    CREDIT = 'credit',
    LOAN = 'loan',
    TRACKING = 'tracking'
  }
  
  export enum AccountGroup {
    BUDGET = 'budget',
    TRACKING = 'tracking'
  }
  
  export interface Account {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    group: AccountGroup; // Whether it's on budget or off budget
    createdAt: Date;
    updatedAt: Date;
  }