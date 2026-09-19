import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import type {
  RateCardAgreement,
  CreateRateCardProposalInput,
  PRRateCardCoverage,
  AddItemToRateCardInput,
  BOQItem,
  VendorRateCardCategoryCoverage,
  BudgetCategory,
} from '@/types';
import {
  SEED_RATE_CARD_AGREEMENTS,
  HISTORICAL_BEST_RC_RATES,
  HISTORICAL_LAST_PPO_RATES,
  AI_SHOULD_COST_BENCHMARKS,
  INITIAL_PROJECT_CATEGORIES,
} from '@/constants';
import { calculateVendorCategoryRateCardCoverage } from '@/lib/rate-card-utils';

export interface UseRateCardManagerReturn {
  rateCards: RateCardAgreement[];
  createRateCardProposal: (input: CreateRateCardProposalInput) => RateCardAgreement;
  sellerRespondRateCardProposal: (
    id: string,
    action: 'ACCEPT' | 'COUNTER',
    counterRates?: Record<string, number>
  ) => void;
  finalizeRateCard: (id: string) => void;
  addItemToRateCard: (input: AddItemToRateCardInput) => void;
  checkPRRateCardCoverage: (prItems: BOQItem[], vendorId: string) => PRRateCardCoverage;
  getVendorCategoryRateCardCoverage: (
    vendorId: string,
    categoryCodeOrName?: string
  ) => VendorRateCardCategoryCoverage;
  getLinePricingReferences: (itemCode: string) => {
    aiCost: number;
    recentBestRate?: number;
    lastPpoRate?: number;
    aiConfidence?: string;
  };
}

export function useRateCardManager(
  projectCategories: BudgetCategory[] = INITIAL_PROJECT_CATEGORIES
): UseRateCardManagerReturn {
  const [rateCards, setRateCards] = useState<RateCardAgreement[]>(SEED_RATE_CARD_AGREEMENTS);

  const getLinePricingReferences = useCallback((itemCode: string) => {
    const aiData = AI_SHOULD_COST_BENCHMARKS[itemCode];
    const aiCost = aiData ? aiData.rate : 1500;
    const aiConfidence = aiData ? aiData.confidence : '90% Confidence';
    const recentBestRate = HISTORICAL_BEST_RC_RATES[itemCode];
    const lastPpoRate = HISTORICAL_LAST_PPO_RATES[itemCode];

    return {
      aiCost,
      recentBestRate,
      lastPpoRate,
      aiConfidence,
    };
  }, []);

  const createRateCardProposal = useCallback((input: CreateRateCardProposalInput): RateCardAgreement => {
    const newId = `RC-PROP-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString().split('T')[0];

    const newProposal: RateCardAgreement = {
      id: newId,
      vendorId: input.vendorId,
      vendorName: input.vendorName,
      categoryCode: input.categoryCode,
      categoryName: input.categoryName,
      status: 'PROPOSAL_SENT',
      version: 1,
      effectiveDate: nowIso,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: input.paymentTerms || '30 Days Net Credit from GRN',
      leadTimeDays: input.leadTimeDays || 12,
      lastUpdated: nowIso,
      updatedBy: 'Category Manager',
      totalItemsCount: input.items.length,
      averageDiscountPct: 3.5,
      items: input.items.map((it) => ({
        itemCode: it.itemCode,
        desc: it.desc,
        uom: it.uom,
        aiShouldCost: it.aiShouldCost,
        recentBestRate: it.recentBestRate,
        lastPpoRate: it.lastPpoRate,
        proposedRate: it.proposedRate,
        finalAgreedRate: it.proposedRate,
        notes: it.notes,
      })),
    };

    setRateCards((prev) => [newProposal, ...prev]);

    logger.info('context/useRateCardManager', 'Created and dispatched new Rate Card proposal', {
      id: newId,
      vendorId: input.vendorId,
      categoryCode: input.categoryCode,
      itemsCount: input.items.length,
    });

    return newProposal;
  }, []);

  const sellerRespondRateCardProposal = useCallback(
    (id: string, action: 'ACCEPT' | 'COUNTER', counterRates?: Record<string, number>): void => {
      setRateCards((prev) =>
        prev.map((rc) => {
          if (rc.id !== id) return rc;

          const nowIso = new Date().toISOString().split('T')[0];
          if (action === 'ACCEPT') {
            return {
              ...rc,
              status: 'ACCEPTED',
              lastUpdated: nowIso,
              updatedBy: `${rc.vendorName} (Accepted All Rates)`,
            };
          }

          // Counter-offer
          const updatedItems = rc.items.map((it) => {
            const counter = counterRates?.[it.itemCode];
            if (counter !== undefined) {
              return {
                ...it,
                sellerCounterRate: counter,
                finalAgreedRate: counter,
              };
            }
            return it;
          });

          return {
            ...rc,
            status: 'COUNTER_OFFERED',
            items: updatedItems,
            lastUpdated: nowIso,
            updatedBy: `${rc.vendorName} (Counter-Offer Submitted)`,
          };
        })
      );

      logger.info('context/useRateCardManager', 'Seller responded to Rate Card proposal', {
        id,
        action,
        counterRatesCount: counterRates ? Object.keys(counterRates).length : 0,
      });
    },
    []
  );

  const finalizeRateCard = useCallback((id: string): void => {
    const nowIso = new Date().toISOString().split('T')[0];
    setRateCards((prev) =>
      prev.map((rc) => {
        if (rc.id !== id) return rc;
        return {
          ...rc,
          status: 'FINALISED',
          lastUpdated: nowIso,
          updatedBy: 'Category Manager (Finalized & Locked)',
        };
      })
    );

    logger.info('context/useRateCardManager', 'Finalized Rate Card agreement into active directory', { id });
  }, []);

  const addItemToRateCard = useCallback((input: AddItemToRateCardInput): void => {
    setRateCards((prev) => {
      const nowIso = new Date().toISOString().split('T')[0];
      const existing = prev.find(
        (rc) => rc.vendorId === input.vendorId && rc.categoryCode === input.categoryCode
      );

      if (existing) {
        const itemExists = existing.items.some((i) => i.itemCode === input.itemCode);
        const updatedItems = itemExists
          ? existing.items.map((i) =>
              i.itemCode === input.itemCode
                ? { ...i, finalAgreedRate: input.agreedRate, proposedRate: input.agreedRate, notes: input.notes }
                : i
            )
          : [
              ...existing.items,
              {
                itemCode: input.itemCode,
                desc: input.desc,
                uom: input.uom,
                aiShouldCost: input.agreedRate,
                lastPpoRate: input.agreedRate,
                proposedRate: input.agreedRate,
                finalAgreedRate: input.agreedRate,
                notes: input.notes || 'Dynamically appended from PPO release',
              },
            ];

        return prev.map((rc) =>
          rc.id === existing.id
            ? {
                ...rc,
                status: 'FINALISED',
                items: updatedItems,
                totalItemsCount: updatedItems.length,
                lastUpdated: nowIso,
                updatedBy: 'PPO Release Auto-Append',
              }
            : rc
        );
      }

      // Create new agreement if none exists for this vendor + category
      const newAgreement: RateCardAgreement = {
        id: `RC-${Date.now().toString().slice(-6)}`,
        vendorId: input.vendorId,
        vendorName: input.vendorId,
        categoryCode: input.categoryCode,
        categoryName: input.categoryCode,
        status: 'FINALISED',
        version: 1,
        effectiveDate: nowIso,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalItemsCount: 1,
        lastUpdated: nowIso,
        updatedBy: 'PPO Release Auto-Append',
        items: [
          {
            itemCode: input.itemCode,
            desc: input.desc,
            uom: input.uom,
            aiShouldCost: input.agreedRate,
            lastPpoRate: input.agreedRate,
            proposedRate: input.agreedRate,
            finalAgreedRate: input.agreedRate,
            notes: input.notes || 'Created via PPO Release',
          },
        ],
      };

      return [newAgreement, ...prev];
    });

    logger.info('context/useRateCardManager', 'Appended line item to vendor Rate Card', {
      vendorId: input.vendorId,
      itemCode: input.itemCode,
      agreedRate: input.agreedRate,
    });
  }, []);

  const checkPRRateCardCoverage = useCallback(
    (prItems: BOQItem[], vendorId: string): PRRateCardCoverage => {
      const activeAgreements = rateCards.filter(
        (rc) => rc.vendorId === vendorId && rc.status === 'FINALISED'
      );

      const allAgreedItemsMap = new Map<string, number>();
      activeAgreements.forEach((rc) => {
        rc.items.forEach((it) => {
          allAgreedItemsMap.set(it.itemCode, it.finalAgreedRate);
        });
      });

      const coveredItems: PRRateCardCoverage['coveredItems'] = [];
      const deltaItems: BOQItem[] = [];

      prItems.forEach((prItem) => {
        const rate = allAgreedItemsMap.get(prItem.code);
        if (rate !== undefined) {
          coveredItems.push({
            prItemCode: prItem.code,
            desc: prItem.desc,
            qty: prItem.qty,
            rateCardRate: rate,
            totalVal: prItem.qty * rate,
          });
        } else {
          deltaItems.push(prItem);
        }
      });

      const totalCount = prItems.length;
      const coveredCount = coveredItems.length;
      const isFullyCovered = totalCount > 0 && coveredCount === totalCount;
      const coveragePct = totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0;
      const vendorName = activeAgreements[0]?.vendorName || vendorId;

      return {
        vendorId,
        vendorName,
        isFullyCovered,
        coveragePct,
        totalPrItemsCount: totalCount,
        coveredItemsCount: coveredCount,
        deltaItemsCount: deltaItems.length,
        coveredItems,
        deltaItems,
      };
    },
    [rateCards]
  );

  const getVendorCategoryRateCardCoverage = useCallback(
    (vendorId: string, categoryCodeOrName?: string): VendorRateCardCategoryCoverage => {
      return calculateVendorCategoryRateCardCoverage(
        vendorId,
        categoryCodeOrName,
        projectCategories,
        rateCards
      );
    },
    [rateCards, projectCategories]
  );

  return {
    rateCards,
    createRateCardProposal,
    sellerRespondRateCardProposal,
    finalizeRateCard,
    addItemToRateCard,
    checkPRRateCardCoverage,
    getVendorCategoryRateCardCoverage,
    getLinePricingReferences,
  };
}
