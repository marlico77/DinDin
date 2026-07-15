import { useCurrency } from '../../context/CurrencyContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthlyComparisonWidgetProps {
  monthlyComparison: Array<{
    month: string;
    receita: number;
    despesa: number;
  }>;
  canGoBack: boolean;
  canGoForward: boolean;
  onPreviousMonths: () => void;
  onNextMonths: () => void;
  onResetToCurrent: () => void;
  blurNumbers?: boolean;
}

export const MonthlyComparisonWidget = ({
  monthlyComparison,
  canGoBack,
  canGoForward,
  onPreviousMonths,
  onNextMonths,
  onResetToCurrent,
  blurNumbers = false,
}: MonthlyComparisonWidgetProps) => {
  const { baseCurrency } = useCurrency();
  const { t } = useI18n();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg lg:text-xl font-light tracking-tight text-gray-900 dark:text-gray-100">
          {t.monthlyComparison}
        </h2>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onPreviousMonths}
            disabled={!canGoBack}
            className={`p-1.5 sm:p-2 rounded-md border transition-colors ${
              canGoBack
                ? 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
            }`}
            title={t.previousMonths}
            aria-label={t.previousMonths}
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button
            onClick={onResetToCurrent}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors whitespace-nowrap"
            title={t.currentMonth}
            aria-label={t.currentMonth}
          >
            {t.currentMonth}
          </button>
          <button
            onClick={onNextMonths}
            disabled={!canGoForward}
            className={`p-1.5 sm:p-2 rounded-md border transition-colors ${
              canGoForward
                ? 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
            }`}
            title={t.nextMonths}
            aria-label={t.nextMonths}
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
      <ResponsiveContainer
        width="100%"
        height={200}
        className={`sm:h-[250px] lg:h-[300px] ${blurNumbers ? 'demo-blur' : ''}`}
      >
        <BarChart data={monthlyComparison}>
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
          <Bar 
            dataKey="receita" 
            fill="#10b981" 
            name={t.totalIncome}
            radius={[8, 8, 0, 0]}
          />
          <Bar 
            dataKey="despesa" 
            fill="#ef4444" 
            name={t.totalExpense}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


