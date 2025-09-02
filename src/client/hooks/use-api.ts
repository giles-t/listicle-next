import { useCallback, useState } from 'react';
import { toast } from "@subframe/core";
import { captureException } from '../../shared/sentry';

type ApiOptions = {
  retries?: number;
  retryDelay?: number;
  toastError?: boolean;
  toastSuccess?: string;
  errorMessage?: string;
};

export function useApi<T, P = void>(
  apiFunction: (params?: P) => Promise<T>,
  options: ApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    retries = 3,
    retryDelay = 1000,
    toastError = true,
    toastSuccess,
    errorMessage = 'An error occurred. Please try again later.',
  } = options;

  const execute = useCallback(async (params?: P): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    let attempts = 0;
    
    while (attempts < retries) {
      try {
        const result = await apiFunction(params);
        setData(result);
        setIsLoading(false);
        
        if (toastSuccess) {
          toast.success(toastSuccess);
        }
        
        return result;
      } catch (err) {
        attempts++;
        
        if (attempts >= retries) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setIsLoading(false);
          
          // Report to Sentry if it's a final failure
          captureException(error, {
            extra: { params, attempts }
          });
          
          // Show user-friendly message
          if (toastError) {
            toast.error(errorMessage);
          }
          
          return null;
        }
        
        // Wait before retry
        await new Promise(r => setTimeout(r, retryDelay));
      }
    }
    
    return null;
  }, [apiFunction, retries, retryDelay, toastError, toastSuccess, errorMessage]);

  const reset = () => {
    setData(null);
    setError(null);
    setIsLoading(false);
  };

  return { 
    execute, 
    data, 
    isLoading, 
    error, 
    reset 
  };
} 