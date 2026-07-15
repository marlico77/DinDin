import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export interface SavingsGoal {
  id: string;
  householdId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  accountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListSavingsGoalsParams {
  householdId: string;
  accountId?: string;
}

/**
 * List savings goals
 */
export function useSavingsGoals(params: ListSavingsGoalsParams) {
  const { currentUser } = useAuth();
  const isAuthenticated = !!currentUser;
  
  return useQuery({
    queryKey: ['savings-goals', params],
    queryFn: async () => {
      const response = await apiClient.get<SavingsGoal[]>('/savings-goals', params);
      return response.data!;
    },
    enabled: isAuthenticated && !!params.householdId, // Only fetch when authenticated and householdId is available
  });
}

/**
 * Get savings goal by ID
 */
export function useSavingsGoal(goalId: string) {
  const { currentUser } = useAuth();
  const isAuthenticated = !!currentUser;
  
  return useQuery({
    queryKey: ['savings-goals', goalId],
    queryFn: async () => {
      const response = await apiClient.get<SavingsGoal>(`/savings-goals/${goalId}`);
      return response.data!;
    },
    enabled: isAuthenticated && !!goalId, // Only fetch when authenticated and goalId is available
  });
}

/**
 * Create savings goal mutation
 */
export function useCreateSavingsGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      householdId?: string; // Optional - backend will create personal household if not provided
      name: string;
      targetAmount: number;
      currentAmount?: number;
      targetDate?: string;
      accountId?: string;
    }) => {
      const response = await apiClient.post<SavingsGoal>('/savings-goals', {
        ...data,
        currentAmount: data.currentAmount ?? 0,
      });
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      // Invalidate auth/me to refresh household list
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

/**
 * Update savings goal mutation
 */
export function useUpdateSavingsGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<SavingsGoal>) => {
      const response = await apiClient.patch<SavingsGoal>(`/savings-goals/${id}`, data);
      return response.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      queryClient.invalidateQueries({ queryKey: ['savings-goals', variables.id] });
    },
  });
}

/**
 * Add to savings goal mutation
 */
export function useAddToSavingsGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ goalId, ...data }: { goalId: string; amount: number; description?: string }) => {
      const response = await apiClient.post<SavingsGoal>(`/savings-goals/${goalId}/add`, data);
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      queryClient.invalidateQueries({ queryKey: ['savings-goals', data.id] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/**
 * Delete savings goal mutation
 */
export function useDeleteSavingsGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      const response = await apiClient.delete<{ id: string }>(`/savings-goals/${goalId}`);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
    },
  });
}

