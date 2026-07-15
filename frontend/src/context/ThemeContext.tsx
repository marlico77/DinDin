import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useUser, useUpdateUserPreferences } from '../hooks/api/useUsers';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Only fetch user data if authenticated - this prevents queries from running before login
  const { data: user, isLoading: userLoading } = useUser();
  const updatePreferences = useUpdateUserPreferences();
  
  // Inicializar tema e aplicar imediatamente no HTML
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    
    const saved = localStorage.getItem('theme') as Theme;
    if (saved === 'dark' || saved === 'light') {
      // Aplicar imediatamente no HTML antes do React renderizar
      const root = document.documentElement;
      if (saved === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      return saved;
    }
    
    // Verificar preferência do sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      return 'dark';
    }
    
    document.documentElement.classList.remove('dark');
    return 'light';
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [isInitialized, setIsInitialized] = useState(false);
  const isUpdatingFromBackend = useRef(false);
  const lastSavedTheme = useRef<Theme | null>(null);
  const hasLoadedFromBackend = useRef(false);
  const updatePreferencesRef = useRef(updatePreferences);
  updatePreferencesRef.current = updatePreferences;

  // Aplicar tema no documento sempre que mudar (apenas como fallback de segurança)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Carregar preferências do backend quando o usuário fizer login (apenas uma vez)
  useEffect(() => {
    if (!currentUser || userLoading) {
      if (!currentUser) {
        // Se não estiver logado, resetar flag e usa localStorage como fallback
        hasLoadedFromBackend.current = false;
        const saved = localStorage.getItem('theme') as Theme;
        if (saved && saved !== theme) {
          setThemeState(saved);
          const root = document.documentElement;
          if (saved === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
        setIsInitialized(true);
      }
      return;
    }

    // Só carregar do backend uma vez quando o usuário fizer login
    if (!hasLoadedFromBackend.current) {
      if (user?.theme) {
        const backendTheme = user.theme as Theme;
        // Só atualizar se for diferente do valor atual
        if (backendTheme !== theme) {
          // Marcar que estamos atualizando do backend para evitar loop
          isUpdatingFromBackend.current = true;
          lastSavedTheme.current = backendTheme;
          setThemeState(backendTheme);
          localStorage.setItem('theme', backendTheme);
          const root = document.documentElement;
          if (backendTheme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
          // Resetar flag após um pequeno delay
          setTimeout(() => {
            isUpdatingFromBackend.current = false;
          }, 100);
        }
      }
      // Marcar como carregado mesmo se não houver tema no backend
      hasLoadedFromBackend.current = true;
    }
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, user, userLoading]); // Remover 'theme' das dependências para evitar loops

  // Salvar no backend quando mudar (mas não durante o carregamento inicial ou quando vier do backend)
  // Este useEffect é apenas um fallback de segurança - o toggleTheme e setTheme já salvam diretamente
  useEffect(() => {
    if (!isInitialized || !currentUser || userLoading || isUpdatingFromBackend.current) return;
    
    // Não salvar se o valor não mudou desde a última vez que salvamos
    if (lastSavedTheme.current === theme) return;
    
    // Não salvar se acabou de carregar do backend
    if (!hasLoadedFromBackend.current) return;

    const timeoutId = setTimeout(() => {
      if (!isUpdatingFromBackend.current && lastSavedTheme.current !== theme && hasLoadedFromBackend.current) {
        lastSavedTheme.current = theme;
        updatePreferencesRef.current.mutate({ theme });
      }
    }, 300); // Reduzir delay para resposta mais rápida

    return () => clearTimeout(timeoutId);
  }, [theme, currentUser, isInitialized, userLoading]);

  const setTheme = (newTheme: Theme) => {
    // Prevenir atualização se estiver carregando do backend
    if (isUpdatingFromBackend.current) return;
    
    // Aplicar imediatamente no documento ANTES de atualizar o estado
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Marcar que não veio do backend para evitar conflitos
    hasLoadedFromBackend.current = true;
    
    // Salvar no backend se o usuário estiver logado (de forma assíncrona)
    if (currentUser && isInitialized) {
      lastSavedTheme.current = newTheme;
      // Usar requestAnimationFrame para garantir que a UI atualize primeiro
      requestAnimationFrame(() => {
        updatePreferencesRef.current.mutate({ theme: newTheme });
      });
    }
  };

  const toggleTheme = () => {
    // Prevenir atualização se estiver carregando do backend
    if (isUpdatingFromBackend.current) return;
    
    setThemeState((currentTheme) => {
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      // Aplicar imediatamente no documento ANTES de atualizar o estado
      // Isso garante que a mudança visual seja instantânea
      const root = document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Salvar imediatamente no localStorage
      localStorage.setItem('theme', newTheme);
      
      // Marcar que não veio do backend para evitar conflitos
      hasLoadedFromBackend.current = true;
      
      // Track analytics (only if not from backend load)
      if (currentUser && isInitialized && !isUpdatingFromBackend.current) {
        import('../utils/analytics').then(({ analyticsHelpers }) => {
          analyticsHelpers.logThemeChanged(newTheme);
        });
      }
      
      // Salvar no backend se o usuário estiver logado (de forma assíncrona)
      if (currentUser && isInitialized) {
        lastSavedTheme.current = newTheme;
        // Usar requestAnimationFrame para garantir que a UI atualize primeiro
        requestAnimationFrame(() => {
          updatePreferencesRef.current.mutate({ theme: newTheme });
        });
      }
      
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

