import { useMemo } from 'react';
import { useI18n } from '../../context/I18nContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Trend {
  incomeChange: number;
  expenseChange: number;
  incomeTrend: 'up' | 'down' | 'stable';
  expenseTrend: 'up' | 'down' | 'stable';
}

interface TrendsWidgetProps {
  trend: Trend;
  blurNumbers?: boolean;
}

export const TrendsWidget = ({ trend, blurNumbers = false }: TrendsWidgetProps) => {
  const { t } = useI18n();

  // Determinar saúde geral da tendência
  const overallHealth = useMemo(() => {
    const incomeGood = trend.incomeTrend === 'up' || trend.incomeTrend === 'stable';
    const expenseGood = trend.expenseTrend === 'down' || trend.expenseTrend === 'stable';
    if (incomeGood && expenseGood) return { labelKey: 'healthExcellent' as const, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' };
    if (incomeGood || expenseGood) return { labelKey: 'healthGood' as const, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' };
    return { labelKey: 'healthAttention' as const, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' };
  }, [trend]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 flex flex-col">
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h2 className="text-base sm:text-lg lg:text-xl font-light tracking-tight text-gray-900 dark:text-gray-100">
          {t.trends}
        </h2>
        <span className={`text-xs font-medium px-2 py-1 rounded flex-shrink-0 ${overallHealth.bgColor} ${overallHealth.color}`}>
          {t[overallHealth.labelKey]}
        </span>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        <div className="p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between mb-1 gap-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{t.totalIncome}</span>
            <div className="flex items-center flex-shrink-0">
              {trend.incomeTrend === 'up' && (
                <>
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 dark:text-green-400 mr-1.5 sm:mr-2" />
                  <span className={`text-xs sm:text-sm font-light tracking-tight text-green-600 dark:text-green-400 whitespace-nowrap ${blurNumbers ? 'demo-blur' : ''}`}>
                    +{Math.abs(trend.incomeChange).toFixed(1)}%
                  </span>
                </>
              )}
              {trend.incomeTrend === 'down' && (
                <>
                  <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 dark:text-red-400 mr-1.5 sm:mr-2" />
                  <span className={`text-xs sm:text-sm font-light tracking-tight text-red-600 dark:text-red-400 whitespace-nowrap ${blurNumbers ? 'demo-blur' : ''}`}>
                    -{Math.abs(trend.incomeChange).toFixed(1)}%
                  </span>
                </>
              )}
              {trend.incomeTrend === 'stable' && (
                <>
                  <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 mr-1.5 sm:mr-2" />
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">{t.noChange}</span>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t.comparedToLastMonth}
          </p>
        </div>
        
        <div className="p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{t.totalExpense}</span>
            <div className="flex items-center flex-shrink-0">
              {trend.expenseTrend === 'up' && (
                <>
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 dark:text-red-400 mr-1.5 sm:mr-2" />
                  <span className={`text-xs sm:text-sm font-light tracking-tight text-red-600 dark:text-red-400 whitespace-nowrap ${blurNumbers ? 'demo-blur' : ''}`}>
                    +{Math.abs(trend.expenseChange).toFixed(1)}%
                  </span>
                </>
              )}
              {trend.expenseTrend === 'down' && (
                <>
                  <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 dark:text-green-400 mr-1.5 sm:mr-2" />
                  <span className={`text-xs sm:text-sm font-light tracking-tight text-green-600 dark:text-green-400 whitespace-nowrap ${blurNumbers ? 'demo-blur' : ''}`}>
                    -{Math.abs(trend.expenseChange).toFixed(1)}%
                  </span>
                </>
              )}
              {trend.expenseTrend === 'stable' && (
                <>
                  <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 mr-1.5 sm:mr-2" />
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">{t.noChange}</span>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t.comparedToLastMonth}
          </p>
        </div>
      </div>

      {/* Resumo da tendência */}
      {trend.incomeTrend === 'up' && trend.expenseTrend === 'down' && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-300">
            {t.trendGreat}
          </p>
        </div>
      )}
      {trend.incomeTrend === 'down' && trend.expenseTrend === 'up' && (
        <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            {t.trendAttention}
          </p>
        </div>
      )}
    </div>
  );
};


