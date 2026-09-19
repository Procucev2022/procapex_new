import type { ManagedVendor } from '@/types';
import { SEED_MANAGED_VENDORS } from '@/constants/vendor-management';
import { logger } from '@/lib/logger';

export const STORAGE_KEY_VENDORS = 'procapex_managed_vendors_v1';

/**
 * Loads managed vendors from localStorage if available, merging with SEED_MANAGED_VENDORS.
 */
export function getStoredVendors(): ManagedVendor[] {
  if (typeof window === 'undefined') {
    return SEED_MANAGED_VENDORS;
  }
  try {
    const cached = window.localStorage.getItem(STORAGE_KEY_VENDORS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const merged: ManagedVendor[] = [...parsed];
        SEED_MANAGED_VENDORS.forEach((seed) => {
          const exists = merged.some(
            (m) => m.id === seed.id || m.name.toLowerCase().trim() === seed.name.toLowerCase().trim()
          );
          if (!exists) {
            merged.push(seed);
          }
        });
        return merged;
      }
    }
  } catch (err) {
    logger.warn('lib/vendor-storage', 'Failed reading vendors from localStorage', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
  return SEED_MANAGED_VENDORS;
}

/**
 * Persists managed vendors to localStorage.
 */
export function persistStoredVendors(vendors: ManagedVendor[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify(vendors));
  } catch (err) {
    logger.warn('lib/vendor-storage', 'Failed persisting vendors to localStorage', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
