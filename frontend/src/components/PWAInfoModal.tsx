import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Download, Smartphone, Monitor, Sparkles } from "lucide-react";
import { useI18n } from "../context/I18nContext";
import { analyticsHelpers } from "../utils/analytics";

interface PWAInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: "landing_page" | "dashboard";
}

export const PWAInfoModal = ({
  isOpen,
  onClose,
  source = "dashboard",
}: PWAInfoModalProps) => {
  const { t } = useI18n();
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
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
  }, []);

  // Log quando o modal é aberto
  useEffect(() => {
    if (isOpen && !isInstalled) {
      analyticsHelpers.logPWAInfoModalShown(source);
    }
  }, [isOpen, isInstalled, source]);

  const handleDontShowAgain = () => {
    localStorage.setItem("pwaInfoModalDismissed", "true");
    analyticsHelpers.logPWAInfoModalDontShowAgain(source);
    onClose();
  };

  const handleClose = () => {
    analyticsHelpers.logPWAInfoModalClosed(source);
    onClose();
  };

  if (!isOpen || isInstalled) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-info-title"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 animate-slide-in-bottom">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h2
              id="pwa-info-title"
              className="text-xl font-bold text-gray-900 dark:text-gray-100"
            >
              {t.pwaInfoTitle || "Nova funcionalidade disponível!"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={t.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t.pwaInfoDescription ||
              "Agora você pode instalar o Recta na tela inicial do seu celular ou computador para acesso rápido e melhor experiência!"}
          </p>

          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Smartphone className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                  {t.pwaInfoMobileTitle || "No celular"}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t.pwaInfoMobileDescription ||
                    'Toque no menu do navegador e selecione "Adicionar à tela inicial"'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Monitor className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                  {t.pwaInfoDesktopTitle || "No computador"}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t.pwaInfoDesktopDescription ||
                    "Clique no ícone de instalação na barra de endereços ou no menu do navegador"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t.pwaInfoBenefit ||
                "Acesso rápido e experiência como app nativo!"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleDontShowAgain}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {t.dontShowAgain || "Não mostrar novamente"}
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            {t.gotIt || "Entendi!"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
