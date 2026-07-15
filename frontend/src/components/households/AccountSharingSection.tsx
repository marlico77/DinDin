import { Wallet, Info } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { getAccountTypeLabel } from '../../constants/accountTypes';
import type { Account } from '../../types';

interface AccountSharingSectionProps {
  isInPersonalHousehold: boolean;
  isSharedHousehold: boolean;
  personalAccounts: Account[];
  selectedAccountIds: string[];
  onToggleAccountSelection: (accountId: string) => void;
  onSaveSharedAccountIds: () => void;
  onTogglePersonalAccountAccess: (allowAccess: boolean) => void;
  allowPersonalAccountAccess: boolean;
  isSaving?: boolean;
}

export const AccountSharingSection = ({
  isInPersonalHousehold,
  isSharedHousehold,
  personalAccounts,
  selectedAccountIds,
  onToggleAccountSelection,
  onSaveSharedAccountIds,
  onTogglePersonalAccountAccess,
  allowPersonalAccountAccess,
  isSaving = false,
}: AccountSharingSectionProps) => {
  const { t } = useI18n();

  if (!isInPersonalHousehold || !isSharedHousehold) {
    return (
      <div className="mb-6 p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              {t.sharePersonalAccounts}
            </p>
            <p className="text-xs font-light text-blue-600 dark:text-blue-400">
              {t.sharePersonalAccountsDescription}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (personalAccounts.length === 0) {
    return (
      <div className="mb-6 p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              {t.sharePersonalAccounts}
            </p>
            <p className="text-xs font-light text-blue-600 dark:text-blue-400">
              {t.youDontHavePersonalAccounts}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300 flex items-center">
          <Wallet className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
          {t.sharePersonalAccounts}
        </h4>
      </div>
      
      <div className="mb-4 p-3 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs font-light text-blue-600 dark:text-blue-400 mb-2">
          {t.selectPersonalAccountsToShare}
        </p>
        
        {/* Toggle for backward compatibility: allow all personal accounts */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
          <div className="flex-1">
            <label htmlFor="allowAllPersonalAccounts" className="text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer">
              Compartilhar todas as contas pessoais
            </label>
            <p className="text-xs font-light text-blue-600 dark:text-blue-400 mt-1">
              Permitir acesso a todas as suas contas pessoais para todos os membros da household.
            </p>
          </div>
          <button
            type="button"
            id="allowAllPersonalAccounts"
            onClick={() => onTogglePersonalAccountAccess(!allowPersonalAccountAccess)}
            className={`ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              allowPersonalAccountAccess ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            role="switch"
            aria-checked={allowPersonalAccountAccess}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                allowPersonalAccountAccess ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Account selection list */}
      <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
        {personalAccounts.map((account) => (
          <label
            key={account.id}
            className="flex items-center p-3 border border-gray-100 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedAccountIds.includes(account.id)}
              onChange={() => onToggleAccountSelection(account.id)}
              disabled={allowPersonalAccountAccess}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-200 dark:border-gray-800 rounded"
            />
            <div className="ml-3 flex-1">
              <p className="text-sm font-light text-gray-900 dark:text-white">
                {account.name}
              </p>
              <p className="text-xs font-light text-gray-500 dark:text-gray-400">
                {getAccountTypeLabel(account.type, t as any)}
              </p>
            </div>
          </label>
        ))}
      </div>

      {!allowPersonalAccountAccess && (
        <button
          type="button"
          onClick={onSaveSharedAccountIds}
          disabled={isSaving}
          className="w-full flex justify-center py-2.5 px-4 text-sm font-light tracking-tight text-white bg-primary-600 dark:bg-primary-500 border border-primary-600 dark:border-primary-500 rounded-md hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? t.loading : t.save}
        </button>
      )}
    </div>
  );
};
