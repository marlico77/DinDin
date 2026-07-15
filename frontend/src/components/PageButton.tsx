import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PageButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: LucideIcon;
  className?: string;
  'aria-label'?: string;
}

export const PageButton = ({
  onClick,
  children,
  variant = 'primary',
  icon: Icon,
  className = '',
  'aria-label': ariaLabel,
}: PageButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2.5 border text-sm font-light tracking-tight rounded-md focus:outline-none transition-opacity whitespace-nowrap hover:opacity-80';
  
  const variantClasses = {
    primary: 'border-primary-600 dark:border-primary-500 text-white bg-primary-600 dark:bg-primary-500',
    secondary: 'border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900',
    danger: 'border-red-500 dark:border-red-500 text-white bg-red-500 dark:bg-red-500',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} w-full sm:w-auto ${className}`}
      aria-label={ariaLabel}
    >
      {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" aria-hidden="true" />}
      <span className="hidden sm:inline whitespace-nowrap">{children}</span>
      <span className="sm:hidden whitespace-nowrap">
        {typeof children === 'string' ? children.split(' ')[0] : children}
      </span>
    </button>
  );
};

