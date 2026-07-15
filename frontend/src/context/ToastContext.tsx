import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useToast, ToastType } from '../hooks/useToast';
import { ToastContainer } from '../components/ToastContainer';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({} as ToastContextType);

export const useToastContext = () => useContext(ToastContext);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const { toasts, showToast, removeToast, success, error, info, warning } = useToast();

  const value = useMemo(() => ({ 
    showToast, success, error, info, warning 
  }), [showToast, success, error, info, warning]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

