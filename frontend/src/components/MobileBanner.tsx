import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../context/I18nContext';
import { Smartphone } from 'lucide-react';

const MOBILE_BANNER_DISMISSED_KEY = 'mobile-banner-dismissed';

const MobileBanner = () => {
  const { t } = useI18n();
  // Check localStorage synchronously on initial render
  const dismissed = typeof window !== 'undefined' && localStorage.getItem(MOBILE_BANNER_DISMISSED_KEY) === 'true';
  const [isVisible, setIsVisible] = useState(() => {
    if (dismissed) return false;
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  });
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple checks
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    // Double-check dismissal status
    const isDismissed = localStorage.getItem(MOBILE_BANNER_DISMISSED_KEY) === 'true';
    if (isDismissed) {
      setIsVisible(false);
      return;
    }

    // Check if device is mobile (width <= 768px)
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      const stillDismissed = localStorage.getItem(MOBILE_BANNER_DISMISSED_KEY) === 'true';
      if (!stillDismissed) {
        setIsVisible(mobile);
      }
    };

    // Initial check
    checkMobile();

    // Check on resize (only if not dismissed)
    const handleResize = () => {
      if (localStorage.getItem(MOBILE_BANNER_DISMISSED_KEY) !== 'true') {
        checkMobile();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(MOBILE_BANNER_DISMISSED_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible || dismissed) {
    return null;
  }

  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto bg-yellow-50/90 dark:bg-yellow-900/90 backdrop-blur-md border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-lg">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                {t.mobileBannerTitle}
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
                {t.mobileBannerMessage}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-full px-3 py-1.5 text-sm font-medium text-yellow-800 dark:text-yellow-200 bg-yellow-100/90 dark:bg-yellow-900/90 backdrop-blur-sm hover:bg-yellow-200/90 dark:hover:bg-yellow-900 rounded-md transition-colors"
            aria-label="Fechar banner"
          >
            de boas Primo
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileBanner;

