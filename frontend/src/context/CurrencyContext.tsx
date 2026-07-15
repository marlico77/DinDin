import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useUser, useUpdateUserPreferences } from '../hooks/api/useUsers';

// Moedas suportadas (ISO 4217)
export type CurrencyCode = 
  | 'BRL' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'MXN'
  | 'ARS' | 'CLP' | 'COP' | 'UYU' // Pesos
  | 'INR' | 'IDR' | 'PKR' // Rupias
  | 'RUB' | 'ZAR' | 'TRY' | 'KRW' | 'SGD' | 'NZD' | 'HKD' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'THB' | 'VND' | 'PHP' | 'MYR' | 'SAR';

// Informações sobre cada moeda
export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
  decimalPlaces: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  // Moedas principais
  BRL: { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', locale: 'pt-BR', decimalPlaces: 2 },
  USD: { code: 'USD', name: 'Dólar Americano', symbol: '$', locale: 'en-US', decimalPlaces: 2 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', decimalPlaces: 2 },
  GBP: { code: 'GBP', name: 'Libra Esterlina', symbol: '£', locale: 'en-GB', decimalPlaces: 2 },
  JPY: { code: 'JPY', name: 'Iene Japonês', symbol: '¥', locale: 'ja-JP', decimalPlaces: 0 },
  CAD: { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$', locale: 'en-CA', decimalPlaces: 2 },
  AUD: { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$', locale: 'en-AU', decimalPlaces: 2 },
  CHF: { code: 'CHF', name: 'Franco Suíço', symbol: 'CHF', locale: 'de-CH', decimalPlaces: 2 },
  CNY: { code: 'CNY', name: 'Yuan Chinês', symbol: '¥', locale: 'zh-CN', decimalPlaces: 2 },
  MXN: { code: 'MXN', name: 'Peso Mexicano', symbol: '$', locale: 'es-MX', decimalPlaces: 2 },
  
  // Pesos
  ARS: { code: 'ARS', name: 'Peso Argentino', symbol: '$', locale: 'es-AR', decimalPlaces: 2 },
  CLP: { code: 'CLP', name: 'Peso Chileno', symbol: '$', locale: 'es-CL', decimalPlaces: 0 },
  COP: { code: 'COP', name: 'Peso Colombiano', symbol: '$', locale: 'es-CO', decimalPlaces: 2 },
  UYU: { code: 'UYU', name: 'Peso Uruguaio', symbol: '$U', locale: 'es-UY', decimalPlaces: 2 },
  
  // Rupias
  INR: { code: 'INR', name: 'Rupia Indiana', symbol: '₹', locale: 'en-IN', decimalPlaces: 2 },
  IDR: { code: 'IDR', name: 'Rupia Indonésia', symbol: 'Rp', locale: 'id-ID', decimalPlaces: 0 },
  PKR: { code: 'PKR', name: 'Rupia Paquistanesa', symbol: '₨', locale: 'ur-PK', decimalPlaces: 2 },
  
  // Outras moedas importantes
  RUB: { code: 'RUB', name: 'Rublo Russo', symbol: '₽', locale: 'ru-RU', decimalPlaces: 2 },
  ZAR: { code: 'ZAR', name: 'Rand Sul-Africano', symbol: 'R', locale: 'en-ZA', decimalPlaces: 2 },
  TRY: { code: 'TRY', name: 'Lira Turca', symbol: '₺', locale: 'tr-TR', decimalPlaces: 2 },
  KRW: { code: 'KRW', name: 'Won Sul-Coreano', symbol: '₩', locale: 'ko-KR', decimalPlaces: 0 },
  SGD: { code: 'SGD', name: 'Dólar de Singapura', symbol: 'S$', locale: 'en-SG', decimalPlaces: 2 },
  NZD: { code: 'NZD', name: 'Dólar Neozelandês', symbol: 'NZ$', locale: 'en-NZ', decimalPlaces: 2 },
  HKD: { code: 'HKD', name: 'Dólar de Hong Kong', symbol: 'HK$', locale: 'zh-HK', decimalPlaces: 2 },
  SEK: { code: 'SEK', name: 'Coroa Sueca', symbol: 'kr', locale: 'sv-SE', decimalPlaces: 2 },
  NOK: { code: 'NOK', name: 'Coroa Norueguesa', symbol: 'kr', locale: 'nb-NO', decimalPlaces: 2 },
  DKK: { code: 'DKK', name: 'Coroa Dinamarquesa', symbol: 'kr', locale: 'da-DK', decimalPlaces: 2 },
  PLN: { code: 'PLN', name: 'Zloty Polonês', symbol: 'zł', locale: 'pl-PL', decimalPlaces: 2 },
  THB: { code: 'THB', name: 'Baht Tailandês', symbol: '฿', locale: 'th-TH', decimalPlaces: 2 },
  VND: { code: 'VND', name: 'Dong Vietnamita', symbol: '₫', locale: 'vi-VN', decimalPlaces: 0 },
  PHP: { code: 'PHP', name: 'Peso Filipino', symbol: '₱', locale: 'en-PH', decimalPlaces: 2 },
  MYR: { code: 'MYR', name: 'Ringgit Malaio', symbol: 'RM', locale: 'ms-MY', decimalPlaces: 2 },
  SAR: { code: 'SAR', name: 'Riyal Saudita', symbol: 'SR', locale: 'ar-SA', decimalPlaces: 2 },
};

export const DEFAULT_CURRENCY: CurrencyCode = 'BRL';
export const CURRENCY_LIST: CurrencyInfo[] = Object.values(CURRENCIES);

interface CurrencyContextType {
  baseCurrency: CurrencyCode;
  setBaseCurrency: (currency: CurrencyCode) => void;
  getCurrencyInfo: () => CurrencyInfo;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Only fetch user data if authenticated - this prevents queries from running before login
  const { data: user, isLoading: userLoading } = useUser();
  const updatePreferences = useUpdateUserPreferences();
  
  const [baseCurrency, setBaseCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('baseCurrency');
    return (saved as CurrencyCode) || DEFAULT_CURRENCY;
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const isUpdatingFromBackend = useRef(false);
  const lastSavedCurrency = useRef<CurrencyCode | null>(null);
  const updatePreferencesRef = useRef(updatePreferences);
  updatePreferencesRef.current = updatePreferences;

  // Carregar preferências do backend quando o usuário fizer login
  useEffect(() => {
    if (!currentUser || userLoading) {
      if (!currentUser) {
        // Se não estiver logado, usa localStorage como fallback
        const saved = localStorage.getItem('baseCurrency');
        if (saved) {
          setBaseCurrencyState(saved as CurrencyCode);
        }
        setIsInitialized(true);
      }
      return;
    }

    if (user?.baseCurrency) {
      const backendCurrency = user.baseCurrency as CurrencyCode;
      // Só atualizar se for diferente do valor atual
      if (backendCurrency !== baseCurrency) {
        // Marcar que estamos atualizando do backend para evitar loop
        isUpdatingFromBackend.current = true;
        lastSavedCurrency.current = backendCurrency;
        setBaseCurrencyState(backendCurrency);
        localStorage.setItem('baseCurrency', backendCurrency);
        // Resetar flag após um pequeno delay
        setTimeout(() => {
          isUpdatingFromBackend.current = false;
        }, 100);
      }
    }
    setIsInitialized(true);
  }, [currentUser, user, userLoading, baseCurrency]);

  // Salvar no backend quando mudar (mas não durante o carregamento inicial ou quando vier do backend)
  useEffect(() => {
    if (!isInitialized || !currentUser || userLoading || isUpdatingFromBackend.current) return;
    
    // Não salvar se o valor não mudou desde a última vez que salvamos
    if (lastSavedCurrency.current === baseCurrency) return;

    const timeoutId = setTimeout(() => {
      if (!isUpdatingFromBackend.current && lastSavedCurrency.current !== baseCurrency) {
        lastSavedCurrency.current = baseCurrency;
        updatePreferencesRef.current.mutate({ baseCurrency });
      }
    }, 500); // Aumentar delay para evitar múltiplas chamadas

    return () => clearTimeout(timeoutId);
  }, [baseCurrency, currentUser, isInitialized, userLoading]);

  const setBaseCurrency = useCallback((currency: CurrencyCode) => {
    setBaseCurrencyState(currency);
    localStorage.setItem('baseCurrency', currency);
    if (currentUser && isInitialized) {
      lastSavedCurrency.current = currency;
      updatePreferencesRef.current.mutate({ baseCurrency: currency });
    }
  }, [currentUser, isInitialized]);

  const getCurrencyInfo = useCallback((): CurrencyInfo => {
    return CURRENCIES[baseCurrency] || CURRENCIES[DEFAULT_CURRENCY];
  }, [baseCurrency]);

  const value = useMemo(() => ({
    baseCurrency,
    setBaseCurrency,
    getCurrencyInfo,
  }), [baseCurrency, setBaseCurrency, getCurrencyInfo]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

