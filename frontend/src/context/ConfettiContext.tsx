import { createContext, useContext, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { useCommandMenu } from './CommandMenuContext';
import canvasConfetti from 'canvas-confetti';

// Garantir que temos a função correta, lidando com diferentes formas de importação em prod/dev
const confetti = (canvasConfetti as any)?.default || canvasConfetti;

interface ConfettiContextType {
  showConfetti: () => void;
}

const ConfettiContext = createContext<ConfettiContextType>({} as ConfettiContextType);

export const useConfetti = (): ConfettiContextType => useContext(ConfettiContext);

interface ConfettiProviderProps {
  children: ReactNode;
}

export const ConfettiProvider = ({ children }: ConfettiProviderProps) => {
  const { registerConfettiHandler } = useCommandMenu();

  const showConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100000 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Disparo inicial mais forte
    try {
      if (typeof confetti === 'function') {
        confetti({
          ...defaults,
          particleCount: 150,
          origin: { y: 0.6 }
        });
      } else {
        // Confetti function is not available
      }
    } catch (err) {
      // Error showing confetti
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 100 * (timeLeft / duration);

      try {
        if (typeof confetti === 'function') {
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          });
        }
      } catch (err) {
        // Error showing interval confetti
      }
    }, 250);
  }, []);

  // Registrar handler no CommandMenu
  useEffect(() => {
    if (registerConfettiHandler) {
      registerConfettiHandler(showConfetti);
    }
  }, [registerConfettiHandler, showConfetti]);

  const value: ConfettiContextType = useMemo(() => ({
    showConfetti,
  }), [showConfetti]);

  return (
    <ConfettiContext.Provider value={value}>
      {children}
    </ConfettiContext.Provider>
  );
};

