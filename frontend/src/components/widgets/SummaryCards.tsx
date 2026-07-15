import { useMemo } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/format';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, Eye, EyeOff, PiggyBank } from 'lucide-react';
import { useDemoBlur } from '../../context/DemoBlurContext';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  totalAvailableBalance: number;
  loading?: boolean;
  blurNumbers?: boolean;
  incomeChange?: number;
  expenseChange?: number;
  balanceChange?: number;
  onIncomeClick?: () => void;
  onExpenseClick?: () => void;
}

export const SummaryCards = ({
  totalIncome,
  totalExpense,
  totalAvailableBalance,
  loading,
  blurNumbers = false,
  incomeChange,
  expenseChange,
  balanceChange,
  onIncomeClick,
  onExpenseClick,
}: SummaryCardsProps) => {
  const { baseCurrency } = useCurrency();
  const { t } = useI18n();
  const { toggleBlur } = useDemoBlur();

  // Calcular taxa de poupança (savings rate)
  const savingsRate = useMemo(() => {
    if (totalIncome === 0) return 0;
    const netSavings = totalIncome - totalExpense;
    return (netSavings / totalIncome) * 100;
  }, [totalIncome, totalExpense]);

  // Calcular saldo líquido do mês
  const netBalance = useMemo(() => {
    return totalIncome - totalExpense;
  }, [totalIncome, totalExpense]);

  // Determinar status da saúde financeira baseado na taxa de poupança
  const financialHealthStatus = useMemo(() => {
    if (savingsRate >= 20) return { labelKey: 'healthExcellent' as const, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' };
    if (savingsRate >= 10) return { labelKey: 'healthGood' as const, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' };
    if (savingsRate >= 0) return { labelKey: 'healthAttention' as const, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' };
    return { labelKey: 'healthCritical' as const, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20' };
  }, [savingsRate]);

  if (loading) {
    return (
      <div className="mb-12">
        <div className="mb-10">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3 animate-pulse"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex-row justify-between items-center">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 sm:mb-12">
      {/* Saldo Principal - Minimalista */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
            {t.availableBalance}
          </p>
          {toggleBlur && (
            <button
              onClick={toggleBlur}
              className="p-1 hover:opacity-70 transition-opacity"
              aria-label={blurNumbers ? t.showValues : t.hideValues}
            >
              {blurNumbers ? (
                <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          )}
        </div>
        <p 
          className={`text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-gray-900 dark:text-white break-words ${blurNumbers ? 'demo-blur' : ''}`}
        >
          {blurNumbers ? '••••••' : formatCurrency(totalAvailableBalance, baseCurrency)}
        </p>
        {balanceChange !== undefined && balanceChange !== 0 && (
          <div className="flex items-center mt-3">
            {balanceChange > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <p className={`text-sm font-medium ml-2 ${
              balanceChange > 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {t.balanceVsLastMonth.replace('{percent}', Math.abs(balanceChange).toFixed(1))}
            </p>
          </div>
        )}
        
        {/* Taxa de Poupança */}
        {totalIncome > 0 && (
          <div className={`mt-4 p-3 rounded-lg ${financialHealthStatus.bgColor} border ${financialHealthStatus.color.replace('text-', 'border-')} border-opacity-30`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PiggyBank className={`h-4 w-4 ${financialHealthStatus.color}`} />
                <span className={`text-xs font-medium ${financialHealthStatus.color}`}>
                  {t.savingsRate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-light tracking-tight ${financialHealthStatus.color} ${blurNumbers ? 'demo-blur' : ''}`}>
                  {blurNumbers ? '•••' : `${savingsRate.toFixed(1)}%`}
                </span>
                <span className={`text-xs ${financialHealthStatus.color} opacity-75`}>
                  {t[financialHealthStatus.labelKey]}
                </span>
              </div>
            </div>
            {netBalance !== 0 && (
              <p className={`text-xs mt-1.5 ${blurNumbers ? 'demo-blur' : ''}`}>
                {blurNumbers ? '••••' : formatCurrency(Math.abs(netBalance), baseCurrency)}{' '}
                {netBalance >= 0 ? t.savingsSavedThisMonth : t.savingsOverspentThisMonth} {t.thisMonthSuffix}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Receitas e Despesas - Linha fina */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 lg:gap-0">
          <button
            onClick={onIncomeClick}
            disabled={!onIncomeClick}
            className={`flex-1 text-left ${onIncomeClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            aria-label={onIncomeClick ? t.viewAllIncome : undefined}
          >
            <div className="flex items-center mb-2">
              <ArrowUpCircle className="h-5 w-5 text-green-500" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300 ml-2">
                {t.totalIncome}
              </p>
            </div>
            <p 
              className={`text-2xl sm:text-3xl font-light text-gray-900 dark:text-white ${blurNumbers ? 'demo-blur' : ''}`}
            >
              {blurNumbers ? '••••' : formatCurrency(totalIncome, baseCurrency)}
            </p>
            {incomeChange !== undefined && incomeChange !== 0 && (
              <div className="flex items-center mt-2">
                {incomeChange > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
                <p className={`text-xs font-medium ml-1.5 ${
                  incomeChange > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {Math.abs(incomeChange).toFixed(1)}%
                </p>
              </div>
            )}
          </button>

          <div className="hidden sm:block w-px h-12 lg:h-16 bg-gray-200 dark:bg-gray-700 mx-4 lg:mx-6 flex-shrink-0" />

          <button
            onClick={onExpenseClick}
            disabled={!onExpenseClick}
            className={`flex-1 text-left ${onExpenseClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            aria-label={onExpenseClick ? t.viewAllExpenses : undefined}
          >
            <div className="flex items-center mb-2">
              <ArrowDownCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300 ml-2">
                {t.totalExpense}
              </p>
            </div>
            <p 
              className={`text-xl sm:text-2xl lg:text-3xl font-light text-gray-900 dark:text-white break-words ${blurNumbers ? 'demo-blur' : ''}`}
            >
              {blurNumbers ? '••••' : formatCurrency(totalExpense, baseCurrency)}
            </p>
            {expenseChange !== undefined && expenseChange !== 0 && (
              <div className="flex items-center mt-2">
                {expenseChange > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-green-500" />
                )}
                <p className={`text-xs font-medium ml-1.5 ${
                  expenseChange > 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {Math.abs(expenseChange).toFixed(1)}%
                </p>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


