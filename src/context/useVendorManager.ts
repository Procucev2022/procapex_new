import { useState, useEffect } from 'react';
import type {
  ManagedVendor,
  VendorCSVRow,
  VendorEvaluationSubmission,
  VendorEvaluationScoreResult,
  VendorPPORating,
  VendorCatalogueItemPrice,
  VendorCatalogueStatus,
  SendCatalogueIntimationInput,
  AuditLog,
  TenantKey,
} from '@/types';
import { SEED_MANAGED_VENDORS } from '@/constants';
import { calculateVendorEvaluationScore, calculateCompositeRating } from '@/lib/vendor-evaluation';
import { logger } from '@/lib/logger';

import {
  STORAGE_KEY_VENDORS,
  getStoredVendors,
  persistStoredVendors as persistVendorsToStorage,
} from '@/lib/vendor-storage';

export { STORAGE_KEY_VENDORS, getStoredVendors, persistVendorsToStorage };

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
  updateVendorCataloguePrices: (
    vendorId: string,
    prices: Record<string, VendorCatalogueItemPrice>
  ) => void;
  sendVendorCatalogueIntimation: (
    input: SendCatalogueIntimationInput
  ) => void;
  updateVendorCategories: (
    vendorId: string,
    categories: string[]
  ) => void;
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
    const createdVendors: ManagedVendor[] = newVendors.map((row, idx) => {
      const categories = row.categories && row.categories.length > 0
        ? row.categories
        : row.category ? [row.category] : [];
      return {
        id: `CLT-VND-${Date.now()}-${idx + 1}`,
        name: row.name,
        category: row.category,
        categories,
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
      };
    });

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
    const categories = vendorData.categories && vendorData.categories.length > 0
      ? vendorData.categories
      : vendorData.category ? [vendorData.category] : [];
    const newVendor: ManagedVendor = {
      ...vendorData,
      categories,
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

  const updateVendorCataloguePrices = (
    vendorId: string,
    prices: Record<string, VendorCatalogueItemPrice>
  ): void => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setManagedVendors((prev) => {
      const updated = prev.map((vendor) => {
        if (vendor.id !== vendorId) return vendor;
        const mergedPrices = {
          ...(vendor.cataloguePrices || {}),
          ...prices,
        };
        const currentStatus = vendor.catalogueStatus || {
          hasSubmittedPrices: false,
          intimationSent: false,
        };
        const updatedStatus: VendorCatalogueStatus = {
          ...currentStatus,
          hasSubmittedPrices: true,
          lastSubmittedAt: timestamp,
        };
        return {
          ...vendor,
          cataloguePrices: mergedPrices,
          catalogueStatus: updatedStatus,
        };
      });
      persistVendorsToStorage(updated);
      return updated;
    });

    const itemsCount = Object.keys(prices).length;
    setAuditLogs((prev) => [
      {
        time: timestamp,
        user: `${activeTenantName} Vendor Management`,
        action: `Committed standard BOQ catalogue rates for vendor ${vendorId} (${itemsCount} items).`,
      },
      ...prev,
    ]);

    logger.info('context/vendor-manager', 'Vendor catalogue prices updated', {
      vendorId,
      itemsCount,
    });
  };

  const sendVendorCatalogueIntimation = (
    input: SendCatalogueIntimationInput
  ): void => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const deadlineDate = input.customDeadline
      ? input.customDeadline
      : new Date(Date.now() + input.deadlineDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setManagedVendors((prev) => {
      const updated = prev.map((vendor) => {
        if (vendor.id !== input.vendorId) return vendor;
        const existingStatus = vendor.catalogueStatus || {
          hasSubmittedPrices: false,
          intimationSent: false,
        };
        const updatedStatus: VendorCatalogueStatus = {
          ...existingStatus,
          intimationSent: true,
          intimationSentAt: timestamp,
          intimationDeadline: deadlineDate,
          intimationDaysAllowed: input.deadlineDays,
          intimationNotes: input.notes,
        };
        return {
          ...vendor,
          catalogueStatus: updatedStatus,
        };
      });
      persistVendorsToStorage(updated);
      return updated;
    });

    setAuditLogs((prev) => [
      {
        time: timestamp,
        user: `${activeTenantName} Category Head`,
        action: `Dispatched catalogue pricing intimation to vendor ${input.vendorId}. Deadline: ${deadlineDate}.`,
      },
      ...prev,
    ]);

    logger.info('context/vendor-manager', 'Dispatched catalogue pricing intimation', {
      vendorId: input.vendorId,
      deadlineDate,
    });
  };

  const updateVendorCategories = (
    vendorId: string,
    categories: string[]
  ): void => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setManagedVendors((prev) => {
      const updated = prev.map((vendor) => {
        if (vendor.id !== vendorId) return vendor;
        return {
          ...vendor,
          categories,
          category: categories[0] || vendor.category,
        };
      });
      persistVendorsToStorage(updated);
      return updated;
    });

    setAuditLogs((prev) => [
      {
        time: timestamp,
        user: `${activeTenantName} Category Head`,
        action: `Updated category assignments for vendor ${vendorId}: ${categories.join(', ')}.`,
      },
      ...prev,
    ]);

    logger.info('context/vendor-manager', 'Updated vendor categories', {
      vendorId,
      categories,
    });
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
    updateVendorCataloguePrices,
    sendVendorCatalogueIntimation,
    updateVendorCategories,
    resetVendors,
  };
}
