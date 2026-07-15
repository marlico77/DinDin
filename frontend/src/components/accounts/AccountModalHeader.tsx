import { X } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface AccountModalHeaderProps {
  isEditing: boolean;
  onClose: () => void;
}

export const AccountModalHeader = ({ isEditing, onClose }: AccountModalHeaderProps) => {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
      <h3 className="text-xl font-light tracking-tight text-gray-900 dark:text-white">
        {isEditing ? t.editAccount : t.newAccount}
      </h3>
      <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:opacity-70 transition-opacity p-1">
        <X className="h-6 w-6" />
      </button>
    </div>
  );
};
