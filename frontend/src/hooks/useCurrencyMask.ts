import { useState, useCallback, ChangeEvent, useMemo } from 'react';
import { useCurrency } from '../context/CurrencyContext';

export interface UseCurrencyMaskReturn {
  value: string;
  numericValue: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setValue: (value: string | number) => void;
}

export function useCurrencyMask(initialValue: string | number = ''): UseCurrencyMaskReturn {
  const { getCurrencyInfo } = useCurrency();
  const currencyInfo = getCurrencyInfo();
  
  const formatCurrency = useCallback((value: string | number): string => {
    if (!value && value !== 0) return '';
    
    // Se for um número (não string), já está no formato correto (ex: 10000.00)
    if (typeof value === 'number') {
      return new Intl.NumberFormat(currencyInfo.locale, {
        style: 'currency',
        currency: currencyInfo.code,
        minimumFractionDigits: currencyInfo.decimalPlaces,
        maximumFractionDigits: currencyInfo.decimalPlaces,
      }).format(value);
    }
    
    // Se for string, trata como entrada do usuário (remove formatação e divide por 100)
    const numericString = String(value).replace(/\D/g, '');
    
    if (!numericString) return '';
    
    // Converte para número e divide por 100 para ter centavos
    // Para JPY (sem centavos), não divide por 100
    const divisor = currencyInfo.decimalPlaces === 0 ? 1 : 100;
    const numericValue = parseInt(numericString, 10) / divisor;
    
    // Formata como moeda
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: currencyInfo.decimalPlaces,
      maximumFractionDigits: currencyInfo.decimalPlaces,
    }).format(numericValue);
  }, [currencyInfo.locale, currencyInfo.code, currencyInfo.decimalPlaces]);

  const parseCurrency = useCallback((formattedValue: string): number => {
    if (!formattedValue) return 0;
    
    // Remove tudo que não é dígito
    const numericString = formattedValue.replace(/\D/g, '');
    
    if (!numericString) return 0;
    
    // Converte para número e divide por 100 para ter centavos
    // Para JPY (sem centavos), não divide por 100
    const divisor = currencyInfo.decimalPlaces === 0 ? 1 : 100;
    return parseInt(numericString, 10) / divisor;
  }, [currencyInfo.decimalPlaces]);

  const [value, setValueState] = useState<string>(() => {
    if (initialValue === '' || initialValue === 0) return '';
    return formatCurrency(initialValue);
  });

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatCurrency(inputValue);
    setValueState(formatted);
  }, [formatCurrency]);

  const setValue = useCallback((newValue: string | number) => {
    if (newValue === '' || newValue === 0) {
      setValueState('');
      return;
    }
    setValueState(formatCurrency(newValue));
  }, [formatCurrency]);

  const numericValue = useMemo(() => parseCurrency(value), [value, parseCurrency]);

  return useMemo(() => ({
    value,
    numericValue,
    onChange,
    setValue,
  }), [value, numericValue, onChange, setValue]);
}

