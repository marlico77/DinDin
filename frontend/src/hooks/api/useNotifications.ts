import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export interface Notification {
  id: string;
  userId: string;
  type: 'HOUSEHOLD_INVITE' | 'BUDGET_ALERT' | 'TRANSACTION_REMINDER' | 'GOAL_UPDATE';
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  title: string;
  message: string;
  metadata?: {
    inviteId?: string;
    householdId?: string;
    householdName?: string;
    inviterName?: string;
    role?: string;
    budgetId?: string;
    categoryName?: string;
    percentage?: number;
    cancelledByInviter?: boolean;
    acceptedByMe?: boolean;
    [key: string]: any;
  };
  deepLink?: string;
  readAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface NotificationsResponse {
  data: Notification[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export interface UnreadCountResponse {
  count: number;
}

/**
 * Get all notifications for the current user with intelligent polling
 * Polling interval adapts based on unread count:
 * - 0 unread: 120s (2 minutes)
 * - 1-5 unread: 30s (30 seconds)
 * - 6+ unread: 15s (15 seconds)
 */
export function useNotifications(params?: {
  status?: 'UNREAD' | 'READ' | 'ARCHIVED';
  type?: Notification['type'];
  limit?: number;
  cursor?: string;
}) {
  const { currentUser } = useAuth();
  const isAuthenticated = !!currentUser;

  // Get unread count first to determine polling interval
  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications', 'unread', 'count'],
    queryFn: async () => {
      const response = await apiClient.get<UnreadCountResponse>('/notifications/unread/count');
      return response.data || { count: 0 };
    },
    enabled: isAuthenticated,
    refetchInterval: 60000, // Check unread count every minute (separate from notifications)
    staleTime: 0,
  });

  const unreadCount = unreadCountData?.count || 0;

  // Calculate intelligent polling interval based on unread count
  const getPollingInterval = (count: number): number | false => {
    if (!isAuthenticated) return false; // Disable polling when not authenticated
    if (count === 0) return 120000; // 2 minutes when no unread
    if (count <= 5) return 30000; // 30 seconds when 1-5 unread
    return 15000; // 15 seconds when 6+ unread
  };

  const pollingInterval = getPollingInterval(unreadCount);

  const query = useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const queryParams: Record<string, any> = {};
      if (params?.status) queryParams.status = params.status;
      if (params?.type) queryParams.type = params.type;
      if (params?.limit) queryParams.limit = params.limit;
      if (params?.cursor) queryParams.cursor = params.cursor;

      // Backend returns { success: true, data: Notification[], pagination: {...} }
      // apiClient.get returns ApiResponse<T> where T is the type of the 'data' field
      // We need to get both data and pagination, so we use a type assertion
      const response = await apiClient.get<Notification[]>('/notifications', queryParams) as ApiResponse<Notification[]> & { pagination?: { hasMore: boolean; nextCursor: string | null } };
      
      // Extract data and pagination from response
      // response.data is Notification[] (array of notifications)
      // response.pagination is the pagination info (if present)
      const notifications = (response.success && response.data) ? response.data : [];
      const pagination = (response as any).pagination || { hasMore: false, nextCursor: null };
      
      return {
        data: notifications,
        pagination,
      };
    },
    enabled: isAuthenticated,
    refetchInterval: pollingInterval, // Intelligent polling based on unread count
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always refetch on mount for fresh data
    staleTime: 0, // Always consider stale for real-time updates
  });

  return query;
}

/**
 * Get unread notifications count
 */
export function useUnreadNotificationsCount() {
  const { currentUser } = useAuth();
  const isAuthenticated = !!currentUser;

  return useQuery({
    queryKey: ['notifications', 'unread', 'count'],
    queryFn: async () => {
      const response = await apiClient.get<UnreadCountResponse>('/notifications/unread/count');
      return response.data || { count: 0 };
    },
    enabled: isAuthenticated,
    refetchInterval: 60000, // Check every minute
    staleTime: 0,
  });
}

/**
 * Get unread notifications only (convenience hook)
 */
export function useUnreadNotifications() {
  return useNotifications({ status: 'UNREAD' });
}

/**
 * Mark a notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiClient.post(`/notifications/${notificationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all notification queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/notifications/read-all');
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all notification queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Update notification status (read/unread/archived)
 */
export function useUpdateNotificationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notificationId, status }: { notificationId: string; status: 'UNREAD' | 'READ' | 'ARCHIVED' }) => {
      const response = await apiClient.patch(`/notifications/${notificationId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Get a single notification by ID
 */
export function useNotification(notificationId: string) {
  const { currentUser } = useAuth();
  const isAuthenticated = !!currentUser;

  return useQuery({
    queryKey: ['notifications', notificationId],
    queryFn: async () => {
      const response = await apiClient.get<Notification>(`/notifications/${notificationId}`);
      return response.data;
    },
    enabled: isAuthenticated && !!notificationId,
  });
}
