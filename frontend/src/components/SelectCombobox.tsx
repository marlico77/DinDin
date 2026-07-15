import * as Popover from '@radix-ui/react-popover';
import { useState, useMemo, ChangeEvent, KeyboardEvent, memo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

interface Option {
  value: string;
  label: string;
}

interface SelectComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  searchable?: boolean; // Mantido para compatibilidade, mas sempre será true
  disabled?: boolean;
}

const SelectCombobox = ({ 
  value, 
  onValueChange, 
  options = [], 
  placeholder,
  disabled = false
}: SelectComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useI18n();

  const displayPlaceholder = placeholder || t.select;

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option =>
      (option.label || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const selectedOption = useMemo(() => 
    options.find(opt => opt.value === value),
    [options, value]
  );

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredOptions.length > 0) {
      e.preventDefault();
      handleSelect(filteredOptions[0].value);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <Popover.Root open={disabled ? false : open} onOpenChange={disabled ? undefined : setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`inline-flex items-center justify-between w-full h-10 px-3 text-sm leading-none border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
            disabled 
              ? 'bg-gray-100 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-700' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
            {selectedOption?.label || displayPlaceholder}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="w-[var(--radix-popover-trigger-width)] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[100] p-1 max-h-[300px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
          sideOffset={4}
        >
          <div className="relative px-2 py-1.5 border-b border-gray-200 dark:border-gray-700">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.search + '...'}
              className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                {t.noResults}
              </div>
            ) : (
              <div className="py-1">
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left rounded-sm hover:bg-primary-100 dark:hover:bg-primary-900/30 focus:bg-primary-100 dark:focus:bg-primary-900/30 focus:outline-none cursor-pointer ${
                      value === option.value ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <span className="text-gray-900 dark:text-gray-100">{option.label}</span>
                    {value === option.value && (
                      <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default memo(SelectCombobox);

