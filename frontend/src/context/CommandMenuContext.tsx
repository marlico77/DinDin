import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import CommandMenu from '../components/CommandMenu';

interface CommandMenuContextType {
  registerHandler: (key: string, handler: () => void) => void;
  unregisterHandler: (key: string) => void;
  registerConfettiHandler: (onConfetti: () => void) => void;
  setDisabled: (disabled: boolean) => void;
}

const CommandMenuContext = createContext<CommandMenuContextType>({} as CommandMenuContextType);

export const useCommandMenu = () => useContext(CommandMenuContext);

interface CommandMenuProviderProps {
  children: ReactNode;
}

export const CommandMenuProvider: React.FC<CommandMenuProviderProps> = ({ children }) => {
  const [handlers, setHandlers] = useState<Record<string, () => void>>({});
  const [confettiHandler, setConfettiHandler] = useState<(() => void) | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  const registerHandler = useCallback((key: string, handler: () => void) => {
    setHandlers(prev => ({ ...prev, [key]: handler }));
  }, []);

  const unregisterHandler = useCallback((key: string) => {
    setHandlers(prev => {
      // Só atualizar se a chave realmente existe
      if (!(key in prev)) {
        return prev; // Retornar o mesmo objeto se não há mudança
      }
      const newHandlers = { ...prev };
      delete newHandlers[key];
      return newHandlers;
    });
  }, []);

  const registerConfettiHandler = useCallback((onConfetti: () => void) => {
    setConfettiHandler(() => onConfetti);
  }, []);

  const setDisabled = useCallback((disabled: boolean) => {
    setIsDisabled(disabled);
  }, []);

  return (
    <CommandMenuContext.Provider value={{ registerHandler, unregisterHandler, registerConfettiHandler, setDisabled }}>
      {children}
      <CommandMenu
        onNewTransaction={() => handlers.newTransaction?.()}
        onNewRecurring={() => handlers.newRecurring?.()}
        onNewBudget={() => handlers.newBudget?.()}
        onNewAccount={() => handlers.newAccount?.()}
        onNewGoal={() => handlers.newGoal?.()}
        onRestartOnboarding={handlers.restartOnboarding ? () => handlers.restartOnboarding() : undefined}
        onShowConfetti={confettiHandler || undefined}
        onShowMonthlyRecap={handlers.showMonthlyRecap ? () => handlers.showMonthlyRecap() : undefined}
        disabled={isDisabled}
      />
    </CommandMenuContext.Provider>
  );
};

