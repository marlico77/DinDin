import { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'success' | 'danger' | 'primary';
}

export const QuickActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = 'primary',
}: QuickActionButtonProps) => {
  const variantClasses = {
    success: 'bg-green-500 dark:bg-green-500 text-white border-green-500 dark:border-green-500',
    danger: 'bg-red-500 dark:bg-red-500 text-white border-red-500 dark:border-red-500',
    primary: 'bg-primary-600 dark:bg-primary-500 text-white border-primary-600 dark:border-primary-500',
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center px-4 py-2.5 border text-sm font-light tracking-tight rounded-md focus:outline-none transition-opacity hover:opacity-80 w-full sm:w-auto ${variantClasses[variant]}`}
      aria-label={label}
    >
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-0 sm:mr-2 flex-shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline whitespace-nowrap">{label}</span>
      <span className="sm:hidden whitespace-nowrap">{label.split(' ')[0]}</span>
    </button>
  );
};
