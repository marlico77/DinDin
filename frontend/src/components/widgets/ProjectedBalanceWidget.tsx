import { useMemo } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/format';
import { TrendingUp, TrendingDown, Info, AlertCircle } from 'lucide-react';

interface ProjectedBalanceWidgetProps {
  totalProjectedBalance: number;
  totalAvailableBalance: number;
  blurNumbers?: boolean;
}

export const ProjectedBalanceWidget = ({
  totalProjectedBalance,
  totalAvailableBalance,
  blurNumbers = false,
}: ProjectedBalanceWidgetProps) => {
  const { baseCurrency } = useCurrency();
  const { t } = useI18n();

  const difference = totalProjectedBalance - totalAvailableBalance;
  const differencePercentage = useMemo(() => {
    if (totalAvailableBalance === 0) return 0;
    return (difference / Math.abs(totalAvailableBalance)) * 100;
  }, [difference, totalAvailableBalance]);

  // Determinar status da projeção
  const projectionStatus = useMemo(() => {
    const pct = Math.abs(differencePercentage).toFixed(1);
    if (difference > 0 && differencePercentage > 10) {
      return {
        type: 'positive',
        message: t.projectionIncrease.replace('{percent}', pct),
        icon: TrendingUp,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
      };
    }
    if (difference < 0 && Math.abs(differencePercentage) > 10) {
      return {
        type: 'negative',
        message: t.projectionDecrease.replace('{percent}', pct),
        icon: TrendingDown,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
      };
    }
    if (totalProjectedBalance < 0) {
      return {
        type: 'critical',
        message: t.projectionNegative,
        icon: AlertCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
      };
    }
    return null;
  }, [difference, differencePercentage, totalProjectedBalance, t]);

  const StatusIcon = projectionStatus?.icon;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 flex flex-col">
      <div className="flex items-center justify-between mb-2 gap-2">
        <h2 className="text-base sm:text-lg lg:text-xl font-light tracking-tight text-gray-900 dark:text-gray-100">
          {t.projectedBalance}
        </h2>
        {projectionStatus && StatusIcon && (
          <StatusIcon className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${projectionStatus.color}`} />
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
        {t.projectedBalanceDescription}
      </p>
      
      <div className="mb-3 sm:mb-4">
        <div
          className={`text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight mb-2 break-words ${
            totalProjectedBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          } ${blurNumbers ? 'demo-blur' : ''}`}
        >
          {blurNumbers ? '••••••' : formatCurrency(totalProjectedBalance, baseCurrency)}
        </div>
        
        {/* Saldo atual para comparação */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <span>{t.currentBalanceLabel}</span>
          <span className={`font-medium ${blurNumbers ? 'demo-blur' : ''}`}>
            {blurNumbers ? '••••' : formatCurrency(totalAvailableBalance, baseCurrency)}
          </span>
        </div>
      </div>

      {/* Diferença */}
      {difference !== 0 && (
        <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.projectedDifference}</span>
            <span
              className={`text-xs sm:text-sm font-light tracking-tight whitespace-nowrap ${
                difference >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              } ${blurNumbers ? 'demo-blur' : ''}`}
            >
              {difference >= 0 ? '+' : ''}
              {blurNumbers ? '••••' : formatCurrency(difference, baseCurrency)}
            </span>
          </div>
        </div>
      )}

      {/* Status da projeção */}
      {projectionStatus && (
        <div className={`mt-4 p-3 rounded-lg ${projectionStatus.bgColor} border ${projectionStatus.color.replace('text-', 'border-')} border-opacity-30`}>
          <p className={`text-xs ${projectionStatus.color}`}>
            {projectionStatus.message}
          </p>
        </div>
      )}

      {/* Informação adicional */}
      <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
        <p>{t.projectedBalanceInfo}</p>
      </div>
    </div>
  );
};


