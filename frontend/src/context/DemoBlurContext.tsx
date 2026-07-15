import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

interface DemoBlurContextType {
  isBlurred: boolean;
  toggleBlur: () => void;
}

const DemoBlurContext = createContext<DemoBlurContextType | undefined>(undefined);

export const DemoBlurProvider = ({ children }: { children: ReactNode }) => {
  const [isBlurred, setIsBlurred] = useState<boolean>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('demo-blur-enabled');
    return saved === 'true';
  });

  useEffect(() => {
    // Save to localStorage when it changes
    localStorage.setItem('demo-blur-enabled', isBlurred.toString());
  }, [isBlurred]);

  const toggleBlur = useCallback(() => {
    setIsBlurred((prev) => !prev);
  }, []);

  const value = useMemo(() => ({ isBlurred, toggleBlur }), [isBlurred, toggleBlur]);

  return (
    <DemoBlurContext.Provider value={value}>
      {children}
    </DemoBlurContext.Provider>
  );
};

export const useDemoBlur = () => {
  const context = useContext(DemoBlurContext);
  if (context === undefined) {
    throw new Error('useDemoBlur must be used within a DemoBlurProvider');
  }
  return context;
};

