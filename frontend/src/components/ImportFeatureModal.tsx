import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';

interface ImportFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportFeatureModal = ({ isOpen, onClose }: ImportFeatureModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleClose = () => {
    localStorage.setItem('importFeatureModalSeen_v1', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/40 animate-fade-in transition-opacity duration-300 ease-out" 
        onClick={handleClose} 
        aria-hidden="true" 
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full sm:w-96 max-w-md p-4 sm:p-5 border rounded-lg bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto animate-slide-in-bottom">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-light tracking-tight text-gray-900 dark:text-white">
                Como funciona a importação?
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 dark:text-gray-500 hover:opacity-70 transition-opacity p-1"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-4 text-sm font-light text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>O sistema agora possui <b>Importação Inteligente</b> para seus arquivos CSV e OFX.</p>
              
              <p>Isso significa que transações duplicadas (como reenviar um extrato parcial que contém gastos já importados) serão automaticamente ignoradas.</p>
              
              <p>Além disso, o saldo atual da sua conta será ajustado milimetricamente de acordo com o saldo final oficial que estiver registrado no extrato do seu banco.</p>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-primary-600 dark:bg-primary-500 text-white rounded-md text-sm font-light hover:opacity-90 transition-opacity mt-4"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
