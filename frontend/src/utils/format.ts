import { CurrencyCode, DEFAULT_CURRENCY, CURRENCIES } from '../context/CurrencyContext';

// Type guard to check if a string is a valid CurrencyCode
const isValidCurrencyCode = (code: string | undefined): code is CurrencyCode => {
  return !!code && code in CURRENCIES;
};

// Função auxiliar para formatar moeda (usa moeda do contexto ou padrão)
// Nota: Para usar a moeda base do contexto, use useCurrency() hook nos componentes
export const formatCurrency = (value: number | null | undefined, currency?: CurrencyCode | string): string => {
  // Tratar valores inválidos (NaN, null, undefined)
  if (value === null || value === undefined || isNaN(value)) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0);
  }
  
  // Validate currency code, fallback to default if invalid
  const validCurrency = isValidCurrencyCode(currency) ? currency : DEFAULT_CURRENCY;
  const currencyInfo = CURRENCIES[validCurrency];
  return new Intl.NumberFormat(currencyInfo.locale, {
    style: 'currency',
    currency: currencyInfo.code,
    minimumFractionDigits: currencyInfo.decimalPlaces,
    maximumFractionDigits: currencyInfo.decimalPlaces,
  }).format(value);
};

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  // Convert to Date if it's a string
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
};

export const formatDateInput = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date to YYYY-MM-DD using local time values (not UTC)
 * This prevents timezone conversion issues where dates can shift by a day
 * Use this when sending dates to the API
 */
export const formatDateForAPI = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  // Use local time values to avoid timezone conversion issues
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse date string from API (YYYY-MM-DD or ISO format) as local date (not UTC)
 * When you do new Date("2024-01-07"), JavaScript interprets it as UTC midnight,
 * which becomes the previous day in UTC-3. This function parses it as local time.
 */
export const parseDateFromAPI = (dateString: string | Date): Date => {
  if (dateString instanceof Date) {
    return dateString;
  }
  
  // Check if it's ISO format (contains 'T' or 'Z')
  if (dateString.includes('T') || dateString.includes('Z')) {
    // ISO format: extract just the date part (YYYY-MM-DD)
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    // Create date in local timezone (not UTC)
    return new Date(year, month - 1, day);
  }
  
  // Simple YYYY-MM-DD format
  const [year, month, day] = dateString.split('-').map(Number);
  // Validate that we got valid numbers
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    // Fallback: try parsing as regular Date
    const fallbackDate = new Date(dateString);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }
    throw new Error(`Invalid date format: ${dateString}`);
  }
  // Create date in local timezone (not UTC)
  return new Date(year, month - 1, day);
};

