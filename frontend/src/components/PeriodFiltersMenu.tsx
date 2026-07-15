import { useState } from 'react';
import { Calendar } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { useI18n } from '../context/I18nContext';

interface PeriodFiltersMenuProps {
  periodFilter: 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear' | 'custom';
  onPeriodFilter: (period: 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear') => void;
}

export const PeriodFiltersMenu = ({
  periodFilter,
  onPeriodFilter,
}: PeriodFiltersMenuProps) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const periods = [
    { id: 'thisMonth' as const, label: t.thisMonth },
    { id: 'lastMonth' as const, label: t.lastMonth },
    { id: 'thisQuarter' as const, label: t.thisQuarter },
    { id: 'thisYear' as const, label: t.thisYear },
  ];

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="inline-flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          aria-label={t.periodFilters}
        >
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-[100] p-1"
          sideOffset={4}
          align="end"
        >
          <div className="py-1">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => {
                  onPeriodFilter(period.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center px-4 py-2 text-sm text-left rounded-sm focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${
                  periodFilter === period.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{period.label}</span>
                {periodFilter === period.id && (
                  <span className="ml-auto text-primary-600 dark:text-primary-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

