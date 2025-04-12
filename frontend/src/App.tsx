// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Budget from './pages/Budget';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { BudgetProvider } from './contexts/BudgetContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { AccountProvider } from './contexts/AccountContext';

const App: React.FC = () => {
  return (
    <BudgetProvider>
      <AccountProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 bg-gray-50">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/budget" element={
                    <CategoryProvider>
                      <Budget />
                    </CategoryProvider>
                  } />
                  <Route path="/budget/:budgetId" element={
                    <CategoryProvider>
                      <Budget />
                    </CategoryProvider>
                  } />
                  <Route path="/accounts" element={<Accounts />} />
                  <Route path="/accounts/:accountId" element={<Accounts />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
            <Footer />
          </div>
        </Router>
      </AccountProvider>
    </BudgetProvider>
  );
};

export default App;