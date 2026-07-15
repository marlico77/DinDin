import { DatePicker } from '../DatePicker';
import { PeriodFiltersMenu } from '../PeriodFiltersMenu';
import { Tooltip } from '../Tooltip';
import { RotateCcw } from 'lucide-react';
import { startOfMonth } from 'date-fns';

interface DashboardFiltersProps {
  selectedMonth: Date;
  periodFilter: 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear' | 'custom';
  onMonthChange: (date: Date) => void;
  onPeriodFilter: (period: 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear') => void;
  onBackToCurrentMonth: () => void;
  isCurrentMonth: boolean;
  t: Record<string, string>;
}

export const DashboardFilters = ({
  selectedMonth,
  periodFilter,
  onMonthChange,
  onPeriodFilter,
  onBackToCurrentMonth,
  isCurrentMonth,
  t,
}: DashboardFiltersProps) => {
  return (
    <div className="flex flex-row gap-2 items-center w-full sm:w-auto" role="group" aria-label={t.periodFilters}>
      {/* Desktop: mostra todos os botões */}
      <div className="hidden sm:flex flex-wrap gap-2" role="group" aria-label={t.quickPeriods}>
        <button
          onClick={() => onPeriodFilter('thisMonth')}
          className={`px-3 py-2.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            periodFilter === 'thisMonth'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
          aria-pressed={periodFilter === 'thisMonth'}
          aria-label={`${t.filter} ${t.thisMonth}`}
        >
          {t.thisMonth}
        </button>
        <button
          onClick={() => onPeriodFilter('lastMonth')}
          className={`px-3 py-2.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            periodFilter === 'lastMonth'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
          aria-pressed={periodFilter === 'lastMonth'}
          aria-label={`${t.filter} ${t.lastMonth}`}
        >
          {t.lastMonth}
        </button>
        <button
          onClick={() => onPeriodFilter('thisQuarter')}
          className={`px-3 py-2.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            periodFilter === 'thisQuarter'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
          aria-pressed={periodFilter === 'thisQuarter'}
          aria-label={`${t.filter} ${t.thisQuarter}`}
        >
          {t.thisQuarter}
        </button>
        <button
          onClick={() => onPeriodFilter('thisYear')}
          className={`px-3 py-2.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            periodFilter === 'thisYear'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
          aria-pressed={periodFilter === 'thisYear'}
          aria-label={`${t.filter} ${t.thisYear}`}
        >
          {t.thisYear}
        </button>
      </div>
      
      {/* Mobile: mostra apenas o menu de filtros */}
      <div className="sm:hidden flex-shrink-0">
        <PeriodFiltersMenu
          periodFilter={periodFilter}
          onPeriodFilter={onPeriodFilter}
        />
      </div>

      {/* Seletor de mês */}
      <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-0">
        <DatePicker
          value={selectedMonth}
          onChange={(date) => {
            if (date) {
              onMonthChange(startOfMonth(date));
            }
          }}
          placeholder={t.selectMonth || t.month}
          className="w-full sm:w-auto min-w-[140px]"
        />
        <span id="month-selector-description" className="sr-only">
          {t.selectMonthDescription}
        </span>
        {!isCurrentMonth && (
          <Tooltip content={t.backToCurrentMonth}>
            <button
              onClick={onBackToCurrentMonth}
              className="inline-flex items-center justify-center px-2 sm:px-3 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex-shrink-0"
              aria-label={t.backToCurrentMonth}
            >
              <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
