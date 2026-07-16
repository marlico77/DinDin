interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner = ({ size = 48, className = '' }: LoadingSpinnerProps) => {

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
          <div 
            className="logo-mask bg-primary-600 dark:bg-primary-400 wallet-loader animate-pulse" 
            style={{ width: size, height: size }}
            aria-label="Loading" 
          />
      </div>
    </div>
  );
};

