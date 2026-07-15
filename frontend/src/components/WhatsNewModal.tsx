import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, CheckCircle2, Users, Tag } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { analyticsHelpers } from '../utils/analytics';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsNewModal = ({ isOpen, onClose }: WhatsNewModalProps) => {
  const { t } = useI18n();
  const [isUnderstood, setIsUnderstood] = useState(false);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Prevenir scroll do body quando modal estiver aberto
  useEffect(() => {
    if (!isOpen) return;
    
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    analyticsHelpers.logWhatsNewModalOpened();
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  // Detectar quando o usuário rola até o final do conteúdo
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const handleScroll = () => {
      const element = contentRef.current;
      if (!element) return;

      // Verificar se chegou ao final (com uma pequena margem de tolerância)
      const isAtBottom = 
        element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
      
      setHasScrolledToEnd(isAtBottom);
    };

    const element = contentRef.current;
    element.addEventListener('scroll', handleScroll);
    
    // Verificar estado inicial
    handleScroll();

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  // Prevenir fechamento com ESC
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (!isUnderstood || !hasScrolledToEnd)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isUnderstood, hasScrolledToEnd]);

  const handleClose = () => {
    if (!isUnderstood || !hasScrolledToEnd) {
      return; // Não permite fechar sem marcar o checkbox e rolar até o final
    }
    analyticsHelpers.logWhatsNewModalClosed(hasScrolledToEnd, isUnderstood);
    localStorage.setItem('whatsNewModalDismissed', 'true');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && (!isUnderstood || !hasScrolledToEnd)) {
      return; // Não permite fechar clicando no backdrop sem marcar o checkbox e rolar até o final
    }
    if (isUnderstood && hasScrolledToEnd) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whats-new-title"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 animate-slide-in-bottom flex flex-col">
        {/* Header - Sem botão de fechar se não estiver marcado */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h2
              id="whats-new-title"
              className="text-xl font-bold text-gray-900 dark:text-gray-100"
            >
              {t.whatsNewTitle || 'Novidades do Recta'}
            </h2>
          </div>
          {isUnderstood && hasScrolledToEnd && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div 
          ref={contentRef}
          className="overflow-y-auto flex-1 p-6 space-y-6"
        >
          <div className="space-y-4">
            {/* Recta Duo: planejamento para mais de uma pessoa */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex-shrink-0">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t.whatsNewTransactionsTitle || 'Recta Duo: planejamento para mais de uma pessoa'}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{t.whatsNewTransactions1 || 'Crie uma household compartilhada pelo seletor, que fica embaixo perto do botão de logout'}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{t.whatsNewTransactions2 || 'Convide outra pessoa por e-mail para gerenciar as finanças em conjunto'}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{t.whatsNewTransactions3 || 'Divida despesas entre os membros ao criar ou editar uma transação'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Categorias personalizadas */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex-shrink-0">
                  <Tag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t.whatsNewCategoriesTitle || 'Categorias personalizadas'}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{t.whatsNewCategories1}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{t.whatsNewCategories2}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Recta Web é grátis */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-600 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                    {t.whatsNewMigrationTitle || 'Recta Web é grátis'}
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">
                    {t.whatsNewMigrationText || 'O Recta Web é e continuará sendo gratuito. Sem custos ocultos.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer com Checkbox - Dentro do conteúdo scrollável */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {!hasScrolledToEnd && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    {t.pleaseScrollToEndToContinue}
                  </p>
                </div>
              )}
              {hasScrolledToEnd && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isUnderstood}
                      onChange={(e) => setIsUnderstood(e.target.checked)}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-primary-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                      {t.whatsNewUnderstand || 'Eu compreendo e li todas as informações acima'}
                    </span>
                  </label>
                  <button
                    onClick={handleClose}
                    disabled={!isUnderstood}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isUnderstood
                        ? 'bg-primary-600 hover:bg-primary-700 text-white cursor-pointer'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {t.whatsNewContinue || 'Continuar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
