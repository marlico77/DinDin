import { useMemo } from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Account } from '../../types';
import { formatCurrency } from '../../utils/format';
import { getAccountBalance } from '../../utils/accountBalance';

interface AccountBalanceCardProps {
  account: Account;
  baseCurrency: string;
  transactions?: any[];
  className?: string;
}

export const AccountBalanceCard = ({
  account,
  baseCurrency,
  transactions = [],
  className = '',
}: AccountBalanceCardProps) => {
  const balance = useMemo(() => {
    return getAccountBalance(account, transactions);
  }, [account, transactions]);

  const isPositive = balance >= 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Wallet className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {account.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {account.type}
            </p>
          </div>
        </div>
        {isPositive ? (
          <TrendingUp className="h-5 w-5 text-green-500" />
        ) : (
          <TrendingDown className="h-5 w-5 text-red-500" />
        )}
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Saldo Atual
          </span>
          <span
            className={`text-2xl font-bold ${
              isPositive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatCurrency(balance, baseCurrency)}
          </span>
        </div>
      </div>
    </div>
  );
};
