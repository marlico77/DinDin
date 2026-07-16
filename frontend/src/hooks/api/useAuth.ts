import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, isNetworkError } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { saveHouseholdToLocalStorage, loadHouseholdFromLocalStorage } from '../../utils/householdStorage';

export interface User {
  id: string;
  email: string;
  createdAt: string;
  households: Household[];
}

export interface Household {
  id: string;
  name: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Get current authenticated user
 */
export function useAuthUser() {
  const { currentUser } = useAuth();
  const isAuthenticated = !!currentUser;
  
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await apiClient.get<User>('/auth/me');
      const userData = response.data!;
      return userData;
    },
    enabled: isAuthenticated, // Only fetch when user is authenticated
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Allow refetch on mount to ensure fresh data after sync
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Retry function with exponential backoff for network errors
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Only retry on network errors
      if (!isNetworkError(error) || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}



