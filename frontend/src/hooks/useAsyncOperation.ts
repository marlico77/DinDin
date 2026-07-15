import { useState, useCallback } from 'react';

interface UseAsyncOperationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

interface UseAsyncOperationReturn<T extends (...args: any[]) => Promise<any>> {
  execute: (...args: Parameters<T>) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useAsyncOperation<T extends (...args: any[]) => Promise<any>>(
  operation: T,
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: Parameters<T>) => {
      setLoading(true);
      setError(null);

      try {
        await operation(...args);
        options.onSuccess?.();
      } catch (err: any) {
        const errorMsg = err.message || options.errorMessage || 'Ocorreu um erro. Tente novamente.';
        setError(errorMsg);
        options.onError?.(err);
      } finally {
        setLoading(false);
      }
    },
    [operation, options]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { execute, loading, error, clearError };
}

