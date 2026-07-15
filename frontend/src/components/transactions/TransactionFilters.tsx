import { DateRangePicker, type DateRange } from '../DateRangePicker';
import CategoryCombobox from '../CategoryCombobox';
import SelectCombobox from '../SelectCombobox';
import { X } from 'lucide-react';
import { TransactionType } from '../../lib/enums';
import { TransactionSearchBar } from '../shared';

interface TransactionFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  dateRange: DateRange;
  tempDateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onDateRangeApply: (range: DateRange) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  paidFilter: string;
  onPaidFilterChange: (value: string) => void;
  activeTab: 'transactions' | 'scheduled';
  householdId?: string;
  t: Record<string, string>;
  locale: string;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  disabled?: boolean;
}

export const TransactionFilters = ({
  searchInput,
  onSearchChange,
  dateRange: _dateRange,
  tempDateRange,
  onDateRangeChange,
  onDateRangeApply,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  paidFilter,
  onPaidFilterChange,
  activeTab,
  householdId,
  t,
  locale: _locale,
  onClearFilters,
  hasActiveFilters,
  disabled = false,
}: TransactionFiltersProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
      <div className="space-y-4">
        {/* Primeira linha: Busca e Data (Data oculta na aba Próximos agendamentos) */}
        <div className={`grid gap-4 ${activeTab === 'scheduled' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
          <div className={activeTab === 'scheduled' ? '' : 'md:col-span-2'}>
            <TransactionSearchBar
              value={searchInput}
              onChange={onSearchChange}
              placeholder={t.search}
              disabled={disabled}
            />
          </div>
          {activeTab !== 'scheduled' && (
            <div className="flex gap-2">
              <div className="flex-1">
                <DateRangePicker
                  value={tempDateRange}
                  onChange={onDateRangeChange}
                  applyImmediately={false}
                  onApply={onDateRangeApply}
                  disabled={disabled}
                />
              </div>
              <button
                type="button"
                onClick={() => onDateRangeApply(tempDateRange)}
                disabled={disabled || (!tempDateRange.startDate && !tempDateRange.endDate)}
                className="px-4 py-2 h-10 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.filter}
              </button>
            </div>
          )}
        </div>

        {/* Segunda linha: Filtros de Tipo, Categoria e Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.type}
            </label>
            <SelectCombobox
              value={typeFilter}
              onValueChange={onTypeFilterChange}
              options={[
                { value: 'todos', label: t.all },
                { value: TransactionType.INCOME, label: t.income },
                { value: TransactionType.EXPENSE, label: t.expense },
              ]}
              placeholder={t.allTypes || t.all}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.category}
            </label>
            <CategoryCombobox
              value={categoryFilter === 'todas' || categoryFilter === '' ? '' : categoryFilter}
              onValueChange={(value) => {
                if (!value || value === t.all) onCategoryFilterChange('todas');
                else onCategoryFilterChange(value);
              }}
              placeholder={t.all}
              showAllOption={true}
              allOptionLabel={t.all}
              householdId={householdId}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.paymentStatus}
            </label>
            <SelectCombobox
              value={paidFilter}
              onValueChange={onPaidFilterChange}
              options={[
                { value: 'todos', label: t.all },
                { value: 'paid', label: t.paid },
                { value: 'pending', label: t.pending },
              ]}
              placeholder={t.allStatus || t.all}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          disabled={disabled}
          className={`mt-3 inline-flex items-center text-sm text-gray-500 dark:text-gray-400 ${
            disabled ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <X className="h-4 w-4 mr-1" />
          {t.clearFilters}
        </button>
      )}
    </div>
  );
};
