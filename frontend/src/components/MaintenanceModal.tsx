import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Wallet } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

interface MaintenanceModalProps {
  endTime: Date;
}

export const MaintenanceModal = ({ endTime }: MaintenanceModalProps) => {
  const { t, locale } = useI18n();
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number } | null>(null);

  // Calcular tempo restante e atualizar a cada minuto
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining(null);
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining({ hours, minutes });
    };

    // Calcular imediatamente
    calculateTimeRemaining();

    // Atualizar a cada minuto
    const interval = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [endTime]);

  const formattedEndTime = endTime.toLocaleTimeString(locale, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800">
        {/* Loading Animation */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            {/* Spinner circular animado */}
            <div className="h-20 w-20">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary-600 border-r-primary-600"></div>
            </div>
            
            {/* Ícone de carteira no centro */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Wallet className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.maintenanceInProgress}
          </h2>
          
          <div className="mb-6 space-y-3 text-gray-600 dark:text-gray-400">
            <p className="text-base leading-relaxed">
              {t.maintenanceMessage1}
            </p>
            <p className="text-base leading-relaxed">
              {t.maintenanceMessage2}
            </p>
          </div>

          {/* Informações de tempo */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.maintenanceEstimatedEnd}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formattedEndTime}
                </span>
              </div>
              {timeRemaining && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t.maintenanceTimeRemaining}</span>
                  <span className="font-semibold text-primary-600">
                    {timeRemaining.hours}h {timeRemaining.minutes}min
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mensagem adicional */}
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t.maintenanceTryAgainLater}
          </p>
        </div>

        {/* Pontos animados */}
        <div className="mt-6 flex justify-center space-x-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary-600" style={{ animationDelay: '0s' }}></div>
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary-600" style={{ animationDelay: '0.2s' }}></div>
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary-600" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>,
    document.body
  );
};

