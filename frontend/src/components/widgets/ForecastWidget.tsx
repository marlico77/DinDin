import { useMemo } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/format';
import { TrendingUp, AlertCircle, Info } from 'lucide-react';

interface Forecast {
  predictedIncome: number;
  predictedExpense: number;
  predictedBalance: number;
}

interface ForecastWidgetProps {
  forecast: Forecast;
  blurNumbers?: boolean;
}

export const ForecastWidget = ({ forecast, blurNumbers = false }: ForecastWidgetProps) => {
  const { baseCurrency } = useCurrency();
  const { t } = useI18n();

  // Calcular taxa de poupança projetada
  const projectedSavingsRate = useMemo(() => {
    if (forecast.predictedIncome === 0) return 0;
    return (forecast.predictedBalance / forecast.predictedIncome) * 100;
  }, [forecast]);

  // Determinar status da projeção
  const forecastStatus = useMemo(() => {
    if (forecast.predictedBalance >= 0 && projectedSavingsRate >= 20) {
      return { 
        type: 'excellent', 
        icon: TrendingUp, 
        message: t.forecastExcellentMessage,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800'
      };
    }
    if (forecast.predictedBalance >= 0 && projectedSavingsRate >= 10) {
      return { 
        type: 'good', 
        icon: TrendingUp, 
        message: t.forecastGoodMessage,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800'
      };
    }
    if (forecast.predictedBalance >= 0) {
      return { 
        type: 'warning', 
        icon: AlertCircle, 
        message: t.forecastWarningMessage,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800'
      };
    }
    return { 
      type: 'critical', 
      icon: AlertCircle, 
      message: t.forecastCriticalMessage,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    };
  }, [forecast, projectedSavingsRate, t]);

  const StatusIcon = forecastStatus.icon;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg lg:text-xl font-light tracking-tight text-gray-900 dark:text-gray-100">
          {t.forecast}
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">{t.forecastNextMonth}</span>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.predictedIncome}</div>
            <div className={`text-base sm:text-lg font-light tracking-tight text-green-600 dark:text-green-400 break-words ${blurNumbers ? 'demo-blur' : ''}`}>
              {blurNumbers ? '••••' : formatCurrency(forecast.predictedIncome, baseCurrency)}
            </div>
          </div>
          <div className="p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t.predictedExpense}</div>
            <div className={`text-base sm:text-lg font-light tracking-tight text-red-600 dark:text-red-400 break-words ${blurNumbers ? 'demo-blur' : ''}`}>
              {blurNumbers ? '••••' : formatCurrency(forecast.predictedExpense, baseCurrency)}
            </div>
          </div>
        </div>

        <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-2">
            <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{t.predictedBalance}</div>
            {forecast.predictedIncome > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {blurNumbers ? '••' : `${projectedSavingsRate.toFixed(1)}%`} {t.forecastSavingsRate}
              </div>
            )}
          </div>
          <div
            className={`text-xl sm:text-2xl font-light tracking-tight break-words ${
              forecast.predictedBalance >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            } ${blurNumbers ? 'demo-blur' : ''}`}
          >
            {blurNumbers ? '••••' : formatCurrency(forecast.predictedBalance, baseCurrency)}
          </div>
        </div>

        {/* Status da projeção */}
        <div className={`mt-4 p-3 rounded-lg border ${forecastStatus.bgColor} ${forecastStatus.borderColor}`}>
          <div className="flex items-start gap-2">
            <StatusIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${forecastStatus.color}`} />
            <p className={`text-xs ${forecastStatus.color}`}>
              {forecastStatus.message}
            </p>
          </div>
        </div>

        {/* Nota sobre projeção */}
        <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <p>
            {t.forecastNote}
          </p>
        </div>
      </div>
    </div>
  );
};


