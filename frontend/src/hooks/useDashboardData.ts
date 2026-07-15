import { useMemo } from 'react';
import { useTransactions } from '../context/TransactionsContext';
import {
  getLiquidatedTransactions,
  getFutureTransactions,
} from '../utils/calculations';
import { format } from 'date-fns';
import { AccountType, TransactionType } from '../lib/enums';
import { useDashboardOverview } from './api/useTransactions';
import { useDefaultHousehold } from './useDefaultHousehold';

// Helper function para verificar se uma conta é cartão de crédito
const isCreditCard = (accountType: string | AccountType | undefined): boolean => {
  return accountType === AccountType.CREDIT || accountType === 'CREDIT' || accountType === 'credit';
};

/**
 * Main dashboard data hook - uses the new optimized backend endpoint
 * All calculations are done server-side for accuracy and performance
 */
export function useDashboardData(selectedMonth: Date) {
  const { householdId } = useDefaultHousehold();
  const monthStr = format(selectedMonth, 'yyyy-MM');

  // Fetch all dashboard data from the new optimized endpoint
  const { data: dashboardData, isLoading } = useDashboardOverview({
    householdId: householdId || undefined,
    month: monthStr,
  });

  // Extract data from response with fallbacks
  const totalIncome = dashboardData?.summary?.totalIncome ?? 0;
  const totalExpense = dashboardData?.summary?.totalExpense ?? 0;
  
  // Convert categoryBreakdown to the format expected by components
  const categoryData = useMemo(() => {
    if (!dashboardData?.categoryBreakdown) return [];
    return dashboardData.categoryBreakdown.map(cat => ({
      name: cat.name,
      receita: cat.income,
      despesa: cat.expense,
      total: cat.total,
    }));
  }, [dashboardData?.categoryBreakdown]);

  const incomeByCategory = useMemo(
    () =>
      categoryData
        .filter((c) => c.receita > 0)
        .map((c) => ({ name: c.name, value: c.receita })),
    [categoryData]
  );

  const expenseByCategory = useMemo(
    () =>
      categoryData
        .filter((c) => c.despesa > 0)
        .map((c) => ({ name: c.name, value: c.despesa })),
    [categoryData]
  );

  // Trend data from backend
  const incomeChange = dashboardData?.trend?.incomeChange ?? 0;
  const expenseChange = dashboardData?.trend?.expenseChange ?? 0;
  const balanceChange = dashboardData?.trend?.balanceChange ?? 0;

  return {
    // Summary
    totalIncome,
    totalExpense,
    // Category data
    categoryData,
    incomeByCategory,
    expenseByCategory,
    // Trends
    incomeChange,
    expenseChange,
    balanceChange,
    // Loading state
    isLoading,
    // Raw data for advanced use
    dashboardData,
  };
}

/**
 * Dashboard forecast - uses the new backend endpoint
 */
export function useDashboardForecast(selectedMonth: Date) {
  const { householdId } = useDefaultHousehold();
  const monthStr = format(selectedMonth, 'yyyy-MM');

  const { data: dashboardData } = useDashboardOverview({
    householdId: householdId || undefined,
    month: monthStr,
  });

  return dashboardData?.forecast ?? {
    predictedIncome: 0,
    predictedExpense: 0,
    predictedBalance: 0,
  };
}

/**
 * Dashboard trend - uses the new backend endpoint
 */
export function useDashboardTrend(selectedMonth: Date, _totalIncome: number, _totalExpense: number) {
  const { householdId } = useDefaultHousehold();
  const monthStr = format(selectedMonth, 'yyyy-MM');

  const { data: dashboardData } = useDashboardOverview({
    householdId: householdId || undefined,
    month: monthStr,
  });

  return dashboardData?.trend ?? {
    incomeChange: 0,
    expenseChange: 0,
    incomeTrend: 'stable' as const,
    expenseTrend: 'stable' as const,
  };
}

/**
 * Account balances - still uses local context as accounts are managed locally
 * The backend keeps account.balance updated, so we use that as source of truth
 */
export function useAccountBalances() {
  const { transactions, accounts } = useTransactions();

  const liquidatedTransactions = useMemo(
    () => getLiquidatedTransactions(transactions),
    [transactions]
  );

  const futureTransactions = useMemo(
    () => getFutureTransactions(transactions),
    [transactions]
  );

  const accountBalances = useMemo(() => {
    const balances: Record<string, number> = {};

    // Usar o account.balance do backend como fonte de verdade
    accounts.forEach((account) => {
      const accountId = account.id || '';
      const initialBalance =
        account.balance != null ? Number(account.balance) : 0;
      balances[accountId] = isNaN(initialBalance) ? 0 : initialBalance;
    });

    // Para transações sem conta
    const NO_ACCOUNT_ID = '__no_account__';
    balances[NO_ACCOUNT_ID] = 0;

    liquidatedTransactions.forEach((transaction) => {
      const accountId = transaction.accountId || NO_ACCOUNT_ID;

      if (accountId === NO_ACCOUNT_ID) {
        if (transaction.type === TransactionType.INCOME) {
          balances[NO_ACCOUNT_ID] += transaction.amount || 0;
        } else {
          balances[NO_ACCOUNT_ID] -= transaction.amount || 0;
        }
      }
    });

    return balances;
  }, [accounts, liquidatedTransactions]);

  const projectedAccountBalances = useMemo(() => {
    const balances = { ...accountBalances };

    futureTransactions.forEach((transaction) => {
      if (
        transaction.accountId &&
        balances[transaction.accountId] !== undefined
      ) {
        const account = accounts.find((a) => a.id === transaction.accountId);

        if (isCreditCard(account?.type)) {
          if (transaction.type === TransactionType.EXPENSE) {
            balances[transaction.accountId] += transaction.amount;
          } else {
            balances[transaction.accountId] -= transaction.amount;
          }
        } else {
          if (transaction.type === TransactionType.INCOME) {
            balances[transaction.accountId] += transaction.amount;
          } else {
            balances[transaction.accountId] -= transaction.amount;
          }
        }
      }
    });

    return balances;
  }, [accountBalances, futureTransactions, accounts]);

  const totalAvailableBalance = useMemo(() => {
    const NO_ACCOUNT_ID = '__no_account__';
    
    return Object.entries(accountBalances).reduce(
      (sum, [accountId, balance]) => {
        if (accountId === NO_ACCOUNT_ID) return sum;
        
        const account = accounts.find((a) => a.id === accountId);
        if (isCreditCard(account?.type)) return sum;
        
        return sum + balance;
      },
      0
    );
  }, [accountBalances, accounts]);

  const totalProjectedBalance = useMemo(() => {
    const NO_ACCOUNT_ID = '__no_account__';
    return Object.entries(projectedAccountBalances).reduce(
      (sum, [accountId, balance]) => {
        if (accountId === NO_ACCOUNT_ID) return sum;
        
        const account = accounts.find((a) => a.id === accountId);
        if (isCreditCard(account?.type)) return sum;
        
        return sum + balance;
      },
      0
    );
  }, [projectedAccountBalances, accounts]);

  return {
    accountBalances,
    projectedAccountBalances,
    totalAvailableBalance,
    totalProjectedBalance,
  };
}

/**
 * Fixed vs Variable expenses - uses the new backend endpoint
 */
export function useFixedVsVariable(selectedMonth: Date) {
  const { householdId } = useDefaultHousehold();
  const monthStr = format(selectedMonth, 'yyyy-MM');

  const { data: dashboardData } = useDashboardOverview({
    householdId: householdId || undefined,
    month: monthStr,
  });

  return dashboardData?.fixedVsVariable ?? {
    fixed: 0,
    variable: 0,
    fixedPercentage: 0,
    variablePercentage: 0,
  };
}

/**
 * Budget vs Realized - uses the new backend endpoint
 */
export function useBudgetVsRealized(selectedMonth: Date) {
  const { householdId } = useDefaultHousehold();
  const monthStr = format(selectedMonth, 'yyyy-MM');

  const { data: dashboardData } = useDashboardOverview({
    householdId: householdId || undefined,
    month: monthStr,
  });

  return dashboardData?.budgetVsRealized ?? [];
}

/**
 * Monthly Comparison - uses the new backend endpoint
 */
export function useMonthlyComparison(selectedMonth: Date) {
  const { householdId } = useDefaultHousehold();
  const monthStr = format(selectedMonth, 'yyyy-MM');

  const { data: dashboardData } = useDashboardOverview({
    householdId: householdId || undefined,
    month: monthStr,
  });

  return dashboardData?.monthlyComparison ?? [];
}

/**
 * Balance Evolution - uses the new backend endpoint
 */
export function useBalanceEvolution(selectedMonth: Date) {
  const { householdId } = useDefaultHousehold();
  const monthStr = format(selectedMonth, 'yyyy-MM');

  const { data: dashboardData } = useDashboardOverview({
    householdId: householdId || undefined,
    month: monthStr,
  });

  return dashboardData?.balanceEvolution ?? [];
}