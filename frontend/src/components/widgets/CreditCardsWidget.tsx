import { useMemo } from 'react';
import { useTransactions } from '../../context/TransactionsContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/format';
import { format } from 'date-fns';
import { CreditCard, Calendar } from 'lucide-react';
import { AccountType } from '../../lib/enums';

interface CreditCardsWidgetProps {
  accountBalances: Record<string, number>;
  blurNumbers?: boolean;
}

export const CreditCardsWidget = ({ accountBalances, blurNumbers = false }: CreditCardsWidgetProps) => {
  const { accounts } = useTransactions();
  const { baseCurrency } = useCurrency();
  const { t } = useI18n();

  const creditCardsInfo = useMemo(() => {
    const creditCards = accounts.filter((account) => account.type === AccountType.CREDIT);

    return creditCards.map((account) => {
      const currentDebt = Math.max(0, accountBalances[account.id || ''] || 0);
      const creditLimit = account.totalLimit || account.creditLimit || 0;
      const usedLimit = currentDebt;
      const availableLimit =
        creditLimit > 0 ? Math.max(0, creditLimit - usedLimit) : 0;

      // Calcular próximo vencimento
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      let nextDueDate: Date | null = null;

      if (account.dueDay) {
        const dueDay = account.dueDay;
        const thisMonthDue = new Date(currentYear, currentMonth, dueDay);

        if (thisMonthDue >= today) {
          nextDueDate = thisMonthDue;
        } else {
          nextDueDate = new Date(currentYear, currentMonth + 1, dueDay);
        }
      }

      return {
        account,
        currentDebt,
        creditLimit,
        usedLimit,
        availableLimit,
        nextDueDate,
        usagePercentage: creditLimit > 0 ? (usedLimit / creditLimit) * 100 : 0,
      };
    });
  }, [accounts, accountBalances]);

  if (creditCardsInfo.length === 0) {
    return (
      <div className="flex flex-col">
        <h2 className="text-base sm:text-lg lg:text-xl font-light tracking-tight text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
          {t.creditCards}
        </h2>
        <div className="text-center text-gray-500 dark:text-gray-400">
          {t.noCreditCardsRegistered}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-base sm:text-lg lg:text-xl font-light tracking-tight text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
        {t.creditCards}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-cols-max">
      {creditCardsInfo.map((cardInfo) => {
        const {
          account,
          currentDebt,
          availableLimit,
          creditLimit,
          usedLimit,
          nextDueDate,
          usagePercentage,
        } = cardInfo;
        const isNearLimit = usagePercentage > 80;
        const isOverLimit = usagePercentage >= 100;

        return (
          <div
            key={account.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 lg:p-5 border-l-4"
            style={{
              borderLeftColor: isOverLimit
                ? '#ef4444'
                : isNearLimit
                ? '#f59e0b'
                : account.color || '#3b82f6',
            }}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center min-w-0 flex-1">
                <div
                  className="p-1.5 sm:p-2 rounded-lg flex-shrink-0"
                  style={{
                    backgroundColor: `${account.color || '#3b82f6'}20`,
                    color: account.color || '#3b82f6',
                  }}
                >
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="ml-2 min-w-0 flex-1">
                  <h3 className="font-light tracking-tight text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                    {account.name}
                  </h3>
                  {nextDueDate && (
                    <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                      <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{t.date}: {format(nextDueDate, 'dd/MM/yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.currentDebt}</span>
                  <span
                    className={`text-sm font-light tracking-tight ${
                      currentDebt > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    } ${blurNumbers ? 'demo-blur' : ''}`}
                  >
                    {currentDebt > 0
                      ? formatCurrency(currentDebt, baseCurrency)
                      : t.noDebt}
                  </span>
                </div>
              </div>

              {creditLimit > 0 && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.availableLimit}</span>
                      <span
                        className={`text-sm font-light tracking-tight ${
                          availableLimit < creditLimit * 0.1
                            ? 'text-red-600 dark:text-red-400'
                            : availableLimit < creditLimit * 0.3
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-green-600 dark:text-green-400'
                        } ${blurNumbers ? 'demo-blur' : ''}`}
                      >
                        {formatCurrency(availableLimit, baseCurrency)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          usagePercentage >= 100
                            ? 'bg-red-600'
                            : usagePercentage > 80
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(usagePercentage, 100)}%`,
                        }}
                      />
                    </div>
                    <div className={`flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mt-2 ${blurNumbers ? 'demo-blur' : ''}`}>
                      <span>
                        {formatCurrency(usedLimit, baseCurrency)} {t.of}{' '}
                        {formatCurrency(creditLimit, baseCurrency)}
                      </span>
                      <span>
                        {usagePercentage.toFixed(1)}% {t.used}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};


