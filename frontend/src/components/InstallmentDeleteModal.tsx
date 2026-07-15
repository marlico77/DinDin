import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../context/I18nContext';
import { AlertTriangle, X, Trash2, Layers } from 'lucide-react';

interface InstallmentDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteOnly: () => void;
  onDeleteAll: () => void;
}

const InstallmentDeleteModal = ({
  isOpen,
  onClose,
  onDeleteOnly,
  onDeleteAll,
}: InstallmentDeleteModalProps) => {
  const { t } = useI18n();

  // Handler para fechar com ESC e prevenir scroll do body
  useEffect(() => {
    if (!isOpen) return;
    
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Scrollable Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal Card */}
        <div className="relative w-full sm:w-[450px] max-w-lg p-6 border shadow-2xl rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 rounded-full p-2 mr-3">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t.installmentDeleteTitle}
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar modal"
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-300">
              {t.installmentDeleteMessage}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                onDeleteAll();
                onClose();
              }}
              className="w-full flex items-center justify-between p-4 border-2 border-red-100 dark:border-red-900/20 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900 dark:text-gray-100">{t.deleteAllSubsequentInstallments}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t.deleteAllSubsequentHint}</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                onDeleteOnly();
                onClose();
              }}
              className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900 dark:text-gray-100">{t.deleteOnlyThisInstallment}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t.deleteOnlyThisHint}</div>
                </div>
              </div>
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InstallmentDeleteModal;

