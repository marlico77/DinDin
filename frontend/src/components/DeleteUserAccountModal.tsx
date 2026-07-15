import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../context/I18nContext';
import { AlertTriangle, X } from 'lucide-react';
import { analyticsHelpers } from '../utils/analytics';

interface DeleteUserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string) => void;
  userEmail: string;
  isDeleting?: boolean;
}

const DeleteUserAccountModal = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
  isDeleting = false,
}: DeleteUserAccountModalProps) => {
  const { t } = useI18n();
  const [email, setEmail] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
    }
  }, [isOpen]);

  // Handler para fechar com ESC e prevenir scroll do body
  useEffect(() => {
    if (!isOpen) return;
    
    // Prevenir scroll do body quando modal estiver aberto
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    // Track modal opened
    analyticsHelpers.logDeleteUserAccountModalOpened();
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isDeleting]);

  if (!isOpen) return null;

  // Verificar se o email digitado corresponde ao email do usuário
  const emailMatches = email.trim().toLowerCase() === userEmail.toLowerCase();
  const canConfirm = emailMatches && !isDeleting;

  const handleConfirm = () => {
    if (canConfirm) {
      analyticsHelpers.logUserAccountDeleted();
      onConfirm(email.trim());
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
                {t.deleteUserAccount || 'Deletar Conta do Usuário'}
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar modal"
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              disabled={isDeleting}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mb-6 space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                {t.confirmDelete || 'Confirmação Necessária'}
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">
                {t.deleteUserAccountWarning || 'Esta ação é permanente e não pode ser desfeita. Todos os seus dados, incluindo transações, contas bancárias, orçamentos e metas serão permanentemente excluídos.'}
              </p>
            </div>

            <div>
              <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.typeEmailToConfirm || 'Digite seu e-mail para confirmar a deleção:'}
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={userEmail || t.emailPlaceholder || 'seu@email.com'}
                disabled={isDeleting}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  email && !emailMatches ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                autoFocus
              />
              {email && !emailMatches && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {t.emailDoesNotMatch || 'O e-mail digitado não corresponde ao seu e-mail.'}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {t.confirmEmailHint || 'É necessário confirmar seu e-mail para deletar sua conta do Recta por segurança.'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
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
              {isDeleting ? (t.loading || 'Deletando...') : (t.delete || 'Deletar Conta')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteUserAccountModal;

