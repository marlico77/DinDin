import { Controller } from 'react-hook-form';
import { useI18n } from '../../context/I18nContext';
import { AccountType } from '../../lib/enums';
import { getAccountTypeLabel } from '../../constants/accountTypes';
import { formatCurrency } from '../../utils/format';
import { getDisplayBalance } from '../../utils/accountBalance';
import { parseCurrencyValue } from '../../utils/currency';
import SelectCombobox from '../SelectCombobox';
import type { AccountFormData } from '../../schemas';
import type { Account } from '../../types';
import type { UseFormReturn } from 'react-hook-form';

interface AccountBasicFieldsProps {
  account: Account | null;
  form: UseFormReturn<AccountFormData>;
  currencyMask: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; setValue: (value: number) => void };
  accountTypeOptions: Array<{ value: string; label: string }>;
  defaultType: AccountType;
  baseCurrency: string;
  setValue: (name: keyof AccountFormData, value: any, options?: any) => void;
}

export const AccountBasicFields = ({
  account,
  form,
  currencyMask,
  accountTypeOptions,
  defaultType,
  baseCurrency,
  setValue,
}: AccountBasicFieldsProps) => {
  const { t } = useI18n();
  const { register, control, watch, formState: { errors } } = form;
  const accountType = watch('type');

  return (
    <>
      {/* Nome da conta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t.accountName}
        </label>
        <input
          type="text"
          {...register('name')}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
            errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      {/* Tipo de conta só aparece na criação, não na edição */}
      {!account && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.accountType}
          </label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => {
              // Se defaultType for CREDIT, permitir CREDIT; caso contrário, filtrar apenas CREDIT
              const filteredOptions = defaultType === AccountType.CREDIT
                ? accountTypeOptions.filter(opt => opt.value === AccountType.CREDIT)
                : accountTypeOptions.filter(opt => opt.value !== AccountType.CREDIT);
              return (
                <SelectCombobox
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as AccountType)}
                  options={filteredOptions}
                  placeholder={t.selectAccountType || t.select}
                />
              );
            }}
          />
          {errors.type && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>
          )}
        </div>
      )}
      
      {/* Mostrar tipo de conta quando estiver editando */}
      {account && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.accountType}
          </label>
          <div className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            {getAccountTypeLabel(account.type, t as unknown as Record<string, string>)}
          </div>
        </div>
      )}

      {/* Saldo inicial só aparece na criação, não na edição */}
      {!account && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {accountType === AccountType.CREDIT ? t.initialDebt : t.initialBalance}
          </label>
          <input
            type="text"
            value={currencyMask.value}
            onChange={(e) => {
              currencyMask.onChange(e);
              const numericValue = parseCurrencyValue(e.target.value);
              setValue('balance', numericValue, { shouldValidate: true });
            }}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      )}
      
      {/* Mostrar saldo atual quando estiver editando */}
      {account && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.currentBalance || 'Saldo Atual'}
          </label>
          <div className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            {formatCurrency(getDisplayBalance(account), baseCurrency || 'BRL')}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {t.balanceAndTypeEditHint || 'O saldo e o tipo da conta bancária não podem ser editados aqui. Se precisar alterar esses valores, você pode deletar esta conta bancária e criar uma nova. Os cálculos serão refeitos automaticamente.'}
          </p>
        </div>
      )}
    </>
  );
};
