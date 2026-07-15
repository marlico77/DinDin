import { useMemo } from "react";
import { useTransactions } from "../context/TransactionsContext";
import { useCurrency } from "../context/CurrencyContext";
import { useI18n } from "../context/I18nContext";
import { formatCurrency } from "../utils/format";
import { AccountType, TransactionType } from "../lib/enums";
import { CreditCard } from "lucide-react";

export const CreditCardsSummary = () => {
  const { accounts, transactions } = useTransactions();
  const { baseCurrency } = useCurrency();
  const { t } = useI18n();

  // Filtrar apenas cartões de crédito
  const creditCards = useMemo(() => {
    return accounts.filter(
      (account) => account.type === AccountType.CREDIT
    );
  }, [accounts]);

  // Calcular totais consolidados
  const summary = useMemo(() => {
    // Soma dos limites de crédito (incluindo dinheiro alocado)
    const totalCreditLimit = creditCards.reduce((sum, card) => {
      const limit = card.totalLimit || card.creditLimit || 0;
      return sum + limit;
    }, 0);

    // Calcular dívida total atual de TODOS os cartões
    // Para cartões de crédito, o limite usado deve considerar:
    // 1. Saldo atual (account.balance) - que reflete transações pagas
    // 2. Transações não pagas - que também consomem o limite
    // O saldo do cartão (account.balance) já reflete todas as transações pagas
    // Precisamos adicionar apenas as transações não pagas que ainda não estão no saldo
    const totalDebt = creditCards.reduce((sum, card) => {
      // Saldo atual da conta (reflete transações pagas quando foram criadas/atualizadas)
      // O backend atualiza o saldo apenas quando transações são marcadas como paid: true
      const paidDebt = Math.max(0, card.balance || 0);
      
      // Adicionar transações não pagas deste cartão
      // Excluir transações de pagamento de fatura (elas têm attachmentUrl e são da conta bancária)
      const unpaidTransactions = transactions.filter((trans) => {
        if (!trans.accountId || trans.accountId !== card.id) return false;
        if (trans.type === TransactionType.TRANSFER || trans.type === TransactionType.ALLOCATION) return false;
        if (trans.attachmentUrl) return false; // Excluir pagamentos de fatura (são da conta bancária)
        return trans.paid === false; // Apenas não pagas
      });
      
      // Calculate unpaid debt: EXPENSE increases debt, INCOME decreases debt
      const unpaidAmount = unpaidTransactions.reduce((acc, trans) => {
        if (trans.type === TransactionType.EXPENSE) {
          return acc + Math.abs(trans.amount); // Expenses increase debt
        } else if (trans.type === TransactionType.INCOME) {
          return acc - Math.abs(trans.amount); // Income decreases debt
        }
        return acc;
      }, 0);
      
      // Dívida total = saldo atual (transações pagas) + transações não pagas
      // Isso representa o limite total usado no cartão
      return sum + paidDebt + unpaidAmount;
    }, 0);

    // Limite usado é a dívida total
    const totalUsed = totalDebt;
    const totalAvailable = Math.max(0, totalCreditLimit - totalUsed);
    const usagePercent = totalCreditLimit > 0 
      ? (totalUsed / totalCreditLimit) * 100 
      : 0;

    return {
      totalCreditLimit,
      totalUsed,
      totalAvailable,
      usagePercent,
    };
  }, [creditCards, transactions]);

  if (creditCards.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-4 w-4 text-primary-600 dark:text-primary-400" />
        <h3 className="text-sm font-light tracking-tight text-gray-900 dark:text-white">
          {t.totalCreditLimit || "Total Consolidado"}
        </h3>
      </div>

      <div className="space-y-4">
        {/* Gráfico de barra com duas cores */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t.usedLimit || "Limite Usado"}
            </span>
            <span className="text-xs font-light text-gray-900 dark:text-white">
              {summary.usagePercent.toFixed(1)}%
            </span>
          </div>
          
          <div className="relative h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            {/* Parte usada (vermelha/laranja) */}
            {summary.totalUsed > 0 && (
              <div
                className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                  summary.usagePercent > 90
                    ? "bg-red-500"
                    : summary.usagePercent > 70
                    ? "bg-orange-500"
                    : "bg-yellow-500"
                } ${
                  summary.totalAvailable > 0 && summary.usagePercent < 100
                    ? "rounded-l-full"
                    : "rounded-full"
                }`}
                style={{
                  width: `${Math.min(100, summary.usagePercent)}%`,
                }}
              />
            )}
            
            {/* Parte disponível (verde) */}
            {summary.totalAvailable > 0 && (
              <div
                className={`absolute right-0 top-0 h-full bg-green-500 transition-all duration-500 ${
                  summary.totalUsed > 0 && summary.usagePercent > 0 && summary.usagePercent < 100
                    ? "rounded-r-full"
                    : "rounded-full"
                }`}
                style={{
                  width: `${Math.max(0, 100 - summary.usagePercent)}%`,
                }}
              />
            )}
          </div>
        </div>

        {/* Valores detalhados */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.totalLimit || "Limite Total"}
            </div>
            <div className="text-xs font-light text-gray-900 dark:text-white">
              {formatCurrency(summary.totalCreditLimit, baseCurrency)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.used || "Usado"}
            </div>
            <div className={`text-xs font-light ${
              summary.usagePercent > 70 ? "text-red-500" : "text-orange-500"
            }`}>
              {formatCurrency(summary.totalUsed, baseCurrency)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.availableLimit || "Disponível"}
            </div>
            <div className="text-xs font-light text-green-500">
              {formatCurrency(summary.totalAvailable, baseCurrency)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

