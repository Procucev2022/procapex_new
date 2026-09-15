import { useState, useEffect } from 'react';
import type {
  ManagedVendor,
  VendorCSVRow,
  VendorEvaluationSubmission,
  VendorEvaluationScoreResult,
  VendorPPORating,
  AuditLog,
  TenantKey,
} from '@/types';
import { SEED_MANAGED_VENDORS } from '@/constants';
import { calculateVendorEvaluationScore, calculateCompositeRating } from '@/lib/vendor-evaluation';
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
    logger.warn('context/vendor-manager', 'Failed reading vendors from localStorage', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
  return SEED_MANAGED_VENDORS;
}

export function persistVendorsToStorage(vendors: ManagedVendor[]): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify(vendors));
    } catch (err) {
      logger.warn('context/vendor-manager', 'Failed saving vendors to localStorage', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

export interface UseVendorManagerResult {
  managedVendors: ManagedVendor[];
  addClientVendors: (newVendors: VendorCSVRow[]) => void;
  addSingleClientVendor: (
    vendorData: Omit<
      ManagedVendor,
      'id' | 'source' | 'evaluationStatus' | 'ppoRatings' | 'compositeRating' | 'totalPPOsCompleted'
    >
  ) => void;
  submitVendorEvaluation: (
    vendorId: string,
    submission: VendorEvaluationSubmission
  ) => VendorEvaluationScoreResult;
  submitPPORating: (
    vendorId: string,
    rating: Omit<VendorPPORating, 'id' | 'ratedAt'>
  ) => void;
  sendEvaluationInvite: (vendorId: string, email: string) => void;
  resetVendors: () => void;
}

export function useVendorManager(
  activeTenantKey: TenantKey,
  activeTenantName: string,
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>
): UseVendorManagerResult {
  const [managedVendors, setManagedVendors] = useState<ManagedVendor[]>(SEED_MANAGED_VENDORS);

  useEffect(() => {
    const stored = getStoredVendors();
    if (stored && stored.length > 0) {
      setManagedVendors(stored);
    }
  }, []);

  const addClientVendors = (newVendors: VendorCSVRow[]): void => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const createdVendors: ManagedVendor[] = newVendors.map((row, idx) => ({
      id: `CLT-VND-${Date.now()}-${idx + 1}`,
      name: row.name,
      category: row.category,
      subCategory: row.subCategory,
      region: row.region,
      regionLabel: `${row.region} (${row.city})`,
      rating: 4.0,
      reviewsCount: 0,
      isRateCard: false,
      rateCardCode: null,
      rateCardStatus: 'Client Empanelled',
      contactPerson: row.contactPerson,
      gstin: row.gstin,
      city: row.city,
      leadTime: row.leadTime,
      badgeText: 'Client Boarded Vendor',
      capacity: row.capacity,
      source: 'CLIENT_ONBOARDED',
      tenantKey: activeTenantKey,
      tenantName: activeTenantName,
      email: row.email,
      phone: row.phone,
      evaluationStatus: 'PENDING_VENDOR_INPUT',
      ppoRatings: [],
      compositeRating: 4.0,
      totalPPOsCompleted: 0,
    }));

    setManagedVendors((prev) => {
      const updated = [...createdVendors, ...prev];
      persistVendorsToStorage(updated);
      return updated;
    });

    setAuditLogs((prev) => [
      {
        time: timestamp,
        user: `${activeTenantName} Category Head`,
        action: `Bulk onboarded ${createdVendors.length} client vendors via CSV upload.`,
      },
      ...prev,
    ]);

    logger.info('context/vendor-manager', 'Bulk client vendors onboarded', {
      tenantKey: activeTenantKey,
      count: createdVendors.length,
      firstVendor: createdVendors[0]?.name,
    });
  };

  const addSingleClientVendor = (
    vendorData: Omit<
      ManagedVendor,
      'id' | 'source' | 'evaluationStatus' | 'ppoRatings' | 'compositeRating' | 'totalPPOsCompleted'
    >
  ): void => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newVendor: ManagedVendor = {
      ...vendorData,
      id: `CLT-VND-${Date.now()}`,
      source: 'CLIENT_ONBOARDED',
      tenantKey: activeTenantKey,
      tenantName: activeTenantName,
      evaluationStatus: 'PENDING_VENDOR_INPUT',
      ppoRatings: [],
      compositeRating: vendorData.rating || 4.0,
      totalPPOsCompleted: 0,
    };

    setManagedVendors((prev) => {
      const updated = [newVendor, ...prev];
      persistVendorsToStorage(updated);
      return updated;
    });

    setAuditLogs((prev) => [
      {
        time: timestamp,
        user: `${activeTenantName} Procurement Team`,
        action: `Quick onboarded client vendor: ${newVendor.name} (${newVendor.category}).`,
      },
      ...prev,
    ]);

    logger.info('context/vendor-manager', 'Single client vendor onboarded', {
      vendorId: newVendor.id,
      name: newVendor.name,
      category: newVendor.category,
    });
  };

  const submitVendorEvaluation = (
    vendorId: string,
    submission: VendorEvaluationSubmission
  ): VendorEvaluationScoreResult => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const scoreResult = calculateVendorEvaluationScore(submission);

    setManagedVendors((prev) => {
      const updated = prev.map((vendor) => {
        if (vendor.id !== vendorId) return vendor;

        const newComposite = calculateCompositeRating(
          scoreResult.calculatedRating,
          scoreResult,
          vendor.ppoRatings
        );

        return {
          ...vendor,
          evaluationStatus: scoreResult.status,
          evaluationScore: scoreResult,
          rating: scoreResult.calculatedRating,
          compositeRating: newComposite,
        };
      });
      persistVendorsToStorage(updated);
      return updated;
    });

    setAuditLogs((prev) => [
      {
        time: timestamp,
        user: 'Automated Evaluation Engine',
        action: `Evaluated vendor ${vendorId}: Score ${scoreResult.totalScore}/100, Grade ${scoreResult.grade}, Rating ${scoreResult.calculatedRating} ★.`,
      },
      ...prev,
    ]);

    logger.info('context/vendor-manager', 'Vendor evaluation recorded and applied', {
      vendorId,
      totalScore: scoreResult.totalScore,
      grade: scoreResult.grade,
    });

    return scoreResult;
  };

  const submitPPORating = (
    vendorId: string,
    rating: Omit<VendorPPORating, 'id' | 'ratedAt'>
  ): void => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newRatingRecord: VendorPPORating = {
      ...rating,
      id: `PPO-RAT-${Date.now()}`,
      ratedAt: new Date().toISOString().split('T')[0],
    };

    setManagedVendors((prev) => {
      const updated = prev.map((vendor) => {
        if (vendor.id !== vendorId) return vendor;

        const updatedPPORatings = [newRatingRecord, ...vendor.ppoRatings];
        const newComposite = calculateCompositeRating(
          vendor.rating,
          vendor.evaluationScore,
          updatedPPORatings
        );

        return {
          ...vendor,
          ppoRatings: updatedPPORatings,
          totalPPOsCompleted: vendor.totalPPOsCompleted + 1,
          compositeRating: newComposite,
        };
      });
      persistVendorsToStorage(updated);
      return updated;
    });

    setAuditLogs((prev) => [
      {
        time: timestamp,
        user: rating.ratedBy || `${activeTenantName} Site Engineer`,
        action: `Submitted delivery performance rating for PPO ${rating.ppoId} on vendor ${vendorId}: Score ${rating.overallScore}/5.`,
      },
      ...prev,
    ]);

    logger.info('context/vendor-manager', 'PPO performance rating registered', {
      vendorId,
      ppoId: rating.ppoId,
      overallScore: rating.overallScore,
    });
  };

  const sendEvaluationInvite = (vendorId: string, email: string): void => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setManagedVendors((prev) => {
      const updated = prev.map((v) =>
        v.id === vendorId ? { ...v, evaluationStatus: 'PENDING_VENDOR_INPUT' as const, email } : v
      );
      persistVendorsToStorage(updated);
      return updated;
    });

    setAuditLogs((prev) => [
      {
        time: timestamp,
        user: `${activeTenantName} Vendor Management`,
        action: `Dispatched online evaluation questionnaire invitation to ${email} for vendor ${vendorId}.`,
      },
      ...prev,
    ]);

    logger.info('context/vendor-manager', 'Dispatched vendor evaluation invite', { vendorId, email });
  };

  const resetVendors = (): void => {
    setManagedVendors(SEED_MANAGED_VENDORS);
    persistVendorsToStorage(SEED_MANAGED_VENDORS);
  };

  return {
    managedVendors,
    addClientVendors,
    addSingleClientVendor,
    submitVendorEvaluation,
    submitPPORating,
    sendEvaluationInvite,
    resetVendors,
  };
}
