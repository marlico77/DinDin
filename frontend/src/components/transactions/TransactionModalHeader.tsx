import { X } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface TransactionModalHeaderProps {
  title: string;
  onClose: () => void;
  readOnly?: boolean;
}

export const TransactionModalHeader = ({ title, onClose, readOnly: _readOnly }: TransactionModalHeaderProps) => {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
      <h3 className="text-xl font-light tracking-tight text-gray-900 dark:text-white">
        {title}
      </h3>
      <button
        onClick={onClose}
        aria-label={t.close}
        className="text-gray-400 dark:text-gray-500 hover:opacity-70 transition-opacity p-1"
      >
        <X className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
};
