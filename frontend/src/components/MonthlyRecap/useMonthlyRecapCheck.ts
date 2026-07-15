import { useState, useEffect } from 'react';
import { isLastDayOfMonth } from 'date-fns';

/**
 * Hook to check if we should show the monthly recap
 * Shows on the last day of the month
 */
export function useMonthlyRecapCheck() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const checkShouldShow = () => {
      const today = new Date();
      const isLastDay = isLastDayOfMonth(today);
      
      if (!isLastDay) {
        setShouldShow(false);
        return;
      }

      // Check if user has already seen this month's recap
      const lastShownMonth = localStorage.getItem('monthlyRecapLastShown');
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      
      if (lastShownMonth === currentMonth) {
        setShouldShow(false);
        return;
      }

      setShouldShow(true);
    };

    checkShouldShow();
    
    // Check every hour in case the day changes
    const interval = setInterval(checkShouldShow, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const markAsSeen = () => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    localStorage.setItem('monthlyRecapLastShown', currentMonth);
    setShouldShow(false);
  };

  return { shouldShow, markAsSeen };
}
