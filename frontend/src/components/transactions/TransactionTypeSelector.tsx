import { Controller, Control, FieldErrors } from 'react-hook-form';
import { useI18n } from '../../context/I18nContext';
import { AccountType, TransactionType } from '../../lib/enums';
import { TransactionFormData } from '../../schemas';
import SelectCombobox from '../SelectCombobox';
import type { Account } from '../../types';

interface TransactionTypeSelectorProps {
  control: Control<TransactionFormData>;
  errors: FieldErrors<TransactionFormData>;
  accounts: Account[];
  disabled?: boolean;
}

export const TransactionTypeSelector = ({ control, errors, accounts, disabled }: TransactionTypeSelectorProps) => {
  const { t } = useI18n();

  const typeOptions = [
    { value: TransactionType.INCOME, label: t.income },
    { value: TransactionType.EXPENSE, label: t.expense },
  ];

  if (accounts.filter(a => a.type !== AccountType.CREDIT).length >= 2) {
    typeOptions.push({ value: TransactionType.TRANSFER, label: t.transfer });
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t.type}
      </label>
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <SelectCombobox
            value={field.value || ''}
            onValueChange={field.onChange}
            options={typeOptions}
            placeholder={t.selectType}
            disabled={disabled}
          />
        )}
      />
      {errors.type && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>
      )}
    </div>
  );
};
