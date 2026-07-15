import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransactions } from "../context/TransactionsContext";
import { useCurrencyMask } from "../hooks/useCurrencyMask";
import { useToastContext } from "../context/ToastContext";
import { useI18n } from "../context/I18nContext";
import { useCurrency } from "../context/CurrencyContext";
import { formatCurrency } from "../utils/format";
import { X } from "lucide-react";
import { DatePicker } from "./DatePicker";
import { parseCurrencyValue } from "../utils/currency";
import { formatDateForAPI } from "../utils/format";
import {
  useCreateAllocation,
  useCreateDeallocation,
} from "../hooks/api/useTransactions";
import { AccountType } from "../lib/enums";
import SelectCombobox from "./SelectCombobox";
import { getAccountBalance } from "../utils/accountBalance";
import { analyticsHelpers } from "../utils/analytics";

interface AllocationModalProps {
  accountId: string | null;
  creditCardId: string | null;
  isOpen: boolean;
  onClose: () => void;
  mode: "allocate" | "deallocate";
  onCreditCardSelect?: (creditCardId: string) => void;
}

const createAllocationSchema = (
  maxAmount?: number,
  t?: any,
  baseCurrency?: string
) => {
  const maxAmountFormatted =
    maxAmount && t && baseCurrency ? formatCurrency(maxAmount) : "";
  return z.object({
    amount: z
      .number()
      .positive(t?.amountMustBePositive || "O valor deve ser positivo")
      .max(
        maxAmount || Infinity,
        maxAmount && t && maxAmountFormatted
          ? `${t.amountMustBePositive}. ${t.maximumAvailable}: ${maxAmountFormatted}`
          : t?.amountMustBePositive || t?.error || "Valor inválido"
      ),
    description: z.string().max(255).optional(),
    date: z.date(),
    notes: z.string().max(1000).optional(),
  });
};

type AllocationFormData = z.infer<ReturnType<typeof createAllocationSchema>>;

export const AllocationModal = ({
  accountId,
  creditCardId,
  isOpen,
  onClose,
  mode,
  onCreditCardSelect,
}: AllocationModalProps) => {
  const { accounts, transactions } = useTransactions();

  const creditCards = accounts.filter((a) => a.type === AccountType.CREDIT);
  const { success, error: showError } = useToastContext();
  const { t } = useI18n();
  const { baseCurrency } = useCurrency();
  const currencyMask = useCurrencyMask();
  const createAllocation = useCreateAllocation();
  const createDeallocation = useCreateDeallocation();

  const account = accounts.find((a) => a.id === accountId);

  const [selectedCreditCardId, setSelectedCreditCardId] = useState<
    string | null
  >(creditCardId);

  useEffect(() => {
    if (isOpen) {
      setSelectedCreditCardId(creditCardId);
    }
  }, [isOpen, creditCardId]);

  const selectedCreditCard = accounts.find(
    (a) => a.id === selectedCreditCardId
  );

  // Get account balances - SINGLE SOURCE OF TRUTH
  const accountBalances = useMemo(() => {
    return getAccountBalance(account);
  }, [account]);

  const { totalBalance, availableBalance, allocatedBalance } = accountBalances;
  const creditCardLimit = selectedCreditCard
    ? selectedCreditCard.totalLimit || selectedCreditCard.creditLimit || 0
    : 0;

  // Calcular saldo alocado específico para o cartão selecionado
  // As desalocações são armazenadas como transações do tipo 'alocacao' com amount negativo
  const allocatedBalanceForCard = useMemo(() => {
    if (!accountId || !selectedCreditCardId) return 0;

    // Buscar todas as transações de alocação/desalocação para esta conta e cartão
    const allocationTransactions = transactions.filter(
      (t) =>
        t.type === "alocacao" &&
        t.accountId === accountId &&
        t.relatedEntityId === selectedCreditCardId
    );

    // Calcular saldo líquido: somar todos os amounts
    // Alocações têm amount positivo, desalocações têm amount negativo
    const totalAllocated = allocationTransactions.reduce((sum, trans) => {
      return sum + trans.amount;
    }, 0);

    return Math.max(0, totalAllocated);
  }, [accountId, selectedCreditCardId, transactions]);

  // Determinar o valor máximo permitido baseado no modo e cartão selecionado
  const maxAmount = useMemo(() => {
    if (mode === "allocate") {
      return availableBalance;
    } else {
      // No modo de desalocação, usar o saldo alocado específico do cartão se selecionado
      return selectedCreditCardId ? allocatedBalanceForCard : allocatedBalance;
    }
  }, [
    mode,
    availableBalance,
    allocatedBalance,
    allocatedBalanceForCard,
    selectedCreditCardId,
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<AllocationFormData>({
    resolver: zodResolver(createAllocationSchema(maxAmount, t, baseCurrency)),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date(),
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      // Reset do form primeiro
      reset({
        description: "",
        amount: 0,
        date: new Date(),
        notes: "",
      });
      // Reset da máscara de moeda
      currencyMask.setValue("");
      // Track modal opened
      analyticsHelpers.logAllocationModalOpened(mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reset, mode]);

  // Atualizar validação quando maxAmount mudar (ex: quando selecionar um cartão diferente)
  useEffect(() => {
    // Revalidar o campo amount quando maxAmount mudar, mas apenas se já houver um valor
    const currentAmount = watch("amount");
    if (currentAmount > 0) {
      setValue("amount", currentAmount, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxAmount]);

  const onSubmit = async (data: AllocationFormData) => {
    const finalCreditCardId = selectedCreditCardId || creditCardId;
    if (!accountId || !finalCreditCardId) {
      showError(t.accountAndCreditCardRequired);
      return;
    }

    try {
      if (mode === "allocate") {
        if (data.amount > availableBalance) {
          showError(t.insufficientAvailableBalance);
          return;
        }
        await createAllocation.mutateAsync({
          accountId,
          creditCardId: finalCreditCardId,
          amount: data.amount,
          description:
            data.description ||
            `${t.categoryALLOCATION}: ${account?.name} → ${selectedCreditCard?.name}`,
          date: formatDateForAPI(data.date),
          notes: data.notes,
        });
        analyticsHelpers.logAllocationCreated(data.amount, accountId, finalCreditCardId);
        success(t.allocationSuccess);
      } else {
        // No modo de desalocação, validar contra o saldo alocado específico do cartão
        const maxDeallocate = selectedCreditCardId
          ? allocatedBalanceForCard
          : allocatedBalance;
        if (data.amount > maxDeallocate) {
          const formattedMax = formatCurrency(maxDeallocate, baseCurrency);
          showError(
            `${t.insufficientAllocatedBalance}. ${t.maximumAvailable}: ${formattedMax}`
          );
          return;
        }
        await createDeallocation.mutateAsync({
          accountId,
          creditCardId: finalCreditCardId,
          amount: data.amount,
          description:
            data.description ||
            `${t.deallocateBalance}: ${selectedCreditCard?.name} → ${account?.name}`,
          date: formatDateForAPI(data.date),
          notes: data.notes,
        });
        analyticsHelpers.logDeallocationCreated(data.amount, accountId, finalCreditCardId);
        success(t.deallocationSuccess);
      }
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t.errorProcessingAllocation;
      showError(errorMessage);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full sm:w-[450px] max-w-lg p-6 border shadow-2xl rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {mode === "allocate" ? t.allocateBalance : t.deallocateBalance}
            </h3>
            <button
              onClick={onClose}
              aria-label={t.close}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {account && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Conta:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {account.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {t.totalBalance}:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(totalBalance, baseCurrency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {t.availableBalance}:
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(availableBalance, baseCurrency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {t.allocatedBalance}:
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {formatCurrency(allocatedBalance, baseCurrency)}
                </span>
              </div>
              {(mode === "allocate" || mode === "deallocate") &&
                creditCards.length > 0 && (
                  <div className="border-t pt-2 mt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.creditCard}
                    </label>
                    <SelectCombobox
                      value={selectedCreditCardId || ""}
                      onValueChange={(newId) => {
                        const id = newId || null;
                        setSelectedCreditCardId(id);
                        if (onCreditCardSelect && id) {
                          onCreditCardSelect(id);
                        }
                      }}
                      options={[
                        { value: "", label: t.selectCreditCard },
                        ...creditCards.map((card) => ({
                          value: card.id || "",
                          label: card.name,
                        })),
                      ]}
                      placeholder={t.selectCreditCard}
                    />
                  </div>
                )}
              {selectedCreditCard && (
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t.creditCard}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedCreditCard.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t.totalLimit}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(creditCardLimit, baseCurrency)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 min-w-0">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {mode === "allocate" ? t.valueToAllocate : t.valueToDeallocate}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={currencyMask.value || ""}
                onChange={(e) => {
                  const newValue = e.target.value;
                  // Atualiza a máscara com o novo valor
                  currencyMask.onChange(e);
                  // Parseia o valor bruto do input para atualizar o form
                  const numericValue = parseCurrencyValue(newValue);
                  setValue("amount", numericValue, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                placeholder={t.currencyPlaceholder}
                autoComplete="off"
                className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.amount
                    ? "border-red-300 dark:border-red-600"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              <input
                type="hidden"
                {...register("amount", {
                  valueAsNumber: true,
                })}
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.amount.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {mode === "allocate"
                  ? `${t.maximumAvailable}: ${formatCurrency(
                      availableBalance,
                      baseCurrency
                    )}`
                  : selectedCreditCardId
                  ? `${t.maximumAllocatedInCard}: ${formatCurrency(
                      allocatedBalanceForCard,
                      baseCurrency
                    )}`
                  : `${t.maximumAllocated}: ${formatCurrency(
                      allocatedBalance,
                      baseCurrency
                    )}`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.description} ({t.optional})
              </label>
              <input
                type="text"
                {...register("description")}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.date}
              </label>
              <DatePicker
                value={watch("date") || new Date()}
                onChange={(date) => {
                  setValue("date", date || new Date(), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                placeholder={t.date}
                className={
                  errors.date ? "border-red-300 dark:border-red-600" : ""
                }
                useModal={true}
              />
              <input
                type="hidden"
                {...register("date", {
                  valueAsDate: true,
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.notesOptional}
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isSubmitting
                  ? t.processing
                  : mode === "allocate"
                  ? t.allocate
                  : t.deallocate}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
