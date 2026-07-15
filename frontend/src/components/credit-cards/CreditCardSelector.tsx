import { useMemo } from 'react';
import { CreditCard } from 'lucide-react';
import { Account } from '../../types';
import { formatCurrency } from '../../utils/format';
import { AccountType } from '../../lib/enums';

interface CreditCardSelectorProps {
  creditCards: Account[];
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string | null) => void;
  invoices: Record<string, number>;
  baseCurrency: string;
  className?: string;
}

export const CreditCardSelector = ({
  creditCards,
  selectedAccountId,
  onSelectAccount,
  invoices,
  baseCurrency,
  className = '',
}: CreditCardSelectorProps) => {
  const filteredCards = useMemo(() => {
    return creditCards.filter(
      (account) => account && account.type === AccountType.CREDIT
    );
  }, [creditCards]);

  if (filteredCards.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {filteredCards.map((card) => {
        const invoiceAmount = invoices[card.id || ''] || 0;
        const isSelected = selectedAccountId === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onSelectAccount(card.id || null)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              isSelected
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {card.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(invoiceAmount, baseCurrency)}
                  </div>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
