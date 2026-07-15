import { useCallback, useMemo } from 'react';
import { useReferralCode } from './api/useUsers';

/**
 * Hook to manage referral functionality
 * 
 * NOTE: Referrals are simulated for UX purposes only.
 * No referral data is stored to maintain security.
 */
export const useReferral = () => {
  const { data: referralData, isLoading } = useReferralCode();
  const referralCode = referralData?.referralCode || '';
  const referralCount = referralData?.referralCount || 0;

  const getInviteLink = useCallback((): string => {
    if (!referralCode) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/login?ref=${referralCode}`;
  }, [referralCode]);

  return useMemo(() => ({
    referralCode,
    referralCount,
    getInviteLink,
    loading: isLoading,
  }), [referralCode, referralCount, getInviteLink, isLoading]);
};


