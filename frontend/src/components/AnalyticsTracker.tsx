import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsHelpers } from '../utils/analytics';

const pageNameMap: Record<string, string> = {
  '/': 'landing',
  '/app': 'dashboard',
  '/app/': 'dashboard',
  '/app/transactions': 'transactions',
  '/app/budgets': 'budgets',
  '/app/recurring': 'recurring_transactions',
  '/app/accounts': 'accounts',
  '/app/goals': 'savings_goals',
  '/app/reports': 'reports',
  '/app/settings': 'settings',
  '/login': 'login',
  // Legacy routes (for backwards compatibility)
  '/transactions': 'transactions',
  '/budgets': 'budgets',
  '/recurring': 'recurring_transactions',
  '/accounts': 'accounts',
  '/goals': 'savings_goals',
  '/reports': 'reports',
  '/settings': 'settings',
};

export const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const pageName = pageNameMap[location.pathname] || location.pathname;
    analyticsHelpers.logPageView(pageName);
  }, [location.pathname]);

  return null;
};


