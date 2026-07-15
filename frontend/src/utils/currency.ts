// Helper para parsear valor da máscara de moeda
export const parseCurrencyValue = (formattedValue: string): number => {
  if (!formattedValue) return 0;
  const numericString = formattedValue.replace(/\D/g, '');
  if (!numericString) return 0;
  return parseInt(numericString, 10) / 100;
};

