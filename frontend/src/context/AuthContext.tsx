import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback, useRef } from 'react';
import { AuthContextType, User } from '../types';
import { analyticsHelpers } from '../utils/analytics';
import { apiClient as api } from '../utils/api';
import { queryClient } from '../lib/queryClient';
import { clearUserFromLocalStorage } from '../hooks/api/useUsers';
import { clearHouseholdFromLocalStorage } from '../utils/householdStorage';

/**
 * Verificar se está em período de manutenção
 */
const isMaintenanceMode = (): boolean => {
  const maintenanceFlag = import.meta.env.VITE_FLAG_MAINTENANCE;
  return maintenanceFlag === 'true' || maintenanceFlag === true;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = (): AuthContextType => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize from localStorage
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get<any>('/auth/me');
          if (res.success && res.data) {
            setCurrentUser(res.data);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const signup = useCallback(async (email: string, password: string, referralCode?: string) => {
    if (isMaintenanceMode()) {
      throw new Error('O aplicativo está em manutenção. Por favor, tente novamente mais tarde.');
    }
    
    const response = await api.post<any>('/auth/register', { email, password, referralCode });
    if (!response.success) {
      throw new Error(response.error || 'Erro no cadastro');
    }
    
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setCurrentUser(user);
    analyticsHelpers.logSignup('email');
    
    return { user };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (isMaintenanceMode()) {
      throw new Error('O aplicativo está em manutenção. Por favor, tente novamente mais tarde.');
    }
    
    const response = await api.post<any>('/auth/login', { email, password });
    if (!response.success) {
      throw new Error(response.error || 'Erro no login');
    }
    
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setCurrentUser(user);
    analyticsHelpers.logLogin('email');
    
    return { user };
  }, []);


  const logout = useCallback(async () => {
    analyticsHelpers.logLogout();
    
    setCurrentUser(null);
    localStorage.removeItem('token');
    
    // Limpar cache do React Query PRIMEIRO (antes de limpar storage)
    try {
      queryClient.clear();
      queryClient.removeQueries();
      queryClient.resetQueries();
    } catch (error) {}
    
    // Limpar dados específicos do usuário do localStorage
    try {
      clearUserFromLocalStorage();
      clearHouseholdFromLocalStorage();
    } catch (error) {}
    
    // Limpar todo o localStorage
    try {
      localStorage.clear();
    } catch (error) {}
    
    // Limpar sessionStorage
    try {
      sessionStorage.clear();
    } catch (error) {}
    
    // Limpar cache do Service Worker
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      } catch (error) {}
    }
    
    try {
      queryClient.clear();
      queryClient.cancelQueries();
    } catch (error) {}
  }, []);

  const value: AuthContextType = useMemo(() => ({
    currentUser,
    signup,
    login,
    logout,
  }), [currentUser, signup, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
