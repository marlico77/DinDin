import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { useI18n } from '../../context/I18nContext';
import { TransactionFormData } from '../../schemas';

interface InstallmentsFieldProps {
  register: UseFormRegister<TransactionFormData>;
  errors: FieldErrors<TransactionFormData>;
  disabled?: boolean;
}

export const InstallmentsField = ({ register, errors, disabled }: InstallmentsFieldProps) => {
  const { t } = useI18n();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t.installments}
      </label>
      <input
        type="number"
        min="1"
        max="120"
        {...register('installments', { valueAsNumber: true })}
        disabled={disabled}
        readOnly={disabled}
        className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${disabled ? 'bg-gray-100 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 cursor-not-allowed' : ''}`}
        placeholder="1"
      />
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {t.installments} ({t.newTransaction})
      </p>
      {errors.installments && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.installments.message}</p>
      )}
    </div>
  );
};
