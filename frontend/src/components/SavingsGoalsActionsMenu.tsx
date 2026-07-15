import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { useI18n } from '../context/I18nContext';
import { SavingsGoal } from '../types';

interface SavingsGoalsActionsMenuProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
}

export const SavingsGoalsActionsMenu = ({
  goal,
  onEdit,
  onDelete,
}: SavingsGoalsActionsMenuProps) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const handleEdit = () => {
    onEdit(goal);
    setOpen(false);
  };

  const handleDelete = () => {
    if (goal.id) {
      onDelete(goal.id);
      setOpen(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="text-gray-400 dark:text-gray-500 hover:opacity-70 focus:outline-none rounded p-1 transition-opacity"
          aria-label={t.moreOptions || 'Mais opções'}
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="w-56 bg-white dark:bg-gray-900 rounded-md border border-gray-100 dark:border-gray-800 z-50 p-1"
          sideOffset={4}
          align="end"
        >
          <div className="py-1">
            <button
              onClick={handleEdit}
              className="w-full flex items-center px-4 py-2 text-sm font-light text-gray-900 dark:text-white hover:bg-gray-50/50 dark:hover:bg-gray-900/50 rounded-sm focus:outline-none transition-colors"
            >
              <Edit className="h-4 w-4 mr-3" aria-hidden="true" />
              <span>{t.edit}</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-full flex items-center px-4 py-2 text-sm font-light text-red-500 dark:text-red-400 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 rounded-sm focus:outline-none transition-colors"
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

