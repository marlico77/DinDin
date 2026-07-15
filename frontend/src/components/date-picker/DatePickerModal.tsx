import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface DatePickerModalProps {
  placeholder?: string;
  onCancel: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
}

export const DatePickerModal = ({
  placeholder,
  onCancel,
  onConfirm,
  children,
}: DatePickerModalProps) => {
  const { t } = useI18n();

  return createPortal(
    <div className="fixed inset-0 z-[80] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity" 
        onClick={onCancel}
        aria-hidden="true"
      />
      
      {/* Scrollable Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal Card */}
        <div 
          className="relative w-full max-w-md p-6 border shadow-2xl rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {placeholder || t.selectDate}
            </h3>
            <button
              onClick={onCancel}
              aria-label={t.closeModal}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mb-4">
            {children}
          </div>

          {/* Footer com botões de ação */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 rounded-md"
            >
              {t.confirm}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
