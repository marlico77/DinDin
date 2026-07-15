import { useState, useEffect } from 'react';
import { analyticsHelpers } from '../utils/analytics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        analyticsHelpers.logPWAAlreadyInstalled();
        return;
      }

      const nav = window.navigator as Navigator & { standalone?: boolean };
      if (nav.standalone === true) {
        setIsInstalled(true);
        analyticsHelpers.logPWAAlreadyInstalled();
        return;
      }
    };

    checkIfInstalled();

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (isInstalled) {
      return false;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          analyticsHelpers.logPWAInstallAttempted(true, 'deferred_prompt');
          analyticsHelpers.logPWAInstallAccepted();
          return true;
        } else {
          analyticsHelpers.logPWAInstallAttempted(false, 'deferred_prompt');
          analyticsHelpers.logPWAInstallDismissed();
        }
        
        setDeferredPrompt(null);
        return false;
      } catch (error) {
        analyticsHelpers.logPWAInstallAttempted(false, 'error');
        return false;
      }
    } else {
      // Se não há deferredPrompt, pode ser que o navegador não suporte
      // ou o usuário já tenha instalado. Mostrar instruções.
      analyticsHelpers.logPWAInstallAttempted(false, 'no_prompt_available');
      return false;
    }
  };

  return {
    install,
    isInstalled,
    canInstall: !isInstalled && deferredPrompt !== null,
  };
};

