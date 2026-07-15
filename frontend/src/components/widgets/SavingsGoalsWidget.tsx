import { useTransactions } from '../../context/TransactionsContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/format';
import { Target } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface SavingsGoalsWidgetProps {
  blurNumbers?: boolean;
}

export const SavingsGoalsWidget = ({ blurNumbers = false }: SavingsGoalsWidgetProps) => {
  const { savingsGoals } = useTransactions();
  const { baseCurrency } = useCurrency();
  const { t } = useI18n();

  if (savingsGoals.length === 0) {
    return (
      <div className="flex flex-col">
        <h2 className="text-lg sm:text-xl font-light tracking-tight text-gray-900 dark:text-gray-100 mb-4">
          {t.savingsGoals}
        </h2>
        <div className="text-center text-gray-500 dark:text-gray-400">
          {t.noSavingsGoals}
        </div>
      </div>
    );
  }

  // Função para calcular quanto precisa guardar mensalmente
  const calculateMonthlySavings = (goal: typeof savingsGoals[0]) => {
    if (!goal.targetDate || goal.targetAmount <= 0) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const target = goal.targetDate instanceof Date ? goal.targetDate : new Date(goal.targetDate);
    target.setHours(0, 0, 0, 0);
    
    // Verifica se a data alvo é no futuro
    if (target <= today) {
      return null;
    }

    // Calcula a diferença em dias
    const daysRemaining = differenceInDays(target, today);
    
    // Só mostra se for maior que um mês (mais de 30 dias)
    if (daysRemaining <= 30) {
      return null;
    }

    const remainingAmount = goal.targetAmount - goal.currentAmount;
    
    if (remainingAmount <= 0) {
      return null;
    }

    // Calcula o valor mensal necessário baseado nos dias restantes
    // Converte dias para meses (aproximadamente 30 dias por mês)
    const monthlyRate = (remainingAmount / daysRemaining) * 30;
    return monthlyRate;
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-base sm:text-lg lg:text-xl font-light tracking-tight text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
        {t.savingsGoals}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-cols-max">
      {savingsGoals.map((goal) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const monthlySavings = calculateMonthlySavings(goal);
        
        return (
          <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-light tracking-tight text-gray-900 dark:text-gray-100">{goal.name}</h3>
              <Target className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div className={`text-sm font-light tracking-tight text-gray-900 dark:text-gray-100 mb-3 ${blurNumbers ? 'demo-blur' : ''}`}>
              {formatCurrency(goal.currentAmount, baseCurrency)} /{' '}
              {formatCurrency(goal.targetAmount, baseCurrency)}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
              <div
                className="bg-primary-600 dark:bg-primary-500 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className={`text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 ${blurNumbers ? 'demo-blur' : ''}`}>
              {progress.toFixed(1)}% {t.completed}
            </div>
            {monthlySavings !== null && monthlySavings > 0 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  <span className="text-gray-900 dark:text-gray-100">
                    {t.monthlySavingsNeeded}
                  </span>
                  {' '}
                  <span className={`font-light tracking-tight text-primary-600 dark:text-primary-400 ${blurNumbers ? 'demo-blur' : ''}`}>
                    {formatCurrency(monthlySavings, baseCurrency)}
                  </span>
                  {' '}
                  <span className="text-gray-600 dark:text-gray-400">
                    {t.perMonth} {t.toReachGoal}
                  </span>
                </p>
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
};


