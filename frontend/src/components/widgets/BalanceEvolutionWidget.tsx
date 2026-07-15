import { useCurrency } from '../../context/CurrencyContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/format';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BalanceEvolutionWidgetProps {
  balanceEvolution: Array<{ month: string; saldoAcumulado: number }>;
  totalAvailableBalance: number;
  blurNumbers?: boolean;
}

export const BalanceEvolutionWidget = ({
  balanceEvolution,
  totalAvailableBalance,
  blurNumbers = false,
}: BalanceEvolutionWidgetProps) => {
  const { baseCurrency } = useCurrency();
  const { t } = useI18n();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 flex flex-col">
      <h2 className="text-base sm:text-lg lg:text-xl font-light tracking-tight text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
        {t.balanceEvolution}
      </h2>
      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
        {t.balanceEvolutionDescription}
      </p>
      <ResponsiveContainer
        width="100%"
        height={200}
        className="sm:h-[250px] lg:h-[300px]"
      >
        <AreaChart data={balanceEvolution}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="0" 
            stroke="#e5e7eb" 
            strokeOpacity={0.3}
            vertical={false}
          />
          <XAxis 
            dataKey="month" 
            stroke="#9ca3af"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#9ca3af"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) =>
              formatCurrency(value, baseCurrency)
            }
            labelFormatter={(label) => `${t.monthLabel} ${label}`}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              padding: '12px',
            }}
            labelStyle={{
              color: '#374151',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="saldoAcumulado"
            stroke="#0ea5e9"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorBalance)"
            name={t.accumulatedBalance}
          />
        </AreaChart>
      </ResponsiveContainer>
      {balanceEvolution.length > 0 && (
        <div className={`mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm ${blurNumbers ? 'demo-blur' : ''}`}>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.currentBalance}
            </span>
            <span className="text-base font-light tracking-tight text-gray-900 dark:text-gray-100">
              {formatCurrency(totalAvailableBalance, baseCurrency)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.projectedYearEnd}
            </span>
            <span
              className={`text-base font-light tracking-tight ${
                balanceEvolution[balanceEvolution.length - 1]?.saldoAcumulado >=
                0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatCurrency(
                balanceEvolution[balanceEvolution.length - 1]?.saldoAcumulado ||
                  0,
                baseCurrency
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};


