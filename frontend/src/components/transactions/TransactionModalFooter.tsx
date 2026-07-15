import { useI18n } from '../../context/I18nContext';

interface TransactionModalFooterProps {
  readOnly?: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  hasErrors: boolean;
  isUpdate?: boolean;
  onSaveAndCreateNew?: () => void;
}

export const TransactionModalFooter = ({ 
  readOnly, 
  onClose, 
  isSubmitting, 
  hasErrors,
  isUpdate = false,
  onSaveAndCreateNew
}: TransactionModalFooterProps) => {
  const { t } = useI18n();

  return (
    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
      {readOnly ? (
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-md text-sm font-light tracking-tight text-gray-900 dark:text-white bg-white dark:bg-gray-900 hover:opacity-70 transition-opacity focus:outline-none"
        >
          {t.close}
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-md text-sm font-light tracking-tight text-gray-900 dark:text-white bg-white dark:bg-gray-900 hover:opacity-70 transition-opacity focus:outline-none"
          >
            {t.cancel}
          </button>
          {!isUpdate && onSaveAndCreateNew && (
            <button
              type="button"
              onClick={onSaveAndCreateNew}
              disabled={isSubmitting || hasErrors}
              className="px-4 py-2.5 border border-primary-600 dark:border-primary-500 rounded-md text-sm font-light tracking-tight text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-900 hover:opacity-70 transition-opacity focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? t.loading : t.saveAndCreateNew}
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || hasErrors}
            className="px-4 py-2.5 border border-primary-600 dark:border-primary-500 rounded-md text-sm font-light tracking-tight text-white bg-primary-600 dark:bg-primary-500 hover:opacity-80 transition-opacity focus:outline-none disabled:opacity-50"
          >
            {isSubmitting ? t.loading : isUpdate ? t.update : t.create}
          </button>
        </>
      )}
    </div>
  );
};
