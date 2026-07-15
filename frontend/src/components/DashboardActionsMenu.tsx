import { useState } from 'react';
import { MoreVertical, Settings } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { useI18n } from '../context/I18nContext';

interface DashboardActionsMenuProps {
  onOpenConfig: () => void;
}

export const DashboardActionsMenu = ({
  onOpenConfig,
}: DashboardActionsMenuProps) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors h-full"
          aria-label={t.moreOptions}
        >
          <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-1"
          sideOffset={4}
          align="end"
        >
          <div className="py-1">
            <button
              onClick={() => {
                onOpenConfig();
                setOpen(false);
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
            >
              <Settings className="h-4 w-4 mr-3" aria-hidden="true" />
              <span>{t.configureWidgets}</span>
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

