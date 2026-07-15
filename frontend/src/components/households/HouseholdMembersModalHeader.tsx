import { X, UserPlus } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface HouseholdMembersModalHeaderProps {
  isSharedHousehold: boolean;
  onClose: () => void;
}

export const HouseholdMembersModalHeader = ({ isSharedHousehold, onClose }: HouseholdMembersModalHeaderProps) => {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center space-x-3">
        <UserPlus className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        <div>
          <h3 className="text-lg font-light tracking-tight text-gray-900 dark:text-white">
            Gerenciar Membros
          </h3>
          <p className="text-xs font-light text-gray-500 dark:text-gray-400 mt-0.5">
            {isSharedHousehold 
              ? 'Membros, convites e seleção de contas compartilhadas'
              : 'Membros e convites desta household'}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label={t.close}
        className="text-gray-400 dark:text-gray-500 hover:opacity-70 transition-opacity p-1"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
};
