import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../utils/api.js';

export interface Feedback {
  id: string;
  email: string;
  score: number;
  feedbackContent: string | null;
  createdAt: string;
}

export interface CreateFeedbackInput {
  score: number; // 1 to 5
  feedbackContent?: string;
}

/**
 * Create feedback mutation
 */
export function useCreateFeedback() {
  return useMutation({
    mutationFn: async (data: CreateFeedbackInput) => {
      const response = await apiClient.post<Feedback>('/feedback', data);
      return response.data!;
    },
  });
}
