import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { useI18n } from '../context/I18nContext';
import { Budget } from '../types';

interface BudgetActionsMenuProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export const BudgetActionsMenu = ({
  budget,
  onEdit,
  onDelete,
}: BudgetActionsMenuProps) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const handleEdit = () => {
    onEdit(budget);
    setOpen(false);
  };

  const handleDelete = () => {
    if (budget.id) {
      onDelete(budget.id);
      setOpen(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded p-1 transition-colors"
          aria-label={t.moreOptions || 'Mais opções'}
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
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
              onClick={handleEdit}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
            >
              <Edit className="h-4 w-4 mr-3" aria-hidden="true" />
              <span>{t.edit}</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
            >
              <Trash2 className="h-4 w-4 mr-3" aria-hidden="true" />
              <span>{t.delete}</span>
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

