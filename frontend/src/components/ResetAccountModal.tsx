import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../context/I18nContext';
import { AlertTriangle, X } from 'lucide-react';

interface ResetAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isResetting?: boolean;
}

const ResetAccountModal = ({
  isOpen,
  onClose,
  onConfirm,
  isResetting = false,
}: ResetAccountModalProps) => {
  const { t } = useI18n();
  const [confirmationText, setConfirmationText] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmationText('');
    }
  }, [isOpen]);

  // Handler para fechar com ESC e prevenir scroll do body
  useEffect(() => {
    if (!isOpen) return;
    
    // Prevenir scroll do body quando modal estiver aberto
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isResetting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isResetting]);

  if (!isOpen) return null;

  // Verificar se o texto digitado corresponde à confirmação
  const confirmationPhrase = t.resetAccountConfirmationPhrase || 'eu confirmo que quero deletar todos os dados e começar do zero.';
  const textMatches = confirmationText.trim().toLowerCase() === confirmationPhrase.toLowerCase();
  const canConfirm = textMatches && !isResetting;

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canConfirm) {
      handleConfirm();
    }
  };

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
        <div className="relative w-full sm:w-[500px] max-w-md p-6 border shadow-2xl rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 rounded-full p-2 mr-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t.resetRectaAccount || 'Resetar Conta do Recta'}
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar modal"
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              disabled={isResetting}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mb-6 space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                {t.resetAccountWarning || 'Atenção'}
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">
                {t.resetAccountWarningMessage || 'Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão deletados e você começará do zero, incluindo o onboarding.'}
              </p>
            </div>

            <div>
              <label htmlFor="confirmation-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.resetAccountConfirmationLabel || 'Digite a frase de confirmação:'}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 italic">
                "{confirmationPhrase}"
              </p>
              <input
                id="confirmation-input"
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={confirmationPhrase}
                disabled={isResetting}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  confirmationText && !textMatches ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                autoFocus
              />
              {confirmationText && !textMatches && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {t.resetAccountConfirmationMismatch || 'O texto digitado não corresponde à frase de confirmação.'}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isResetting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                canConfirm
                  ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {isResetting ? (t.loading || 'Resetando...') : (t.resetAccount || 'Resetar Conta')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ResetAccountModal;
