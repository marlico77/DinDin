import { AccountType } from '../lib/enums';

/**
 * Account type constants - re-exported for backward compatibility
 */
export const ACCOUNT_TYPES = {
  CHECKING: AccountType.CHECKING,
  SAVINGS: AccountType.SAVINGS,
  CREDIT: AccountType.CREDIT,
  CASH: AccountType.CASH,
  INVESTMENT: AccountType.INVESTMENT,
} as const;

// Re-export AccountType enum
export { AccountType };

/**
 * Get translated label for account type
 */
export const getAccountTypeLabel = (type: AccountType, t: Record<string, string>): string => {
  const labels: Record<AccountType, string> = {
    [ACCOUNT_TYPES.CHECKING]: t.checkingAccount || 'Conta Corrente',
    [ACCOUNT_TYPES.SAVINGS]: t.savingsAccount || 'Conta Poupança',
    [ACCOUNT_TYPES.CREDIT]: t.creditCard || 'Cartão de Crédito',
    [ACCOUNT_TYPES.CASH]: t.cashAccount || 'Dinheiro',
    [ACCOUNT_TYPES.INVESTMENT]: t.investmentAccount || 'Investimento',
  };
  return labels[type] || type;
};

