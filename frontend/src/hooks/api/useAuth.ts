import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';


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
