/**
 * Utilities for storing and retrieving household information in localStorage
 */

const HOUSEHOLD_STORAGE_KEY = 'household_id';
const HOUSEHOLD_STORAGE_TIMESTAMP_KEY = 'household_id_timestamp';

export interface HouseholdInfo {
  id: string;
  name?: string;
  role?: string;
  timestamp: number;
}

/**
 * Save household ID to localStorage
 */
export function saveHouseholdToLocalStorage(householdId: string, householdName?: string, role?: string): void {
  try {
    const householdInfo: HouseholdInfo = {
      id: householdId,
      name: householdName,
      role: role,
      timestamp: Date.now(),
    };
    localStorage.setItem(HOUSEHOLD_STORAGE_KEY, JSON.stringify(householdInfo));
    localStorage.setItem(HOUSEHOLD_STORAGE_TIMESTAMP_KEY, Date.now().toString());
    
    // Dispatch custom event to notify listeners in the same tab
    // Storage events only fire in other tabs/windows, not the current tab
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('householdStorageChange', { 
        detail: householdInfo 
      }));
    }
  } catch (error) {
    // Error saving household to localStorage
  }
}

/**
 * Load household ID from localStorage
 * IMPORTANT: We do NOT invalidate based on timestamp anymore
 * The user's selection should always be respected, regardless of age
 * This ensures that when a user refreshes the page, their selection is preserved
 */
export function loadHouseholdFromLocalStorage(): HouseholdInfo | null {
  try {
    const householdData = localStorage.getItem(HOUSEHOLD_STORAGE_KEY);
    if (!householdData) return null;
    
    const householdInfo = JSON.parse(householdData) as HouseholdInfo;
    
    // Validate that we have at least an ID
    if (!householdInfo || !householdInfo.id || typeof householdInfo.id !== 'string' || householdInfo.id.length === 0) {
      return null;
    }
    
    // Always return the household info if it exists and has a valid ID
    // We removed the timestamp validation because user selections should persist
    // regardless of how old they are - this is an explicit user choice
    return householdInfo;
  } catch (error) {
    return null;
  }
}

/**
 * Clear household from localStorage
 */
export function clearHouseholdFromLocalStorage(): void {
  try {
    localStorage.removeItem(HOUSEHOLD_STORAGE_KEY);
    localStorage.removeItem(HOUSEHOLD_STORAGE_TIMESTAMP_KEY);
  } catch (error) {
    // Error clearing household from localStorage
  }
}

