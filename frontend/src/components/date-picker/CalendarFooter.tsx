import { useI18n } from '../../context/I18nContext';

interface CalendarFooterProps {
  selectedDate: Date | null;
  onToday: () => void;
  onClear: () => void;
}

export const CalendarFooter = ({
  selectedDate,
  onToday,
  onClear,
}: CalendarFooterProps) => {
  const { locale } = useI18n();

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={onToday}
        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
      >
        {locale === 'pt-BR' ? 'Usar hoje' : 'Use today'}
      </button>
      {selectedDate && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          {locale === 'pt-BR' ? 'Limpar' : 'Clear'}
        </button>
      )}
    </div>
  );
};
