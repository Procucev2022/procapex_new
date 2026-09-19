'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Send, 
  CreditCard, 
  Scale, 
  Sparkles, 
  MessageSquareDiff, 
  FileCheck2, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  ChevronDown, 
  Check, 
  Truck, 
  ShieldCheck,
  Clock,
  Calendar,
  MapPin,
  Paperclip,
  X,
  Zap,
  Search,
  Plus,
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { BuyerEAuctionPage } from './eauction';
import { logger } from '@/lib/logger';
import type {
  NonL1Justification,
  BOQItemWithMLEO,
  PRData,
  CategoryManagerHubProps,
  VendorCommercialTerms,
  PurchaseRequest,
  VendorQuoteDetail,
  PRRateCardCoverage,
  BOQItem,
} from '@/types';
import { INITIAL_PRS_DATA, MASTER_VENDORS, SEED_MANAGED_VENDORS, UI_STRINGS } from '@/constants';
import { RFQCirculationHistoryTable } from './category-manager/RFQCirculationHistoryTable';

function getVendorCommercialTerms(vendorId: string, _prId?: string): VendorCommercialTerms {
  const TERMS_MAP: Record<string, VendorCommercialTerms> = {
    'VND-001': {
      paymentTerms: '10% Adv | 70% Progress RA | 10% Handover | 10% DLP (30D Credit)',
      advancePct: '10%',
      retentionPct: '10%',
      creditDays: '30 Days',
      paymentBadge: '✓ Matches Target Baseline',
      paymentBadgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      leadTime: '12 - 15 Calendar Days',
      deliveryDate: '2026-09-25 (Strict Handover)',
      deliveryBadge: '✓ Meets Target Date',
      deliveryBadgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      complianceStatus: 'COMPLIANT',
      complianceBadge: '✓ 100% Commercial Compliant',
      complianceClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      complianceNote: 'Fully compliant with Package Payment & Delivery Terms',
    },
    'VND-002': {
      paymentTerms: '15% Adv | 75% Progress RA | 10% DLP (30D Credit)',
      advancePct: '15%',
      retentionPct: '10%',
      creditDays: '30 Days',
      paymentBadge: '⚠ Advance Variance (+5% Adv)',
      paymentBadgeClass: 'bg-amber-100 text-amber-900 border border-amber-300',
      leadTime: '10 - 12 Calendar Days (Fast Track)',
      deliveryDate: '2026-09-22 (3 Days Early)',
      deliveryBadge: '⚡ Faster Delivery (-3 Days)',
      deliveryBadgeClass: 'bg-sky-100 text-sky-900 border border-sky-300',
      complianceStatus: 'VARIANCE_ADVANCE',
      complianceBadge: '⚠ Commercial Variance (Advance)',
      complianceClass: 'bg-amber-100 text-amber-900 border-amber-300',
      complianceNote: 'Requires 15% Advance (Target Baseline: 10%), offers 3-day faster delivery',
    },
    'VND-005': {
      paymentTerms: '30 Days Net Credit from GRN (0% Adv, 5% Retention)',
      advancePct: '0%',
      retentionPct: '5%',
      creditDays: '30 Days Net',
      paymentBadge: '✓ Favorable Terms (0% Adv)',
      paymentBadgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      leadTime: '18 - 22 Calendar Days',
      deliveryDate: '2026-09-30 (+5 Days Delay)',
      deliveryBadge: '⚠ Delivery Variance (+5 Days)',
      deliveryBadgeClass: 'bg-rose-100 text-rose-900 border border-rose-300',
      complianceStatus: 'VARIANCE_DELIVERY',
      complianceBadge: '⚠ Delivery Variance (+5D)',
      complianceClass: 'bg-rose-100 text-rose-900 border border-rose-300',
      complianceNote: 'Beneficial 0% advance terms, but lead time exceeds target by 5 days',
    },
    'VND-014': {
      paymentTerms: '10% Adv | 80% Supply & Erection | 10% Retention (30D Credit)',
      advancePct: '10%',
      retentionPct: '10%',
      creditDays: '30 Days',
      paymentBadge: '✓ Master Rate Card Terms',
      paymentBadgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      leadTime: '14 - 16 Calendar Days',
      deliveryDate: '2026-10-12 (Within Target)',
      deliveryBadge: '✓ Meets Target Schedule',
      deliveryBadgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      complianceStatus: 'COMPLIANT',
      complianceBadge: '✓ 100% Rate Card Standard',
      complianceClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      complianceNote: 'Contractually bound to corporate master rate card terms',
    },
    'VND-015': {
      paymentTerms: '30 Days Net Credit from Site Delivery & Joint Inspection',
      advancePct: '0%',
      retentionPct: '5%',
      creditDays: '30 Days',
      paymentBadge: '✓ Standard 30D Credit',
      paymentBadgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      leadTime: '12 - 14 Calendar Days',
      deliveryDate: '2026-10-10 (Fast Track)',
      deliveryBadge: '⚡ Faster Delivery (-2 Days)',
      deliveryBadgeClass: 'bg-sky-100 text-sky-900 border border-sky-300',
      complianceStatus: 'COMPLIANT',
      complianceBadge: '✓ Compliant Standard Terms',
      complianceClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      complianceNote: 'Standard credit terms, 2 days faster factory dispatch',
    },
    'CLT-VND-003': {
      paymentTerms: '10% Adv | 80% Progress RA | 10% Handover (30D Credit)',
      advancePct: '10%',
      retentionPct: '10%',
      creditDays: '30 Days',
      paymentBadge: '✓ Matches Client Empanelled Baseline',
      paymentBadgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      leadTime: '7 - 10 Calendar Days',
      deliveryDate: '2026-09-24 (Within Schedule)',
      deliveryBadge: '✓ Meets Target Date',
      deliveryBadgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      complianceStatus: 'COMPLIANT',
      complianceBadge: '✓ 100% Empanelled Compliant',
      complianceClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      complianceNote: 'Empanelled client partner terms with verified workshop inspection',
    },
  };

  return TERMS_MAP[vendorId] ?? {
    paymentTerms: '30 Days Net Credit from GRN / Milestone Certification',
    advancePct: '0%',
    retentionPct: '5%',
    creditDays: '30 Days',
    paymentBadge: 'Standard Terms',
    paymentBadgeClass: 'bg-slate-100 text-slate-800 border border-slate-300',
    leadTime: '14 - 18 Calendar Days',
    deliveryDate: 'As per PO Target',
    deliveryBadge: 'Standard SLA',
    deliveryBadgeClass: 'bg-slate-100 text-slate-800 border border-slate-300',
    complianceStatus: 'COMPLIANT',
    complianceBadge: '✓ Standard Empanelled Terms',
    complianceClass: 'bg-slate-100 text-slate-800 border-slate-300',
    complianceNote: 'Standard vendor empanelment commercial conditions',
  };
}

export interface MasterVendorDisplayItem {
  id: string;
  name: string;
  category: string;
  categories?: string[];
  rating: number;
  isRateCard: boolean;
  city: string;
  leadTime: string;
  source?: string;
}

export function matchVendorToPRCategory(
  vendorCategory: string,
  prCategoryMajor: string,
  prCategory?: string,
  vendorCategories?: string[]
): boolean {
  if (!vendorCategory && (!vendorCategories || vendorCategories.length === 0)) return true;
  const catsToCheck = [
    vendorCategory,
    ...(vendorCategories || []),
  ].filter(Boolean).map((c) => c.toUpperCase().trim());

  const major = (prCategoryMajor || '').toUpperCase().trim();
  const full = (prCategory || '').toUpperCase().trim();

  if (!major && !full) return true;

  for (const vCat of catsToCheck) {
    if (major && (vCat.includes(major) || major.includes(vCat))) return true;
    if (full && (vCat.includes(full) || full.includes(vCat))) return true;
    if ((major.includes('INTERIOR') || full.includes('INTERIOR')) && (vCat.includes('INTERIOR') || vCat.includes('FITOUT') || vCat.includes('MILLWORK') || vCat.includes('CARPENTRY') || vCat.includes('FURNITURE'))) return true;
    if ((major.includes('CIVIL') || full.includes('CIVIL')) && (vCat.includes('CIVIL') || vCat.includes('STRUCTURAL') || vCat.includes('CONCRETE') || vCat.includes('MASONRY'))) return true;
    if ((major.includes('MEP') || full.includes('MEP')) && (vCat.includes('MEP') || vCat.includes('ELECTRICAL') || vCat.includes('MECHANICAL') || vCat.includes('PLUMBING') || vCat.includes('HVAC'))) return true;
    if ((major.includes('STEEL') || full.includes('STEEL')) && (vCat.includes('STEEL') || vCat.includes('CIVIL') || vCat.includes('FABRICATION'))) return true;
  }
  return false;
}

export function getMasterVendor(
  vid: string,
  extraVendors?: MasterVendorDisplayItem[]
): MasterVendorDisplayItem {
  if (extraVendors && extraVendors.length > 0) {
    const foundExtra = extraVendors.find((v) => v.id === vid);
    if (foundExtra) return foundExtra;
  }
  const seedFound = SEED_MANAGED_VENDORS.find((v) => v.id === vid);
  if (seedFound) {
    return {
      id: seedFound.id,
      name: seedFound.name,
      category: seedFound.category,
      rating: seedFound.rating,
      isRateCard: seedFound.isRateCard,
      city: seedFound.city,
      leadTime: seedFound.leadTime,
      source: seedFound.source,
    };
  }
  const masterFound = MASTER_VENDORS.find((v) => v.id === vid);
  if (masterFound) {
    return {
      ...masterFound,
      source: 'PROCAPX_PLATFORM',
    };
  }
  return {
    ...MASTER_VENDORS[0],
    source: 'PROCAPX_PLATFORM',
  };
}

export function getItemRateCard(it: BOQItemWithMLEO, vendorId: string): number {
  return it.vendorRateCards?.[vendorId] ?? Math.round(it.benchmark * 1.05);
}

export function getItemVendorQuote(
  it: BOQItemWithMLEO,
  vendorId: string
): { initialRate: number; revisedRate?: number | null } {
  return it.vendorQuotes?.[vendorId] ?? {
    initialRate: Math.round(it.benchmark * 1.15),
    revisedRate: null,
  };
}

export function syncPRsToPRData(
  contextPRs: PurchaseRequest[],
  basePRsData: Record<string, PRData>
): Record<string, PRData> {
  const merged: Record<string, PRData> = { ...basePRsData };

  contextPRs.forEach(pr => {
    const existing = merged[pr.id];
    if (existing) {
      const updatedItems = pr.items && pr.items.length > 0
        ? pr.items.map((it, idx) => {
            const exItem = existing.items.find(ei => ei.code === it.code) ?? existing.items[idx];
            const bench = it.benchmark || it.rateCard || exItem?.benchmark || 1450;
            return {
              code: it.code || exItem?.code || `ITEM-${idx + 1}`,
              desc: it.desc || exItem?.desc || 'Scope Item',
              uom: it.uom || exItem?.uom || 'Nos',
              qty: it.qty || exItem?.qty || 1,
              rateCard: it.rateCard || exItem?.rateCard || bench,
              benchmark: bench,
              bestHistoricalPrice: exItem?.bestHistoricalPrice || bench,
              prevPo: exItem?.prevPo || 'PO-2025-0819 (Metro Underground)',
              mleo: exItem?.mleo || {
                m: Math.round(bench * 0.55),
                l: Math.round(bench * 0.20),
                e: Math.round(bench * 0.12),
                o: Math.round(bench * 0.13),
                conf: it.aiConf || '96%',
              },
              vendorRateCards: exItem?.vendorRateCards,
              vendorQuotes: (() => {
                const combined: Record<string, VendorQuoteDetail> = {};
                const allKeys = Array.from(new Set([
                  ...Object.keys(exItem?.vendorQuotes || {}),
                  ...Object.keys(it.vendorQuotes || {}),
                ]));
                allKeys.forEach((vKey) => {
                  const ex = exItem?.vendorQuotes?.[vKey];
                  const cur = it.vendorQuotes?.[vKey];
                  combined[vKey] = {
                    initialRate: cur?.initialRate ?? ex?.initialRate ?? Math.round(bench * 1.10),
                    revisedRate: cur?.revisedRate !== undefined ? cur?.revisedRate : (ex?.revisedRate ?? null),
                    finalRate: cur?.finalRate !== undefined ? cur?.finalRate : (ex?.finalRate ?? null),
                    buyerOffer1: cur?.buyerOffer1 !== undefined ? cur?.buyerOffer1 : (ex?.buyerOffer1 ?? null),
                    buyerOffer2: cur?.buyerOffer2 !== undefined ? cur?.buyerOffer2 : (ex?.buyerOffer2 ?? null),
                  };
                });
                return Object.keys(combined).length > 0
                  ? combined
                  : {
                      'VND-001': { initialRate: Math.round(bench * 1.10), revisedRate: null },
                      'VND-002': { initialRate: Math.round(bench * 1.15), revisedRate: null },
                      'VND-005': { initialRate: Math.round(bench * 1.12), revisedRate: null },
                    };
              })(),
            };
          })
        : existing.items;

      const estBaseline = updatedItems.reduce(
        (acc, it) => acc + ((it.rateCard || it.benchmark || 1500) * it.qty),
        0
      );

      merged[pr.id] = {
        ...existing,
        title: pr.title || existing.title,
        project: pr.projectName || existing.project,
        costCenter: pr.costCentre || existing.costCenter,
        category: pr.category || existing.category,
        items: updatedItems,
        estBaseline: estBaseline > 0 ? estBaseline : existing.estBaseline,
        nominatedVendors: pr.nominatedVendors && pr.nominatedVendors.length > 0
          ? pr.nominatedVendors
          : [],
        site: pr.deliveryAddress || existing.site,
      };
    } else {
      const categoryMajor = pr.category?.toUpperCase().includes('STEEL')
        ? 'STEEL'
        : pr.category?.toUpperCase().includes('CONCRETE') || pr.category?.toUpperCase().includes('CIVIL')
        ? 'CIVIL'
        : 'INTERIOR';

      const isSeedDemoPR = pr.id === 'PR-2026-0005';

      const enrichedItems: BOQItemWithMLEO[] = (pr.items || []).map((it, idx) => {
        const bench = it.benchmark || it.rateCard || 1450;
        const itemQuotes: Record<string, VendorQuoteDetail> = isSeedDemoPR
          ? {
              'VND-001': { initialRate: Math.round(bench * 1.10), revisedRate: null },
              'VND-002': { initialRate: Math.round(bench * 1.15), revisedRate: null },
              'VND-005': { initialRate: Math.round(bench * 1.12), revisedRate: null },
            }
          : {};
        return {
          code: it.code || `ITEM-${idx + 1}`,
          desc: it.desc || 'Requisition Scope Item',
          uom: it.uom || 'Nos',
          qty: it.qty || 1,
          rateCard: it.rateCard || bench,
          benchmark: bench,
          bestHistoricalPrice: bench,
          prevPo: 'PO-2025-0819 (Metro Underground)',
          mleo: {
            m: Math.round(bench * 0.55),
            l: Math.round(bench * 0.20),
            e: Math.round(bench * 0.12),
            o: Math.round(bench * 0.13),
            conf: it.aiConf || '96%',
          },
          vendorQuotes: itemQuotes,
        };
      });

      const estBaseline = enrichedItems.reduce(
        (acc, it) => acc + ((it.rateCard || it.benchmark || 1500) * it.qty),
        0
      );

      merged[pr.id] = {
        id: pr.id,
        title: pr.title,
        project: pr.projectName || 'Metro Line 4 Underground',
        costCenter: pr.costCentre || 'CC-104 (Finishing)',
        category: pr.category || 'Interior & Fitouts',
        categoryMajor,
        method: 'METHOD_3',
        methodName: 'Method 3: Drawing / PDF AI Scope Extraction',
        methodBadgeClass: 'bg-purple-100 text-purple-900 border border-purple-300',
        sourceFile: 'Technical Scope & Drawing Sheet.pdf',
        raiser: pr.requester || 'Rahul Verma (Site Lead)',
        estBaseline: estBaseline > 0 ? estBaseline : 148500,
        targetDate: pr.reqDate || '2026-09-28',
        site: pr.deliveryAddress || 'Metro Line 4 Underground Site / Depot',
        contact: 'Rahul Verma (+91 98201 44520)',
        docCount: isSeedDemoPR ? 4 : 0,
        nominatedVendors: pr.nominatedVendors && pr.nominatedVendors.length > 0
          ? pr.nominatedVendors
          : [],
        items: enrichedItems,
      };
    }
  });

  return merged;
}

export const CategoryManagerHub: React.FC<CategoryManagerHubProps> = ({
  initialPRId,
  onRouteToPPO,
  onRouteToNegotiation: _onRouteToNegotiation,
}) => {
  const {
    prs,
    createPR,
    createPPO,
    managedVendors,
    circulateRFQ,
    circulatedRFQs,
    submitBuyerCounterOffer,
    checkPRRateCardCoverage,
    getVendorCategoryRateCardCoverage,
    addItemToRateCard,
    rateCards,
  } = useProcurement();
  const [prsData, setPrsData] = useState<Record<string, PRData>>(() =>
    syncPRsToPRData(prs || [], INITIAL_PRS_DATA)
  );

  // Unified vendor roster combining managedVendors and MASTER_VENDORS
  const allAvailableVendors: MasterVendorDisplayItem[] = useMemo(() => {
    const list: MasterVendorDisplayItem[] = [];
    const seenIds = new Set<string>();

    (managedVendors || []).forEach((mv) => {
      seenIds.add(mv.id);
      const hasFinalizedRC = (rateCards || []).some(
        (rc) => rc.vendorId === mv.id && rc.status === 'FINALISED'
      );
      list.push({
        id: mv.id,
        name: mv.name,
        category: mv.category,
        categories: mv.categories && mv.categories.length > 0 ? mv.categories : [mv.category],
        rating: mv.rating,
        isRateCard: mv.isRateCard || hasFinalizedRC,
        city: mv.city,
        leadTime: mv.leadTime,
        source: mv.source,
      });
    });

    MASTER_VENDORS.forEach((master) => {
      if (!seenIds.has(master.id)) {
        seenIds.add(master.id);
        const hasFinalizedRC = (rateCards || []).some(
          (rc) => rc.vendorId === master.id && rc.status === 'FINALISED'
        );
        list.push({
          ...master,
          categories: [master.category],
          isRateCard: master.isRateCard || hasFinalizedRC,
          source: 'PROCAPX_PLATFORM',
        });
      }
    });

    return list;
  }, [managedVendors, rateCards]);
  const [activePRId, setActivePRId] = useState<string>(initialPRId ?? 'PR-2026-0005');
  const [activeTab, setActiveTab] = useState<'rfq' | 'commercial' | 'aicost' | 'negotiation' | 'ppogen'>('rfq');
  const [showEAuctionPage, setShowEAuctionPage] = useState<boolean>(false);
  const [rfqSubTab, setRfqSubTab] = useState<'general' | 'suppliers' | 'delivery' | 'terms' | 'documents'>('general');
  const [showRfqSuccessModal, setShowRfqSuccessModal] = useState<boolean>(false);
  const [rfqClosureDate, setRfqClosureDate] = useState<string>('2026-09-30');
  
  // 5 Sub-Tabs Form States
  const [rfqDescription, setRfqDescription] = useState<string>(
    'Fabrication & Installation of Reception Counter (Drawing: Counter Elevation D)'
  );
  const [rfqCostCentre, setRfqCostCentre] = useState<string>('CC-104 (Finishing, Interior & Millwork)');
  const [rfqSquareFeet, setRfqSquareFeet] = useState<string>('4,500 sq.ft');
  const [rfqPriority, setRfqPriority] = useState<string>('High Priority');
  const [rfqExpectedDate, setRfqExpectedDate] = useState<string>('2026-09-25');
  const [rfqDeliveryAddress, setRfqDeliveryAddress] = useState<string>(
    'Metro Line 4 Underground Site / Depot, Pier Zone B'
  );
  const [rfqSiteContact, setRfqSiteContact] = useState<string>('Rahul Verma (+91 98201 44520)');
  const [rfqStagingPlan, setRfqStagingPlan] = useState<string>(
    'Depot Storage Yard B • Staging Crane Access Included'
  );
  const [rfqPaymentTerms, setRfqPaymentTerms] = useState<string>(
    '10% Adv | 70% Progress RA | 10% Handover | 10% DLP (30 Days Credit)'
  );
  const [rfqLeadTime, setRfqLeadTime] = useState<string>('12 - 15 Calendar Days');
  const [rfqWarranty, setRfqWarranty] = useState<string>('12 Months Defect Liability Period (DLP)');
  const [rfqLiquidatedDamages, setRfqLiquidatedDamages] = useState<string>(
    '0.5% per week delay capped at 5% of PO Value'
  );
  const [rfqDocuments, setRfqDocuments] = useState<Array<{ name: string; size: string; type: string }>>([
    { name: 'Counter_Elevation_D_Approved_Drawing.pdf', size: '2.4 MB', type: 'Architectural Drawing (.pdf)' },
    { name: 'Technical_Scope_Specification_Sheet.pdf', size: '1.5 MB', type: 'Technical Spec (.pdf)' },
    { name: 'Itemized_BOQ_Scope_Schedule.pdf', size: '980 KB', type: 'BOQ Schedule (.pdf)' },
  ]);

  const [rfqSubmittedMap, setRfqSubmittedMap] = useState<
    Record<string, { isSubmitted: boolean; submittedAt: string }>
  >({
    'PR-2026-0005': { isSubmitted: false, submittedAt: '' },
  });

  const currentRfqId = `RFQ-2026-${activePRId.split('-')[2] || '0005'}`;
  const isCurrentRFQSubmitted = Boolean(
    rfqSubmittedMap[activePRId]?.isSubmitted ||
    circulatedRFQs?.[activePRId] ||
    circulatedRFQs?.[currentRfqId]
  );

  const handlePublishRFQ = (): void => {
    setRfqSubmittedMap(prev => ({
      ...prev,
      [activePRId]: {
        isSubmitted: true,
        submittedAt: new Date().toLocaleTimeString(),
      },
    }));
    if (circulateRFQ) {
      circulateRFQ(activePRId, rfqVendors, rfqClosureDate);
    }
    setShowRfqSuccessModal(true);
    logger.info('components/CategoryManagerHub', 'RFQ Tender Submitted to Nominated Vendors', {
      prId: activePRId,
      rfqId: `RFQ-2026-${activePRId.split('-')[2] || '0005'}`,
      closureDate: rfqClosureDate,
      vendorCount: rfqVendors.length,
      vendors: rfqVendors,
    });
  };

  useEffect(() => {
    if (prs && prs.length > 0) {
      setPrsData(prev => syncPRsToPRData(prs, prev));
    }
  }, [prs]);

  useEffect(() => {
    if (initialPRId) {
      setActivePRId(initialPRId);
      setRfqVendors([]);
    }
  }, [initialPRId]);

  const currentPR = prsData[activePRId] ?? Object.values(prsData)[0] ?? INITIAL_PRS_DATA['PR-2026-0005'];
  const [rfqVendors, setRfqVendors] = useState<string[]>([]);

  useEffect(() => {
    if (currentPR) {
      const isSubmitted = Boolean(
        rfqSubmittedMap[currentPR.id]?.isSubmitted ||
        circulatedRFQs?.[currentPR.id] ||
        circulatedRFQs?.[`RFQ-2026-${currentPR.id.split('-')[2] || '0005'}`]
      );
      setRfqVendors([]);
      const benchTot = (currentPR.items || []).reduce((acc, it) => acc + (it.qty * it.benchmark), 0);
      setCounterOfferInput(benchTot > 0 ? Math.round(benchTot * 1.04) : 0);
      setRfqDescription(currentPR.title || '');
      setRfqCostCentre(currentPR.costCenter || 'CC-104 (Finishing, Interior & Millwork)');
      setRfqExpectedDate(currentPR.targetDate || '2026-09-30');
      setRfqDeliveryAddress(currentPR.site || '');
      setRfqSiteContact(currentPR.contact || '');
      if (currentPR.id === 'PR-2026-0005') {
        setRfqSquareFeet('4,500 sq.ft');
        setRfqPriority('High Priority');
        setRfqStagingPlan('Depot Storage Yard B • Staging Crane Access Included');
        setRfqPaymentTerms('10% Adv | 70% Progress RA | 10% Handover | 10% DLP (30 Days Credit)');
        setRfqLeadTime('12 - 15 Calendar Days');
        setRfqWarranty('12 Months Defect Liability Period (DLP)');
        setRfqLiquidatedDamages('0.5% per week delay capped at 5% of PO Value');
        setRfqDocuments([
          { name: 'Counter_Elevation_D_Approved_Drawing.pdf', size: '2.4 MB', type: 'Architectural Drawing (.pdf)' },
          { name: 'Technical_Scope_Specification_Sheet.pdf', size: '1.5 MB', type: 'Technical Spec (.pdf)' },
          { name: 'Itemized_BOQ_Scope_Schedule.pdf', size: '980 KB', type: 'BOQ Schedule (.pdf)' },
        ]);
      } else {
        setRfqSquareFeet('');
        setRfqPriority('Normal');
        setRfqStagingPlan('');
        setRfqPaymentTerms('10% Adv | 70% Progress RA | 10% Handover | 10% DLP (30 Days Credit)');
        setRfqLeadTime('14 Calendar Days');
        setRfqWarranty('12 Months Defect Liability Period (DLP)');
        setRfqLiquidatedDamages('0.5% per week delay capped at 5% of PO Value');
        setRfqDocuments([]);
        setRfqSubTab('general');
      }
    }
  }, [activePRId, currentPR]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // MLEO Breakdown Modal State
  const [selectedMLEOItem, setSelectedMLEOItem] = useState<BOQItemWithMLEO | null>(null);
  const [isMLEOModalOpen, setIsMLEOModalOpen] = useState<boolean>(false);

  // Non-L1 Justification Modal State
  const [isNonL1ModalOpen, setIsNonL1ModalOpen] = useState<boolean>(false);
  const [pendingAwardVendorId, setPendingAwardVendorId] = useState<string | null>(null);
  const [nonL1ReasonCategory, setNonL1ReasonCategory] = useState<string>('Lead Time / Immediate Delivery Urgency (Site Critical Path)');
  const [nonL1JustificationText, setNonL1JustificationText] = useState<string>('');

  // Awarded PPO state
  const [awardedPPO, setAwardedPPO] = useState<{
    ppoNumber: string;
    vendorId: string;
    vendorName: string;
    isNonL1: boolean;
    justification?: NonL1Justification;
    netTotal: number;
    gst: number;
    grandTotal: number;
  } | null>(null);

  // Negotiation state
  const [lineCounterRates, setLineCounterRates] = useState<Record<string, number>>({});
  const [selectedOfferVendorId, setSelectedOfferVendorId] = useState<string>('ALL');
  const [counterOfferInput, setCounterOfferInput] = useState<number>(148500);
  const [negRound, setNegRound] = useState<number>(1);
  const [negSavings, setNegSavings] = useState<{ amount: number; pct: string }>({ amount: 0, pct: '0.0' });
  const [isBafoLocked, setIsBafoLocked] = useState<boolean>(false);
  const [hasReceived2ndQuote, setHasReceived2ndQuote] = useState<boolean>(false);
  const [rowOfferVendors, setRowOfferVendors] = useState<Record<number, string>>({});

  // Rate Card Vendor Fast-Track & Delta States
  const [vendorFilterType, setVendorFilterType] = useState<'ALL' | 'RATE_CARD' | 'NON_RATE_CARD' | 'CLIENT_ONBOARDED'>('ALL');
  const [vendorSearchQuery, setVendorSearchQuery] = useState<string>('');
  const [showAllVendorCategories, setShowAllVendorCategories] = useState<boolean>(true);
  const [isDeltaModalOpen, setIsDeltaModalOpen] = useState<boolean>(false);
  const [selectedDeltaVendorId, setSelectedDeltaVendorId] = useState<string | null>(null);
  const [deltaPrices, setDeltaPrices] = useState<Record<string, number>>({});
  const [addDeltaToRC, setAddDeltaToRC] = useState<boolean>(true);

  const clientOnboardedVendorsCount = useMemo(
    () => allAvailableVendors.filter((v) => v.source === 'CLIENT_ONBOARDED').length,
    [allAvailableVendors]
  );

  const handleCreateBlankRFQ = (): void => {
    const existingPrs = prs || [];
    const maxNum = existingPrs.reduce((max, p) => {
      const match = p.id.match(/PR-\d{4}-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 5);
    const nextPrId = `PR-2026-${String(maxNum + 1).padStart(4, '0')}`;
    const newBlankPR: PurchaseRequest = {
      id: nextPrId,
      title: 'New Blank RFQ Package',
      status: 'SUBMITTED',
      projectName: 'Metro Line 4 Underground',
      costCentre: 'CC-104 (Finishing & Interior)',
      category: 'Interior & Fitouts',
      requester: 'Rahul Verma (Category Manager)',
      reqDate: '2026-09-30',
      remarks: 'Blank RFQ Package Draft',
      nominatedVendors: [],
      deliveryAddress: '',
      items: [],
    };
    if (createPR) {
      createPR(newBlankPR);
    }
    setActivePRId(nextPrId);
    setActiveTab('rfq');
    setRfqSubTab('general');
    setRfqVendors([]);
    logger.info('components/CategoryManagerHub', 'Created new blank RFQ package', { prId: nextPrId });
  };

  const checkCoverage = useCallback((items: BOQItem[], vid: string): PRRateCardCoverage => {
    if (typeof checkPRRateCardCoverage === 'function') {
      return checkPRRateCardCoverage(items, vid);
    }
    return {
      vendorId: vid,
      vendorName: '',
      isFullyCovered: false,
      coveragePct: 0,
      totalPrItemsCount: items ? items.length : 0,
      coveredItemsCount: 0,
      deltaItemsCount: items ? items.length : 0,
      coveredItems: [],
      deltaItems: items || [],
    };
  }, [checkPRRateCardCoverage]);

  const handleFastTrackPPO = (vendorId: string, vendorName: string, coverage: PRRateCardCoverage): void => {
    const rcTotal = coverage.coveredItems.reduce((acc, it) => acc + it.totalVal, 0);
    const gst = Math.round(rcTotal * 0.18);
    if (createPPO) {
      createPPO({
        prId: currentPR.id,
        vendor: vendorName,
        itemDesc: `${currentPR.title} (Fast-Track Rate Card Execution - ${vendorId})`,
        unitRate: rcTotal,
        qty: 1,
        totalVal: rcTotal,
        taxRate: 18,
        taxAmount: gst,
        grandTotal: rcTotal + gst,
        paymentTerms: '30 Days Net from RA Bill Certification',
        leadTime: '12-14 Calendar Days',
      });
    }
    logger.info('components/CategoryManagerHub', 'Fast-Track PPO Created from Rate Card', {
      vendorId,
      prId: currentPR.id,
      total: rcTotal + gst,
    });
    if (onRouteToPPO) {
      onRouteToPPO();
    }
  };

  const handleOpenDeltaModal = (vendorId: string, coverage: PRRateCardCoverage): void => {
    setSelectedDeltaVendorId(vendorId);
    const initialPrices: Record<string, number> = {};
    coverage.deltaItems.forEach((it) => {
      initialPrices[it.code] = it.benchmark || 1500;
    });
    setDeltaPrices(initialPrices);
    setIsDeltaModalOpen(true);
  };

  const handleSubmitDeltaPPO = (): void => {
    if (!selectedDeltaVendorId) return;
    const vendor = getMasterVendor(selectedDeltaVendorId, allAvailableVendors);
    const coverage = checkCoverage(currentPR.items, selectedDeltaVendorId);
    const coveredTotal = coverage.coveredItems.reduce((acc, it) => acc + it.totalVal, 0);
    const deltaTotal = coverage.deltaItems.reduce(
      (acc, it) => acc + it.qty * (deltaPrices[it.code] ?? it.benchmark ?? 1500),
      0
    );
    const netTotal = coveredTotal + deltaTotal;
    const gst = Math.round(netTotal * 0.18);

    if (createPPO) {
      createPPO({
        prId: currentPR.id,
        vendor: vendor.name,
        itemDesc: `${currentPR.title} (Rate Card + ${coverage.deltaItemsCount} Approved Delta Items)`,
        unitRate: netTotal,
        qty: 1,
        totalVal: netTotal,
        taxRate: 18,
        taxAmount: gst,
        grandTotal: netTotal + gst,
        paymentTerms: '30 Days Net from RA Bill Certification',
        leadTime: '14 Calendar Days',
      });
    }

    // Add delta items to Rate Card if opted in
    if (addDeltaToRC && addItemToRateCard) {
      coverage.deltaItems.forEach((it) => {
        addItemToRateCard({
          vendorId: selectedDeltaVendorId,
          categoryCode: currentPR.categoryMajor ?? 'INTERIOR',
          itemCode: it.code,
          desc: it.desc,
          uom: it.uom,
          agreedRate: deltaPrices[it.code] ?? it.benchmark ?? 1500,
          notes: `Added from PPO Delta Approval on ${new Date().toISOString().split('T')[0]}`,
        });
      });
    }

    setIsDeltaModalOpen(false);
    if (onRouteToPPO) {
      onRouteToPPO();
    }
  };

  const openMLEOModal = (item: BOQItemWithMLEO): void => {
    setSelectedMLEOItem(item);
    setIsMLEOModalOpen(true);
  };

  const closeMLEOModal = (): void => {
    setSelectedMLEOItem(null);
    setIsMLEOModalOpen(false);
  };

  const applyLineShouldCostToNegotiation = (): void => {
    const benchTot = currentPR.items.reduce((acc, it) => acc + (it.qty * it.benchmark), 0);
    setCounterOfferInput(Math.round(benchTot * 1.04));
    closeMLEOModal();
  };

  const selectPR = (prId: string): void => {
    setActivePRId(prId);
    const pr = prsData[prId];
    if (pr) {
      const isSubmitted = Boolean(
        rfqSubmittedMap[prId]?.isSubmitted ||
        circulatedRFQs?.[prId] ||
        circulatedRFQs?.[`RFQ-2026-${prId.split('-')[2] || '0005'}`]
      );
      setRfqVendors([]);
      const benchTot = pr.items.reduce((acc, it) => acc + (it.qty * it.benchmark), 0);
      setCounterOfferInput(Math.round(benchTot * 1.04));
      setNegRound(1);
      setHasReceived2ndQuote(false);
      setIsBafoLocked(false);
      setNegSavings({ amount: 0, pct: '0.0' });
      setLineCounterRates({});
      setSelectedOfferVendorId('ALL');
    }
  };

  const toggleVendorSelection = (vid: string): void => {
    if (rfqVendors.includes(vid)) {
      setRfqVendors(rfqVendors.filter(item => item !== vid));
    } else {
      setRfqVendors([...rfqVendors, vid]);
    }
  };

  const addAllRateCard = (): void => {
    const matching = allAvailableVendors
      .filter((v) => matchVendorToPRCategory(v.category, currentPR.categoryMajor, currentPR.category) && v.isRateCard)
      .map((v) => v.id);
    const merged = Array.from(new Set([...rfqVendors, ...matching]));
    setRfqVendors(merged);
  };

  const resetToRaiser = (): void => {
    setRfqVendors([]);
  };

  const handleLineCounterRateChange = (itemCode: string, newRate: number): void => {
    const updated = { ...lineCounterRates, [itemCode]: newRate };
    setLineCounterRates(updated);

    let totAmt = 0;
    currentPR.items.forEach(it => {
      const r = updated[it.code] !== undefined ? updated[it.code] : Math.round(it.benchmark * 1.04);
      totAmt += it.qty * r;
    });
    setCounterOfferInput(Math.round(totAmt));
  };

  const handleDispatchVendorWiseOffer = (targetVid?: string): void => {
    const vid = targetVid || selectedOfferVendorId;
    setSelectedOfferVendorId(vid);
    setNegRound(1.5);

    const lineRates: Record<string, number> = {};
    let totalAmt = 0;
    currentPR.items.forEach((it) => {
      const r = lineCounterRates[it.code] !== undefined
        ? lineCounterRates[it.code]
        : (it.vendorQuotes?.[vid === 'ALL' ? (participatingVendors[0]?.id || 'VND-001') : vid]?.buyerOffer1 ?? Math.round(it.benchmark * 1.04));
      lineRates[it.code] = r;
      totalAmt += it.qty * r;
    });

    const round = hasReceived2ndQuote ? 2 : 1;
    const vendorName = vid === 'ALL' ? 'All Vendors' : (getMasterVendor(vid, allAvailableVendors).name);

    submitBuyerCounterOffer?.(
      activePRId,
      vid,
      round,
      Math.round(totalAmt),
      `Category Manager Counter-Offer for Round ${round} to ${vendorName}`,
      lineRates
    );

    setPrsData((prev) => {
      const updated = { ...prev };
      const pr = updated[activePRId];
      if (pr) {
        const targetVids = vid === 'ALL' ? rfqVendors : [vid];
        pr.items = pr.items.map((it) => {
          const vq = { ...(it.vendorQuotes || {}) };
          targetVids.forEach((v) => {
            const currentQ = vq[v] || { initialRate: Math.round(it.benchmark * 1.15), revisedRate: null };
            vq[v] = {
              ...currentQ,
              ...(round === 1 ? { buyerOffer1: lineRates[it.code] } : { buyerOffer2: lineRates[it.code] }),
            };
          });
          return { ...it, vendorQuotes: vq };
        });
      }
      return updated;
    });

    alert(`Counter-Offer for Round ${round} (₹ ${Math.round(totalAmt).toLocaleString()}) dispatched successfully to ${vendorName}!`);
  };

  const handleSimulate2ndQuote = (): void => {
    setNegRound(2);
    setHasReceived2ndQuote(true);

    const targetVendors = selectedOfferVendorId === 'ALL' ? rfqVendors : [selectedOfferVendorId];

    // Apply revised quote discounts across line items for targeted vendor(s)
    const updatedPRs = { ...prsData };
    const targetPR = updatedPRs[activePRId];
    if (targetPR) {
      targetPR.items = targetPR.items.map(it => {
        const vendorQuotes = { ...(it.vendorQuotes || {}) };
        targetVendors.forEach(vid => {
          const q = vendorQuotes[vid] || { initialRate: it.benchmark * 1.15, revisedRate: null };
          const targetRate = lineCounterRates[it.code] !== undefined
            ? lineCounterRates[it.code]
            : Math.round(it.benchmark * 1.04);
          const reductionRatio = targetRate / q.initialRate;
          const discountedRate = Math.round(q.initialRate * Math.min(1.0, Math.max(0.85, reductionRatio * 1.02)));
          vendorQuotes[vid] = {
            initialRate: q.initialRate,
            revisedRate: discountedRate,
          };
        });
        return {
          ...it,
          vendorQuotes,
        };
      });
      setPrsData(updatedPRs);
    }

    let initialTotal = 0;
    targetVendors.forEach(vid => {
      currentPR.items.forEach(it => {
        const q = it.vendorQuotes?.[vid] ? it.vendorQuotes[vid].initialRate : it.benchmark * 1.15;
        initialTotal += it.qty * q;
      });
    });

    const savings = Math.max(0, Math.round(initialTotal - counterOfferInput));
    const pct = initialTotal > 0 ? ((savings / initialTotal) * 100).toFixed(1) : '8.5';
    setNegSavings({ amount: savings, pct });
  };

  const handleAcceptBafo = (): void => {
    setIsBafoLocked(true);
  };

  // Direct PPO Award Handler
  const initiatePPOAward = (vendorId: string, isNonL1: boolean): void => {
    if (!isNonL1) {
      executePPOAward(vendorId, false, undefined);
    } else {
      setPendingAwardVendorId(vendorId);
      setIsNonL1ModalOpen(true);
    }
  };

  const confirmNonL1Award = (): void => {
    if (!nonL1JustificationText.trim()) {
      alert('Please enter an operational justification note for Non-L1 award.');
      return;
    }
    if (pendingAwardVendorId) {
      executePPOAward(pendingAwardVendorId, true, {
        category: nonL1ReasonCategory,
        text: nonL1JustificationText.trim(),
      });
    }
    setIsNonL1ModalOpen(false);
    setPendingAwardVendorId(null);
  };

  const executePPOAward = (vendorId: string, isNonL1: boolean, justification?: NonL1Justification): void => {
    const v = getMasterVendor(vendorId, allAvailableVendors);
    const isMethod2 = currentPR.method === 'METHOD_2';

    let netTotal = 0;
    currentPR.items.forEach(it => {
      if (isMethod2) {
        const rc = getItemRateCard(it, vendorId);
        netTotal += it.qty * rc;
      } else {
        const q = getItemVendorQuote(it, vendorId);
        const rate = q.revisedRate ?? q.initialRate;
        netTotal += it.qty * rate;
      }
    });

    const gst = Math.round(netTotal * 0.18);
    const grandTotal = Math.round(netTotal) + gst;
    const ppoSuffix = (currentPR?.id || 'PR-2026-0005').split('-')[2] || '0005';
    const ppoNumber = `PPO-2026-${ppoSuffix}`;

    setAwardedPPO({
      ppoNumber,
      vendorId: v.id,
      vendorName: v.name,
      isNonL1,
      justification,
      netTotal: Math.round(netTotal),
      gst,
      grandTotal,
    });

    setActiveTab('ppogen');
  };

  const participatingVendorIds = useMemo(() => {
    if (rfqVendors.length > 0) return rfqVendors;
    // For Commercial Matrix / Negotiation / PPO tabs, if no vendors nominated yet in RFQ tab,
    // look for vendors that have submitted quotes in this PR's items
    if (activeTab === 'commercial' || activeTab === 'negotiation' || activeTab === 'ppogen') {
      const quoteVids = new Set<string>();
      (currentPR.items || []).forEach(it => {
        Object.keys(it.vendorQuotes || {}).forEach(vid => quoteVids.add(vid));
      });
      if (quoteVids.size > 0) {
        return Array.from(quoteVids);
      }
      if (currentPR.nominatedVendors && currentPR.nominatedVendors.length > 0) {
        return currentPR.nominatedVendors;
      }
    }
    return [];
  }, [rfqVendors, activeTab, currentPR]);

  const participatingVendors = participatingVendorIds.map(vid => getMasterVendor(vid, allAvailableVendors));

  useEffect(() => {
    const hasAnyRevised = currentPR.items.some((it) =>
      participatingVendors.some(
        (v) => it.vendorQuotes?.[v.id]?.revisedRate !== null && it.vendorQuotes?.[v.id]?.revisedRate !== undefined
      )
    );
    if (hasAnyRevised) {
      setHasReceived2ndQuote(true);
      if (negRound < 2) setNegRound(2);
    }
  }, [currentPR, participatingVendors, negRound]);

  const isMethod2 = currentPR.method === 'METHOD_2';

  // Calculate totals per participating vendor
  const vendorTotals: Record<string, { total: number; initialTotal: number }> = {};
  participatingVendors.forEach(v => {
    let tot = 0;
    let initTot = 0;
    currentPR.items.forEach(it => {
      if (isMethod2) {
        const rc = getItemRateCard(it, v.id);
        tot += it.qty * rc;
        initTot += it.qty * rc;
      } else {
        const q = getItemVendorQuote(it, v.id);
        initTot += it.qty * q.initialRate;
        tot += it.qty * (q.revisedRate ?? q.initialRate);
      }
    });
    vendorTotals[v.id] = { total: Math.round(tot), initialTotal: Math.round(initTot) };
  });

  const sortedVendorIds = Object.keys(vendorTotals).sort((a, b) => (vendorTotals[a]?.total ?? 0) - (vendorTotals[b]?.total ?? 0));
  const l1VendorId = sortedVendorIds[0] || '';
  const l1MinTotal = l1VendorId && vendorTotals[l1VendorId] ? vendorTotals[l1VendorId].total : 0;
  const l1VendorObj = getMasterVendor(l1VendorId, allAvailableVendors);

  // For Non-L1 modal calculations
  const pendingVendorObj = getMasterVendor(pendingAwardVendorId || '', allAvailableVendors);
  const pendingVendorTotal = pendingAwardVendorId && vendorTotals[pendingAwardVendorId] ? vendorTotals[pendingAwardVendorId].total : 0;
  const nonL1DeltaAmt = pendingVendorTotal - l1MinTotal;
  const nonL1DeltaPct = l1MinTotal > 0 ? ((nonL1DeltaAmt / l1MinTotal) * 100).toFixed(1) : '0.0';

  if (showEAuctionPage) {
    return (
      <BuyerEAuctionPage
        prId={currentPR.id}
        onBackToNegotiation={() => setShowEAuctionPage(false)}
        onAwardToPPO={(winnerVendorId) => {
          setShowEAuctionPage(false);
          initiatePPOAward(winnerVendorId, false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white text-slate-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-blue-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                {UI_STRINGS.categoryManagerHub.roleBadge}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Active Package: {currentPR.id.replace('PR-', 'PKG-')} ({currentPR.category})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1 text-slate-900">{UI_STRINGS.categoryManagerHub.title}</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              {UI_STRINGS.categoryManagerHub.subtitle}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Switch RFQ Package
            </span>
            <div className="flex flex-wrap items-center gap-1.5 max-w-md justify-start sm:justify-end">
              {Object.values(prsData).map((pr) => {
                const isSelected = pr.id === activePRId;
                return (
                  <button
                    key={pr.id}
                    type="button"
                    onClick={() => selectPR(pr.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {pr.id}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleCreateBlankRFQ}
                className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{UI_STRINGS.categoryManagerHub.createBlankRFQ}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Main Navigation Tabs Bar (Single Non-Wrapping Line with Distinct Colors) */}
      <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-2">
        <div className="flex items-center gap-2 p-1.5 bg-blue-50/30 rounded-xl border border-blue-200 overflow-x-auto whitespace-nowrap">
          {/* Tab 1: RFQ & Vendor Tender Manager (Blue) */}
          <button
            type="button"
            onClick={() => setActiveTab('rfq')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 border ${
              activeTab === 'rfq'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 border-blue-600'
                : 'bg-blue-50/70 text-blue-700 hover:bg-blue-100/80 border-blue-200/80 font-semibold'
            }`}
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>{UI_STRINGS.categoryManagerHub.tabRFQ}</span>
          </button>

          {/* Tab 2: Commercial Matrix & CBA (Indigo) */}
          <button
            type="button"
            onClick={() => setActiveTab('commercial')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 border ${
              activeTab === 'commercial'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 border-indigo-600'
                : 'bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100/80 border-indigo-200/80 font-semibold'
            }`}
          >
            <Scale className="w-3.5 h-3.5 shrink-0" />
            <span>{UI_STRINGS.categoryManagerHub.tabCommercial}</span>
          </button>

          {/* Tab 3: AI Cost Benchmarking & MLEO (Purple) */}
          <button
            type="button"
            onClick={() => setActiveTab('aicost')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 border ${
              activeTab === 'aicost'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-200 border-purple-600'
                : 'bg-purple-50/70 text-purple-700 hover:bg-purple-100/80 border-purple-200/80 font-semibold'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{UI_STRINGS.categoryManagerHub.tabAICost}</span>
          </button>

          {/* Tab 4: Vendor Negotiation & Counter-Offers (Amber) */}
          <button
            type="button"
            onClick={() => setActiveTab('negotiation')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 border ${
              activeTab === 'negotiation'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-200 border-amber-600'
                : 'bg-amber-50/70 text-amber-800 hover:bg-amber-100/80 border-amber-200/80 font-semibold'
            }`}
          >
            <MessageSquareDiff className="w-3.5 h-3.5 shrink-0" />
            <span>{UI_STRINGS.categoryManagerHub.tabNegotiation}</span>
          </button>

          {/* Tab 5: PPO Proposal & Routing (Emerald) */}
          <button
            type="button"
            onClick={() => setActiveTab('ppogen')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 border ${
              activeTab === 'ppogen'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200 border-emerald-600'
                : 'bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/80 border-emerald-200/80 font-semibold'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
            <span>{UI_STRINGS.categoryManagerHub.tabPPO}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: 1. RFQ & Vendor Tender Manager */}
      {activeTab === 'rfq' && (
        <div className="space-y-6 pt-2">
          {/* Selected RFQ Package Overview Card */}
          <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-black bg-brand-900 text-white px-2 py-0.5 rounded">{currentPR.id}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${currentPR.methodBadgeClass}`}>{currentPR.methodName}</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Technical Scope Approved ✓</span>
              {prs?.find(p => p.id === currentPR.id)?.status === 'SUBMITTED' && (
                <span className="text-xs font-bold text-sky-800 bg-sky-100 border border-sky-300 px-2 py-0.5 rounded">
                  SUBMITTED
                </span>
              )}
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1.5">{currentPR.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Project: <strong>{currentPR.project}</strong> • Cost Center: <strong>{currentPR.costCenter}</strong> • Scoped By: <strong>{currentPR.raiser}</strong></p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Baseline Estimate</span>
              <span className="text-base font-mono font-black text-slate-900">₹ {currentPR.estBaseline.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Target Delivery</span>
              <span className="text-base font-mono font-black text-emerald-900">{currentPR.targetDate}</span>
            </div>
          </div>
        </div>

        {/* Package Delivery & Nominated Vendors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-500 uppercase text-[10px] block">Delivery Location & Site Contact</span>
            <p className="font-semibold text-slate-800">{currentPR.site}</p>
            <p className="text-slate-500 font-mono text-[11px]">Contact: {currentPR.contact}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-500 uppercase text-[10px] block">Attached Scope & Spec Documents</span>
            <div className="flex items-center space-x-2 text-sky-800 font-bold">
              <FileText className="w-4 h-4" />
              <span>{currentPR.sourceFile}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Total {currentPR.docCount} technical drawings & scope specifications</p>
          </div>

          <div className="p-3 bg-slate-950 text-white rounded-xl space-y-1">
            <span className="font-bold text-amber-300 uppercase text-[10px] block">Nominated Sourcing Suppliers</span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {(currentPR.nominatedVendors && currentPR.nominatedVendors.length > 0) ? (
                currentPR.nominatedVendors.map(vid => {
                  const v = getMasterVendor(vid, allAvailableVendors);
                  return (
                    <span key={vid} className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold border ${v.isRateCard ? 'bg-emerald-900/60 text-emerald-200 border-emerald-500/40' : 'bg-sky-900/60 text-sky-200 border-sky-500/40'}`}>
                      <span>{v.isRateCard ? '🟢' : '🔵'}</span>
                      <span>{v.name} ({v.id})</span>
                      <span className="text-amber-400 text-[10px]">★{v.rating.toFixed(1)}</span>
                    </span>
                  );
                })
              ) : (
                <span className="text-[11px] text-slate-400 italic">No suppliers nominated yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top RFQ Active Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-amber-950 text-sm">
                    Active RFQ: RFQ-2026-{(currentPR?.id || 'PR-2026-0005').split('-')[2] || '0005'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-mono font-bold text-[10px]">
                    Package: {currentPR?.id || 'PR-2026-0005'}
                  </span>
                  {isCurrentRFQSubmitted ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                      Tender Submitted &amp; Circulated ✓
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[10px] border border-sky-300">
                      Draft RFQ Package
                    </span>
                  )}
                </div>
                <p className="text-amber-800 mt-1">Inviting nominated suppliers for competitive electronic quotation across 5 comprehensive modules.</p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-300">
                  {rfqVendors.length} Suppliers in Scope
                </span>
              </div>
            </div>

            {/* 5 RFQ Sub-Tabs Navigation */}
            <div className="border-b border-slate-200 bg-slate-50/90 rounded-xl p-1.5 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setRfqSubTab('general')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  rfqSubTab === 'general'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{UI_STRINGS.categoryManagerHub.subTabGeneral}</span>
              </button>
              <button
                type="button"
                onClick={() => setRfqSubTab('suppliers')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  rfqSubTab === 'suppliers'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{UI_STRINGS.categoryManagerHub.subTabSuppliers}</span>
              </button>
              <button
                type="button"
                onClick={() => setRfqSubTab('delivery')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  rfqSubTab === 'delivery'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{UI_STRINGS.categoryManagerHub.subTabDelivery}</span>
              </button>
              <button
                type="button"
                onClick={() => setRfqSubTab('terms')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  rfqSubTab === 'terms'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{UI_STRINGS.categoryManagerHub.subTabTerms}</span>
              </button>
              <button
                type="button"
                onClick={() => setRfqSubTab('documents')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  rfqSubTab === 'documents'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>{UI_STRINGS.categoryManagerHub.subTabDocuments}</span>
              </button>
            </div>

            {/* Sub-Tab 1: General */}
            {rfqSubTab === 'general' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs">
                <div className="border-b pb-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>1. General Details (Product / Service Specifications)</span>
                  </h4>
                  <p className="text-slate-500 mt-0.5">
                    Define technical scope description, project allocation, area, and procurement priority.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-700 block">Product / Service Description:*</label>
                    <textarea
                      rows={2}
                      value={rfqDescription}
                      onChange={(e) => setRfqDescription(e.target.value)}
                      placeholder="e.g. Supply and Installation of Architectural Reception Counter & Fitouts"
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Cost Centre:*</label>
                    <input
                      type="text"
                      value={rfqCostCentre}
                      onChange={(e) => setRfqCostCentre(e.target.value)}
                      placeholder="e.g. CC-104 (Finishing, Interior & Millwork)"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Square Feet (Scope Area):*</label>
                    <input
                      type="text"
                      value={rfqSquareFeet}
                      onChange={(e) => setRfqSquareFeet(e.target.value)}
                      placeholder="e.g. 4,500 sq.ft"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Package Priority:*</label>
                    <select
                      value={rfqPriority}
                      onChange={(e) => setRfqPriority(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Urgent">Urgent (Critical Path)</option>
                      <option value="High Priority">High Priority</option>
                      <option value="Medium Priority">Medium Priority</option>
                      <option value="Low Priority">Low Priority</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Expected Date (Required By):*</label>
                    <input
                      type="date"
                      value={rfqExpectedDate}
                      onChange={(e) => setRfqExpectedDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setRfqSubTab('suppliers')}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5"
                  >
                    <span>Next: 2. Supplier Selection →</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Supplier Selection */}
            {rfqSubTab === 'suppliers' && (
              <div className="space-y-5 text-xs">
                {/* CM Supplier Alteration Studio */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-sky-600" />
                        <span>2. Supplier Selection &amp; Circulation Studio</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Select and curate the qualified vendors to invite for electronic quotation.</p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button onClick={resetToRaiser} className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold text-[11px] border border-slate-300 rounded-lg bg-white shadow-sm">
                        ↺ Reset to Default (Blank)
                      </button>
                      <button onClick={addAllRateCard} className="px-2.5 py-1 text-emerald-700 hover:text-emerald-900 font-bold text-[11px] border border-emerald-300 rounded-lg bg-emerald-50 shadow-sm">
                        + Add All Rate Card Vendors
                      </button>
                    </div>
                  </div>

                  {/* Multi-Select Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Add / Alter Suppliers for RFQ Circulation:</span>
                      <span className="text-[11px] font-mono text-slate-500">{rfqVendors.length} Vendors in RFQ Scope</span>
                    </label>

                    {/* Rate Card vs Non-Rate Card Segmented Filter */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setVendorFilterType('ALL')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          vendorFilterType === 'ALL'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All Vendors ({allAvailableVendors.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setVendorFilterType('CLIENT_ONBOARDED')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                          vendorFilterType === 'CLIENT_ONBOARDED'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-emerald-800 hover:bg-emerald-50'
                        }`}
                      >
                        <span>🏢</span> Client Onboarded ({clientOnboardedVendorsCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setVendorFilterType('RATE_CARD')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                          vendorFilterType === 'RATE_CARD'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-emerald-800 hover:bg-emerald-50'
                        }`}
                      >
                        <span>🟢</span> Rate Card Vendors (Fast-Track)
                      </button>
                      <button
                        type="button"
                        onClick={() => setVendorFilterType('NON_RATE_CARD')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                          vendorFilterType === 'NON_RATE_CARD'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-sky-800 hover:bg-sky-50'
                        }`}
                      >
                        <span>🔵</span> Non-Rate Card Vendors
                      </button>
                    </div>

                    <div className="relative">
                      <button 
                        type="button"
                        data-testid="rfq-supplier-dropdown-trigger"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full text-left bg-white border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-800 shadow-sm flex items-center justify-between hover:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <div className="flex items-center space-x-2 overflow-hidden flex-1">
                          {rfqVendors.slice(0, 3).map(vid => {
                            const v = getMasterVendor(vid, allAvailableVendors);
                            return (
                              <span key={vid} className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${v.isRateCard ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-sky-50 text-sky-900 border-sky-300'}`}>
                                <span>{v.isRateCard ? '🟢' : '🔵'}</span>
                                <span>{v.name}</span>
                              </span>
                            );
                          })}
                          {rfqVendors.length > 3 && <span className="text-xs font-bold text-slate-600">+{rfqVendors.length - 3} more</span>}
                          {rfqVendors.length === 0 && (
                            <span className="text-xs font-bold text-slate-400">Select suppliers to invite for RFQ...</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 shrink-0 ml-2">
                          <span className="text-[11px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">{rfqVendors.length} selected</span>
                          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-30 max-h-72 overflow-y-auto divide-y divide-slate-100">
                          {/* Search & Category Filter Controls */}
                          <div className="p-2.5 bg-slate-50 border-b border-slate-200 sticky top-0 z-10 space-y-2">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                              <input
                                type="text"
                                placeholder={UI_STRINGS.categoryManagerHub.searchVendorPlaceholder}
                                value={vendorSearchQuery}
                                onChange={(e) => setVendorSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
                              <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={showAllVendorCategories}
                                  onChange={(e) => setShowAllVendorCategories(e.target.checked)}
                                  className="w-3.5 h-3.5 rounded text-amber-600 border-slate-300"
                                />
                                <span className="font-semibold">Show all categories (including all client onboarded)</span>
                              </label>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Scope: {currentPR.category}
                              </span>
                            </div>
                          </div>

                          {/* Filtered Vendor Options */}
                          {(() => {
                            const filtered = allAvailableVendors.filter(v => {
                              if (vendorSearchQuery.trim()) {
                                const q = vendorSearchQuery.toLowerCase();
                                const matchName = v.name.toLowerCase().includes(q);
                                const matchId = v.id.toLowerCase().includes(q);
                                const matchCat = (v.category || '').toLowerCase().includes(q);
                                const matchCats = (v.categories || []).some(c => c.toLowerCase().includes(q));
                                if (!matchName && !matchId && !matchCat && !matchCats) return false;
                              }

                              const isClientBoarded = v.source === 'CLIENT_ONBOARDED';
                              if (vendorFilterType === 'CLIENT_ONBOARDED') return isClientBoarded;
                              if (vendorFilterType === 'RATE_CARD') return v.isRateCard;
                              if (vendorFilterType === 'NON_RATE_CARD') return !v.isRateCard;

                              if (isClientBoarded || showAllVendorCategories) return true;

                              return matchVendorToPRCategory(
                                v.category,
                                currentPR.categoryMajor,
                                currentPR.category,
                                v.categories
                              );
                            });

                            if (filtered.length === 0) {
                              return (
                                <div className="p-4 text-center text-xs text-slate-500">
                                  <p className="font-bold">No suppliers found</p>
                                  <p className="text-[11px] text-slate-400 mt-0.5">Try changing your search term or filter tabs above.</p>
                                </div>
                              );
                            }

                            return filtered.map(v => {
                              const isChecked = rfqVendors.includes(v.id);
                              const isNominatedByRaiser = (currentPR.nominatedVendors || []).includes(v.id);
                              const isClientBoarded = v.source === 'CLIENT_ONBOARDED';
                              return (
                                <div 
                                  key={v.id} 
                                  onClick={() => toggleVendorSelection(v.id)}
                                  className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-slate-100 ${isChecked ? (v.isRateCard ? 'bg-emerald-50/60' : 'bg-sky-50/60') : 'bg-white'}`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <input 
                                      type="checkbox" 
                                      checked={isChecked} 
                                      onChange={() => {}} 
                                      className="w-4 h-4 rounded text-amber-600 border-slate-300"
                                    />
                                    <div className="flex items-center space-x-2 flex-wrap">
                                      <span className="font-bold text-slate-900 text-xs font-mono">{v.name} ({v.id})</span>
                                      {isClientBoarded && (
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white border border-emerald-700 shadow-2xs">
                                          🏢 Client Boarded
                                        </span>
                                      )}
                                      {isNominatedByRaiser && <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-purple-100 text-purple-900 border border-purple-300">★ Primary Scope</span>}
                                      <span className="text-[10px] text-slate-500 font-medium">
                                        • {v.category}
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                          v.isRateCard
                                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                            : 'bg-sky-100 text-sky-900 border border-sky-300'
                                        }`}
                                      >
                                        {v.isRateCard
                                          ? `🟢 Rate Card • ${
                                              getVendorCategoryRateCardCoverage
                                                ? getVendorCategoryRateCardCoverage(v.id, v.category).coveragePct
                                                : 100
                                            }% Std BOQ`
                                          : '🔵 Non-Rate Card'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs shrink-0">
                                    <span className="text-amber-500 font-bold">★ {v.rating.toFixed(1)}</span>
                                    <span className="text-slate-400 font-mono">{v.leadTime}</span>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Selected Chips */}
                    <div className="flex flex-wrap gap-2 items-center min-h-[36px] p-2.5 bg-white rounded-xl border border-slate-200">
                      {rfqVendors.length > 0 ? (
                        rfqVendors.map(vid => {
                          const v = getMasterVendor(vid, allAvailableVendors);
                          const isNominatedByRaiser = (currentPR.nominatedVendors || []).includes(vid);
                          const isClientBoarded = v.source === 'CLIENT_ONBOARDED';
                          return (
                            <div key={vid} className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${v.isRateCard ? 'bg-emerald-100 text-emerald-950 border-emerald-300' : 'bg-sky-100 text-sky-950 border-sky-300'}`}>
                              <span>{v.isRateCard ? '🟢' : '🔵'}</span>
                              <span>{v.name} ({v.id})</span>
                              {isClientBoarded && (
                                <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-extrabold shadow-2xs">
                                  Client Boarded
                                </span>
                              )}
                              {isNominatedByRaiser && <span className="text-[9px] bg-purple-200 text-purple-950 px-1 py-0.2 rounded font-extrabold">Primary</span>}
                              <span className="text-amber-600 font-mono text-[11px]">★ {v.rating.toFixed(1)}</span>
                              <button onClick={() => toggleVendorSelection(vid)} className="ml-1 text-slate-500 hover:text-rose-600 font-black">✕</button>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          No suppliers selected yet. Open the dropdown above to nominate suppliers.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nominated Suppliers Scope Roster Table */}
                <div className="bg-white rounded-2xl border border-blue-200 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center">
                        <Users className="w-4 h-4 text-sky-600 mr-1.5" />
                        Nominated Suppliers for RFQ Circulation ({rfqVendors.length} Suppliers):
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        These suppliers will receive notification and access to provide Quotation 1.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-blue-200 rounded-xl">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-blue-50/80 font-bold border-b-2 border-blue-200 text-blue-950">
                        <tr>
                          <th className="p-3 w-12">#</th>
                          <th className="p-3">Supplier Name &amp; Code</th>
                          <th className="p-3">Supplier Type</th>
                          <th className="p-3">Nomination Source</th>
                          <th className="p-3">Supplier Rating</th>
                          <th className="p-3">Lead Time</th>
                          <th className="p-3 text-center">Tender Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-100">
                        {rfqVendors.length > 0 ? (
                          rfqVendors.map((vid, idx) => {
                            const v = getMasterVendor(vid, allAvailableVendors);
                            const isNominatedByRaiser = (currentPR.nominatedVendors || []).includes(vid);
                            const coverage = checkCoverage(currentPR.items, vid);
                            const stdBOQ = getVendorCategoryRateCardCoverage?.(v.id, v.category);
                          return (
                            <tr key={vid} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                              <td className="p-3 font-bold text-slate-900">
                                <div>{v.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono font-normal">{v.id} • {v.city}</div>
                              </td>
                              <td className="p-3">
                                <div>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      v.isRateCard
                                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                        : 'bg-sky-100 text-sky-900 border border-sky-300'
                                    }`}
                                  >
                                    {v.isRateCard ? '🟢 Rate Card Vendor' : '🔵 Non-Rate Card'}
                                  </span>
                                  {v.isRateCard && (
                                    <div className="space-y-0.5 mt-1">
                                      {stdBOQ && (
                                        <div className="text-[10px] font-bold text-slate-700">
                                          Std BOQ: {stdBOQ.coveragePct}% ({stdBOQ.coveredItemsCount}/
                                          {stdBOQ.totalStandardBOQItems})
                                        </div>
                                      )}
                                      <div className="text-[10px] font-semibold">
                                        {coverage.isFullyCovered ? (
                                          <span className="text-emerald-700">PR: 100% Items Covered</span>
                                        ) : (
                                          <span className="text-amber-700">
                                            PR: {coverage.coveredItemsCount}/{coverage.totalPrItemsCount} Covered
                                            {` (${coverage.deltaItemsCount} Delta)`}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                {isNominatedByRaiser ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-900 border border-purple-300">
                                    ★ Primary Nominated
                                  </span>
                                ) : (
                                  <span className="text-slate-500 text-[11px]">CM Added</span>
                                )}
                              </td>
                              <td className="p-3 text-amber-500 font-bold font-mono">
                                ★ {v.rating.toFixed(1)}
                              </td>
                              <td className="p-3 font-mono text-slate-600">
                                {v.leadTime}
                              </td>
                              <td className="p-3 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {isCurrentRFQSubmitted ? 'Tender Circulated' : 'Ready to Dispatch'}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {v.isRateCard && coverage.isFullyCovered && (
                                    <button
                                      type="button"
                                      onClick={() => handleFastTrackPPO(v.id, v.name, coverage)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors"
                                    >
                                      <Zap className="w-3 h-3 text-amber-300" />
                                      Fast-Track PPO
                                    </button>
                                  )}
                                  {v.isRateCard && !coverage.isFullyCovered && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDeltaModal(v.id, coverage)}
                                      className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors"
                                    >
                                      Quote Delta ({coverage.deltaItemsCount})
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => toggleVendorSelection(vid)}
                                    className="text-rose-500 hover:text-rose-700 font-bold text-xs ml-1"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-8 text-center bg-slate-50 text-slate-500">
                            <Users className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                            <p className="font-bold text-xs text-slate-700">{UI_STRINGS.categoryManagerHub.noSuppliersNominated}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Open the supplier selection dropdown above to nominate suppliers (including newly onboarded client vendors) for electronic RFQ circulation.
                            </p>
                          </td>
                        </tr>
                      )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setRfqSubTab('general')}
                      className="text-slate-600 hover:text-slate-900 font-bold px-3 py-1.5 rounded-lg border border-slate-300"
                    >
                      ← Previous: 1. General
                    </button>
                    <button
                      type="button"
                      onClick={() => setRfqSubTab('delivery')}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5"
                    >
                      <span>Next: 3. Delivery Location →</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 3: Delivery Location */}
            {rfqSubTab === 'delivery' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs">
                <div className="border-b pb-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>3. Delivery Location &amp; Site Staging</span>
                  </h4>
                  <p className="text-slate-500 mt-0.5">
                    Specify delivery address, on-site contact lead, and offloading requirements for prospective bidders.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-700 block">Delivery Site Address:*</label>
                    <textarea
                      rows={2}
                      value={rfqDeliveryAddress}
                      onChange={(e) => setRfqDeliveryAddress(e.target.value)}
                      placeholder="e.g. Metro Line 4 Underground Site / Depot, Pier Zone B"
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Site Lead / Contact Person:*</label>
                    <input
                      type="text"
                      value={rfqSiteContact}
                      onChange={(e) => setRfqSiteContact(e.target.value)}
                      placeholder="e.g. Site Engineer / Contact Person (+91 98201 44520)"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Staging &amp; Crane Unloading Instructions:</label>
                    <input
                      type="text"
                      value={rfqStagingPlan}
                      onChange={(e) => setRfqStagingPlan(e.target.value)}
                      placeholder="e.g. Depot Storage Yard B • Staging Crane Access Included"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setRfqSubTab('suppliers')}
                    className="text-slate-600 hover:text-slate-900 font-bold px-3 py-1.5 rounded-lg border border-slate-300"
                  >
                    ← Previous: 2. Supplier Selection
                  </button>
                  <button
                    type="button"
                    onClick={() => setRfqSubTab('terms')}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5"
                  >
                    <span>Next: 4. Terms &amp; Conditions →</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sub-Tab 4: Terms and Conditions */}
            {rfqSubTab === 'terms' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs">
                <div className="border-b pb-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>4. Commercial Terms &amp; Governance Conditions</span>
                  </h4>
                  <p className="text-slate-500 mt-0.5">
                    Baseline contractual terms that vendors must agree or provide variations to in their bid.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-700 block">Standard Payment Terms:*</label>
                    <input
                      type="text"
                      value={rfqPaymentTerms}
                      onChange={(e) => setRfqPaymentTerms(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Target Lead Time SLA:*</label>
                    <input
                      type="text"
                      value={rfqLeadTime}
                      onChange={(e) => setRfqLeadTime(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Warranty &amp; DLP:*</label>
                    <input
                      type="text"
                      value={rfqWarranty}
                      onChange={(e) => setRfqWarranty(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-700 block">Liquidated Damages (LD) Clause:*</label>
                    <input
                      type="text"
                      value={rfqLiquidatedDamages}
                      onChange={(e) => setRfqLiquidatedDamages(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setRfqSubTab('delivery')}
                    className="text-slate-600 hover:text-slate-900 font-bold px-3 py-1.5 rounded-lg border border-slate-300"
                  >
                    ← Previous: 3. Delivery Location
                  </button>
                  <button
                    type="button"
                    onClick={() => setRfqSubTab('documents')}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5"
                  >
                    <span>Next: 5. Documents →</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sub-Tab 5: Documents */}
            {rfqSubTab === 'documents' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs">
                <div className="border-b pb-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center space-x-1.5">
                    <Paperclip className="w-4 h-4 text-amber-600" />
                    <span>5. Attached Technical Drawings &amp; Specifications</span>
                  </h4>
                  <p className="text-slate-500 mt-0.5">
                    Engineering drawings, technical specifications, and BOQ schedules attached to this RFQ package.
                  </p>
                </div>

                {rfqDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {rfqDocuments.map((doc, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center space-x-2 text-sky-800 font-bold">
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="truncate">{doc.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>{doc.type}</span>
                          <span>{doc.size}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500 space-y-1">
                    <p className="font-bold text-xs text-slate-700">No Technical Documents Attached</p>
                    <p className="text-[11px] text-slate-400">Attach tender drawings, specification sheets, or schedule files below.</p>
                  </div>
                )}

                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
                  <Paperclip className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="font-bold text-slate-700 block text-xs">Attach Additional Drawing or Spec Sheets</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Supports PDF, CAD DWG, Excel, PNG (up to 25MB)</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setRfqSubTab('terms')}
                    className="text-slate-600 hover:text-slate-900 font-bold px-3 py-1.5 rounded-lg border border-slate-300"
                  >
                    ← Previous: 4. Terms &amp; Conditions
                  </button>
                  <button
                    type="button"
                    onClick={handlePublishRFQ}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-2.5 rounded-xl shadow-md flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{UI_STRINGS.categoryManagerHub.submitRFQ}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Persistent RFQ Tender Dispatch & Closure Date Provision Controls */}
            <div className="bg-brand-900 text-white rounded-2xl p-5 border border-brand-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block">
                  Tender Schedule &amp; Commercial Governance
                </span>
                <h4 className="text-sm font-black text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>RFQ Tender Closure &amp; Submission Provisions</span>
                </h4>
                <p className="text-xs text-slate-300 max-w-xl">
                  Set the formal quotation submission deadline for all nominated vendors.
                  Submit the RFQ package to dispatch RFP notifications.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700 p-2.5 rounded-xl">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {UI_STRINGS.categoryManagerHub.rfqClosureDateLabel}
                    </span>
                    <input
                      type="date"
                      value={rfqClosureDate}
                      onChange={(e) => setRfqClosureDate(e.target.value)}
                      className="text-xs font-mono font-bold bg-transparent text-white border-0 focus:outline-none focus:ring-0 p-0"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePublishRFQ}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs shadow-md flex items-center space-x-2 transition-all ${
                    isCurrentRFQSubmitted
                      ? 'bg-emerald-700 text-white shadow-emerald-900/50'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-lg'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isCurrentRFQSubmitted
                      ? UI_STRINGS.categoryManagerHub.rfqSubmittedNotice
                      : UI_STRINGS.categoryManagerHub.submitRFQ}
                  </span>
                </button>
              </div>
            </div>

            {/* Success Feedback Modal / Alert */}
            {showRfqSuccessModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                <div className="bg-white rounded-2xl shadow-2xl border border-emerald-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          {UI_STRINGS.categoryManagerHub.rfqSuccessfullySubmitted}
                        </h3>
                        <p className="text-xs text-slate-500">
                          RFQ Reference: <span className="font-mono font-bold text-slate-800">{currentRfqId}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRfqSuccessModal(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-emerald-50/80 rounded-xl p-3.5 border border-emerald-200 text-xs space-y-1.5 text-emerald-900">
                    <div className="font-bold flex items-center justify-between">
                      <span>Package: {rfqDescription}</span>
                      <span className="font-mono">{rfqVendors.length} Suppliers</span>
                    </div>
                    <p className="text-emerald-800">
                      Tender invitation has been circulated to {rfqVendors.length} nominated vendors.
                      Submission closure date is set to <strong>{rfqClosureDate}</strong>.
                    </p>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRfqSuccessModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRfqSuccessModal(false);
                        setActiveTab('commercial');
                      }}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>View Commercial Matrix (CBA) →</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* RFQ Tender Circulation History Across Enterprise */}
            <RFQCirculationHistoryTable
              circulatedRFQs={circulatedRFQs}
              prs={prs}
              activePRId={activePRId}
              onSelectPR={selectPR}
              onOpenCommercialTab={(targetPrId) => {
                selectPR(targetPrId);
                setActiveTab('commercial');
              }}
            />
          </div>
        )}

        {/* Tab 2: 4-Way Commercial Matrix & CBA */}
        {activeTab === 'commercial' && (
          <div className="space-y-6 pt-2">
            
            {/* Top 4 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-[10px] font-bold uppercase text-blue-700">1. Best Historical Price Target</span>
                <p className="text-lg font-black text-blue-950 mt-1 font-mono">₹ {currentPR.items.reduce((acc, it) => acc + (it.qty * it.bestHistoricalPrice), 0).toLocaleString()}</p>
              </div>
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold uppercase text-amber-700">2. L1 Lowest Bid ({l1VendorObj.name})</span>
                <p className="text-lg font-black text-amber-950 mt-1 font-mono">₹ {l1MinTotal.toLocaleString()}</p>
                {(() => {
                  const histTot = currentPR.items.reduce((acc, it) => acc + (it.qty * it.bestHistoricalPrice), 0);
                  const varHist = (((l1MinTotal - histTot) / histTot) * 100).toFixed(1);
                  return (
                    <div className="text-[10px] font-mono text-amber-800 font-bold mt-0.5">
                      {parseFloat(varHist) >= 0 ? '+' : ''}{varHist}% vs Best Historical
                    </div>
                  );
                })()}
              </div>
              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200">
                <span className="text-[10px] font-bold uppercase text-purple-700">3. AI Should-Cost Benchmark</span>
                <p className="text-lg font-black text-purple-950 mt-1 font-mono">₹ {currentPR.items.reduce((acc, it) => acc + (it.qty * it.benchmark), 0).toLocaleString()}</p>
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold uppercase text-emerald-700">4. Target Negotiation Savings</span>
                <p className="text-lg font-black text-emerald-700 mt-1 font-mono">₹ {Math.round(l1MinTotal * 0.085).toLocaleString()} (8.5%)</p>
              </div>
            </div>

            {/* Direct PPO Award Console (Cards per Participating Vendor) */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h4 className="text-xs font-black text-amber-300 flex items-center space-x-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    <span>Direct PPO Generation & Vendor Award Console</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Award PPO directly to L1 Winner or Non-L1 Vendor (requires audited justification note).</p>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                  {participatingVendors.length} Participating Vendors
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedVendorIds.map((vid, rankIdx) => {
                  const v = participatingVendors.find(item => item.id === vid)
                    ?? getMasterVendor(vid, allAvailableVendors);
                  const data = vendorTotals[vid];
                  const isL1 = rankIdx === 0;
                  const diffOverL1 = data.total - l1MinTotal;
                  const diffPct = l1MinTotal > 0 ? ((diffOverL1 / l1MinTotal) * 100).toFixed(1) : '0.0';
                  const vTerms = getVendorCommercialTerms(vid, currentPR.id);

                  return (
                    <div key={vid} className={`p-3.5 rounded-xl border ${isL1 ? 'bg-slate-800/90 border-emerald-400/60 ring-1 ring-emerald-400' : 'bg-slate-800/60 border-slate-700'} space-y-2.5 text-xs`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-white text-xs">{v.name} ({v.id})</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-black ${isL1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>L{rankIdx + 1}</span>
                        </div>
                        <span className="text-amber-400 text-[10px]">★ {v.rating.toFixed(1)}</span>
                      </div>

                      <div className="space-y-1 font-mono">
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Total Package Bid:</span>
                          <strong className="text-base text-emerald-400">₹ {data.total.toLocaleString()}</strong>
                        </div>
                        {data.initialTotal !== data.total && (
                          <div className="flex justify-between text-[11px] text-amber-300">
                            <span>Initial Bid:</span>
                            <span className="line-through text-slate-400">₹ {data.initialTotal.toLocaleString()}</span>
                          </div>
                        )}
                        {!isL1 ? (
                          <div className="flex justify-between text-[10px] text-rose-300">
                            <span>Delta vs L1:</span>
                            <span>+₹ {diffOverL1.toLocaleString()} (+{diffPct}%)</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-300 font-sans font-bold">✓ Lowest Compliant Commercial Bidder</div>
                        )}
                      </div>

                      {/* Vendor Commercial Terms in Award Card */}
                      <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-700/80 space-y-1.5 text-[11px] font-sans">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Quoted Payment Terms:</span>
                          <span className="text-slate-200 font-medium text-[11px] leading-tight block">{vTerms.paymentTerms}</span>
                        </div>
                        <div className="flex items-center justify-between pt-0.5 border-t border-slate-800">
                          <span className="text-slate-400 text-[10px] uppercase font-bold">Committed Lead Time:</span>
                          <span className="text-sky-300 font-bold text-[11px]">{vTerms.leadTime}</span>
                        </div>
                        <div className="pt-0.5">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${vTerms.complianceClass}`}>{vTerms.complianceBadge}</span>
                        </div>
                      </div>

                      <div className="pt-1">
                        {isL1 ? (
                          <button 
                            onClick={() => initiatePPOAward(v.id, false)}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2 rounded-lg text-xs shadow-md transition-all flex items-center justify-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Award & Generate PPO (L1 Winner)</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => initiatePPOAward(v.id, true)}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg text-xs shadow-md transition-all flex items-center justify-center space-x-1"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
                            <span>Award (Non-L1 - Exception Note)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4-Way Line-Item Commercial Table */}
            <div className="overflow-x-auto border border-blue-200 rounded-xl shadow-sm">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-blue-50/80 font-bold border-b-2 border-blue-200 text-blue-950">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3 w-56">Item Code & Specification</th>
                    <th className="p-3 text-center align-middle w-24 font-sans whitespace-nowrap">Qty &amp; UOM</th>
                    <th className="p-3 text-right bg-blue-50/90 font-mono text-blue-950 border-l border-blue-200">
                      Best Historical Rate (₹)
                    </th>
                    <th className="p-3 text-right bg-blue-50/90 font-mono text-blue-950 border-r border-blue-200">
                      Best Historical Amount (₹)
                    </th>
                    <th className="p-3 text-right bg-purple-50/90 font-mono text-purple-950">
                      AI Benchmark Rate (₹)
                    </th>
                    <th className="p-3 text-right bg-purple-50/90 font-mono text-purple-950 border-r border-purple-200">
                      AI Benchmark Amount (₹)
                    </th>
                    {isMethod2 ? (
                      <>
                        <th className="p-3 text-right bg-emerald-50/80 font-mono text-emerald-950">Vendor 14 Rate Card Rate (₹)</th>
                        <th className="p-3 text-right bg-emerald-50/80 font-mono text-emerald-950 border-r border-emerald-200">Vendor 14 Amount (₹)</th>
                        <th className="p-3 text-right bg-slate-50 font-mono text-slate-800">Vendor 15 Rate Card Rate (₹)</th>
                        <th className="p-3 text-right bg-slate-50 font-mono text-slate-800 border-r border-slate-200">Vendor 15 Amount (₹)</th>
                      </>
                    ) : (
                      participatingVendors.map((v) => {
                        const isL1 = v.id === l1VendorId;
                        const rankNum = sortedVendorIds.indexOf(v.id) + 1;
                        return (
                          <React.Fragment key={v.id}>
                            <th className={`p-3 text-right ${isL1 ? 'bg-emerald-50/80 text-emerald-950' : 'bg-slate-50 text-slate-800'} font-mono`}>
                              {v.name} Rate (₹)
                              <span className={`block text-[9px] ${isL1 ? 'text-emerald-700 font-bold' : 'text-slate-400'} font-sans font-normal`}>
                                {isL1 ? '★ Overall L1' : `Rank L${rankNum}`}
                              </span>
                            </th>
                            <th className={`p-3 text-right ${isL1 ? 'bg-emerald-50/80 text-emerald-950 border-r border-emerald-200' : 'bg-slate-50 text-slate-800 border-r border-slate-200'} font-mono`}>
                              {v.name} Amount (₹)
                              <span className={`block text-[9px] ${isL1 ? 'text-emerald-700 font-bold' : 'text-slate-400'} font-sans font-normal`}>
                                {v.id}
                              </span>
                            </th>
                          </React.Fragment>
                        );
                      })
                    )}
                    <th className="p-3 text-center min-w-[140px] bg-slate-100 text-slate-800">Comparison (L1 / L2 / L3)</th>
                    <th className="p-3 text-center min-w-[140px] bg-purple-50 text-purple-950 border-l border-purple-200">MLEO Analysis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100 font-mono">
                  {currentPR.items.map((it, idx) => {
                    const histRate = it.bestHistoricalPrice;
                    const histAmt = it.qty * histRate;
                    const benchAmt = it.qty * it.benchmark;

                    if (isMethod2) {
                      const rc14 = getItemRateCard(it, 'VND-014');
                      const rc15 = getItemRateCard(it, 'VND-015');
                      const amt14 = it.qty * rc14;
                      const amt15 = it.qty * rc15;
                      const isL1Package14 = rc14 <= rc15;

                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 text-slate-400 font-mono text-center">{idx + 1}</td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block font-sans">{it.desc}</span>
                            <span className="text-[10px] text-sky-800">{it.code}</span>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-800">{it.qty} {it.uom}</td>
                          <td className="p-3 text-right bg-blue-50/40 border-l border-blue-100 font-bold text-blue-950">
                            <div>₹ {histRate.toLocaleString()}</div>
                            <div className="text-[9px] text-slate-400 font-normal font-sans">{it.prevPo}</div>
                          </td>
                          <td className="p-3 text-right bg-blue-50/40 border-r border-blue-100 font-bold text-blue-900">
                            ₹ {Math.round(histAmt).toLocaleString()}
                          </td>
                          <td className="p-3 text-right bg-purple-50/40 font-bold text-purple-950">
                            ₹ {it.benchmark.toLocaleString()}
                          </td>
                          <td className="p-3 text-right bg-purple-50/40 border-r border-purple-100 font-bold text-purple-900">
                            ₹ {Math.round(benchAmt).toLocaleString()}
                          </td>
                          <td className={`p-3 text-right ${isL1Package14 ? 'bg-emerald-50/80 text-emerald-950 font-black' : 'bg-slate-50/50 text-slate-800 font-bold'}`}>
                            <div>₹ {rc14.toLocaleString()}</div>
                            {isL1Package14 && <span className="block text-[9px] font-bold text-emerald-800">★ L1 Rate</span>}
                          </td>
                          <td className={`p-3 text-right border-r border-slate-200 ${isL1Package14 ? 'bg-emerald-50/80 text-emerald-950 font-black' : 'bg-slate-50/50 text-slate-800 font-bold'}`}>
                            ₹ {amt14.toLocaleString()}
                          </td>
                          <td className={`p-3 text-right ${!isL1Package14 ? 'bg-emerald-50/80 text-emerald-950 font-black' : 'bg-slate-50/50 text-slate-800 font-bold'}`}>
                            <div>₹ {rc15.toLocaleString()}</div>
                            {!isL1Package14 && <span className="block text-[9px] font-bold text-emerald-800">★ L1 Rate</span>}
                          </td>
                          <td className={`p-3 text-right border-r border-slate-200 ${!isL1Package14 ? 'bg-emerald-50/80 text-emerald-950 font-black' : 'bg-slate-50/50 text-slate-800 font-bold'}`}>
                            ₹ {amt15.toLocaleString()}
                          </td>
                          <td className="p-3 text-center">
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${isL1Package14 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-sky-100 text-sky-900 border border-sky-300'} font-mono`}>
                              {isL1Package14 ? '★ L1: Vendor 14' : '★ L1: Vendor 15'}
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                              {isL1Package14 ? `L2: Vendor 15 (+₹${(rc15 - rc14).toLocaleString()})` : `L2: Vendor 14 (+₹${(rc14 - rc15).toLocaleString()})`}
                            </div>
                          </td>
                          <td className="p-3 text-center border-l border-purple-200 bg-purple-50/30">
                            <button 
                              onClick={() => openMLEOModal(it)} 
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-[11px] shadow-md flex items-center justify-center space-x-1.5 transition-all mx-auto group"
                              title="Click to view itemized parametric M, L, E, O breakdown in popup window"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-purple-200 group-hover:scale-110 transition-transform" />
                              <span>MLEO BREAKDOWN</span>
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    // Methods 1, 3, 4: Quoted rates & amounts per participating vendor in different columns
                    const vendorLineRates = participatingVendors.map(v => {
                      const q = getItemVendorQuote(it, v.id);
                      const effectiveRate = q.revisedRate ?? q.initialRate;
                      return {
                        vendorId: v.id,
                        vendorName: v.name,
                        initialRate: q.initialRate,
                        revisedRate: q.revisedRate,
                        effectiveRate,
                        amount: it.qty * effectiveRate,
                      };
                    });

                    // Sort this line item's vendor rates to determine line L1, L2, L3
                    const sortedLineRates = [...vendorLineRates].sort((a, b) => a.effectiveRate - b.effectiveRate);
                    const lineL1 = sortedLineRates[0];
                    const lineL2 = sortedLineRates[1];
                    const l1DiffVsAI = (((lineL1.effectiveRate - it.benchmark) / it.benchmark) * 100).toFixed(1);

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-slate-400 font-mono text-center">{idx + 1}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block font-sans">{it.desc}</span>
                          <span className="text-[10px] text-sky-800">{it.code}</span>
                        </td>
                        <td className="p-3 text-center align-middle font-bold text-slate-800">{it.qty} {it.uom}</td>
                        <td className="p-3 text-right bg-blue-50/40 border-l border-blue-100 font-bold text-blue-950">
                          <div>₹ {histRate.toLocaleString()}</div>
                          <div className="text-[9px] text-slate-400 font-normal font-sans">{it.prevPo}</div>
                        </td>
                        <td className="p-3 text-right bg-blue-50/40 border-r border-blue-100 font-bold text-blue-900">
                          ₹ {Math.round(histAmt).toLocaleString()}
                        </td>
                        <td className="p-3 text-right bg-purple-50/40 font-bold text-purple-950">
                          ₹ {it.benchmark.toLocaleString()}
                        </td>
                        <td className="p-3 text-right bg-purple-50/40 border-r border-purple-100 font-bold text-purple-900">
                          ₹ {Math.round(benchAmt).toLocaleString()}
                        </td>

                        {participatingVendors.map((v) => {
                          const vData = vendorLineRates.find(item => item.vendorId === v.id) ?? {
                            initialRate: 0,
                            revisedRate: null,
                            amount: 0,
                            effectiveRate: 0,
                          };
                          const isItemL1 = v.id === lineL1.vendorId;
                          const isRevised = vData.revisedRate !== null && vData.revisedRate !== undefined;

                          return (
                            <React.Fragment key={v.id}>
                              <td className={`p-3 text-right font-mono ${isItemL1 ? 'bg-emerald-50/70 font-black text-emerald-950' : 'text-slate-800 font-bold'}`}>
                                {isRevised ? (
                                  <div>
                                    <div className="line-through text-[10px] text-slate-400">₹ {vData.initialRate.toLocaleString()} <span className="text-[8px] font-sans font-normal">(Q1)</span></div>
                                    <div className="text-xs text-emerald-700 font-black">₹ {vData.revisedRate?.toLocaleString()} <span className="text-[8px] font-sans font-bold text-emerald-800">(Q2 BAFO)</span></div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-900">₹ {vData.initialRate.toLocaleString()} <span className="text-[8px] font-sans text-slate-400 font-normal">(Q1)</span></div>
                                )}
                                {isItemL1 && <span className="inline-block px-1 py-0.2 rounded text-[8px] font-black bg-emerald-200 text-emerald-900">★ L1 Rate</span>}
                              </td>
                              <td className={`p-3 text-right font-mono border-r border-slate-200 ${isItemL1 ? 'bg-emerald-50/70 font-black text-emerald-950' : 'text-slate-800 font-bold'}`}>
                                <div className={`text-xs ${isItemL1 ? 'text-emerald-950 font-black' : 'text-slate-900 font-bold'}`}>
                                  ₹ {Math.round(vData.amount).toLocaleString()}
                                </div>
                                {isRevised &&
                                  vData.revisedRate !== null &&
                                  vData.revisedRate !== undefined && (
                                  <span className="text-[9px] text-emerald-600">
                                    (-{(((vData.initialRate - vData.revisedRate) /
                                      vData.initialRate) * 100).toFixed(1)}%)
                                  </span>
                                )}
                              </td>
                            </React.Fragment>
                          );
                        })}

                        <td className="p-3 text-center">
                          <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 inline-block font-mono border border-emerald-300">
                            ★ L1: {lineL1.vendorName}
                          </div>
                          {lineL2 && (
                            <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                              L2: {lineL2.vendorName} (+
                              {(((lineL2.effectiveRate - lineL1.effectiveRate) /
                                lineL1.effectiveRate) * 100).toFixed(1)}%)
                            </div>
                          )}
                          <div className="text-[9px] text-purple-700 font-bold mt-0.5 font-mono">+{l1DiffVsAI}% vs AI</div>
                        </td>

                        <td className="p-3 text-center border-l border-purple-200 bg-purple-50/30">
                          <button 
                            onClick={() => openMLEOModal(it)} 
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-[11px] shadow-md flex items-center justify-center space-x-1.5 transition-all mx-auto group"
                            title="Click to view itemized parametric M, L, E, O breakdown in popup window"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-purple-200 group-hover:scale-110 transition-transform" />
                            <span>MLEO BREAKDOWN</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-black border-t-2 border-slate-300 text-slate-900 font-mono">
                  {/* ROW 1: TOTAL COMMERCIAL QUOTED BID (₹) */}
                  <tr>
                    <td className="p-3 uppercase font-sans text-center font-bold text-slate-700">TOTALS:</td>
                    <td className="p-3 font-sans font-bold text-slate-900">Total Commercial Bid ({currentPR.items.length} Items)</td>
                    <td className="p-3 text-right font-mono font-bold">{currentPR.items.reduce((acc, it) => acc + it.qty, 0)} Units</td>
                    <td className="p-3 text-right bg-blue-100 text-blue-950 font-bold border-l border-blue-200">
                      ₹ {Math.round(
                        currentPR.items.reduce((acc, it) => acc + it.bestHistoricalPrice, 0)
                      ).toLocaleString()}
                    </td>
                    <td className="p-3 text-right bg-blue-100 text-blue-950 font-black border-r border-blue-200">
                      <div>₹ {Math.round(currentPR.items.reduce((acc, it) => acc + (it.qty * it.bestHistoricalPrice), 0)).toLocaleString()}</div>
                      <div className="text-[9px] text-blue-800 font-normal font-sans">Historical Base</div>
                    </td>
                    <td className="p-3 text-right bg-purple-100 text-purple-950 font-bold">
                      ₹ {Math.round(currentPR.items.reduce((acc, it) => acc + it.benchmark, 0)).toLocaleString()}
                    </td>
                    <td className="p-3 text-right bg-purple-100 text-purple-950 font-black border-r border-purple-200">
                      <div>₹ {Math.round(currentPR.items.reduce((acc, it) => acc + (it.qty * it.benchmark), 0)).toLocaleString()}</div>
                      <div className="text-[9px] text-purple-800 font-normal font-sans">AI Should-Cost Base</div>
                    </td>

                    {isMethod2 ? (
                      <>
                        {(() => {
                          const t14 = vendorTotals['VND-014']?.total ?? 0;
                          const t15 = vendorTotals['VND-015']?.total ?? 0;
                          const r14 = currentPR.items.reduce((acc, it) => acc + (it.vendorRateCards?.['VND-014'] ?? 0), 0);
                          const r15 = currentPR.items.reduce((acc, it) => acc + (it.vendorRateCards?.['VND-015'] ?? 0), 0);
                          const isL1Package14 = t14 <= t15;

                          return (
                            <>
                              {[
                                { id: 'VND-014', r: r14, t: t14, isL1: isL1Package14 },
                                { id: 'VND-015', r: r15, t: t15, isL1: !isL1Package14 },
                              ].map(v => (
                                <React.Fragment key={v.id}>
                                  <td className={`p-3 text-right ${v.isL1 ? 'bg-emerald-100 text-emerald-950 font-bold' : 'bg-slate-100 text-slate-900'}`}>
                                    ₹ {Math.round(v.r).toLocaleString()}
                                  </td>
                                  <td className={`p-3 text-right border-r ${v.isL1 ? 'bg-emerald-100 text-emerald-950 font-black' : 'bg-slate-100 text-slate-900 font-bold'}`}>
                                    <div>₹ {v.t.toLocaleString()}</div>
                                    <div className={`text-[9px] ${v.isL1 ? 'text-emerald-800 font-bold' : 'text-slate-600'} font-sans`}>
                                      Rank: {v.isL1 ? 'L1 (Lowest)' : 'L2'}
                                    </div>
                                  </td>
                                </React.Fragment>
                              ))}
                              <td className="p-3 text-center bg-slate-100 font-sans">
                                <div className="text-xs font-bold text-emerald-800">L1: {isL1Package14 ? 'Vendor 14' : 'Vendor 15'}</div>
                                <div className="text-[10px] text-slate-600 font-mono">Delta: ₹ {Math.abs(t14 - t15).toLocaleString()}</div>
                              </td>
                              <td className="p-3 text-center bg-purple-100 border-l border-purple-200">
                                <button onClick={() => openMLEOModal(currentPR.items[0])} className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold shadow-xs">
                                  Open MLEO Modal
                                </button>
                              </td>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <>
                        {participatingVendors.map((v) => {
                          const data = vendorTotals[v.id];
                          const isOverallL1 = v.id === l1VendorId;
                          const rankNum = sortedVendorIds.indexOf(v.id) + 1;
                          const diffOverL1 = data.total - l1MinTotal;
                          const diffPct = l1MinTotal > 0 ? ((diffOverL1 / l1MinTotal) * 100).toFixed(1) : '0.0';
                          const totRate = currentPR.items.reduce((acc, it) => {
                            const q = it.vendorQuotes?.[v.id] ?? {
                              initialRate: it.benchmark * 1.15,
                              revisedRate: null,
                            };
                            return acc + (q.revisedRate ?? q.initialRate);
                          }, 0);

                          return (
                            <React.Fragment key={v.id}>
                              <td className={`p-3 text-right ${isOverallL1 ? 'bg-emerald-100 text-emerald-950 font-bold' : 'bg-slate-100 text-slate-900'}`}>
                                ₹ {Math.round(totRate).toLocaleString()}
                              </td>
                              <td className={`p-3 text-right border-r ${isOverallL1 ? 'bg-emerald-100 text-emerald-950 font-black border-emerald-300' : 'bg-slate-100 text-slate-900 font-bold'} font-mono`}>
                                <div>₹ {Math.round(data.total).toLocaleString()}</div>
                                <div className={`text-[9px] ${isOverallL1 ? 'text-emerald-800 font-bold' : 'text-slate-600'} font-sans font-normal`}>
                                  {isOverallL1 ? '★ Rank: L1 (Lowest)' : `Rank: L${rankNum} (+${diffPct}%)`}
                                </div>
                              </td>
                            </React.Fragment>
                          );
                        })}
                        <td className="p-3 text-center bg-slate-100 font-sans">
                          <div className="text-xs font-bold text-emerald-800">L1: {l1VendorObj.name}</div>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                            {sortedVendorIds.map((vid, rIdx) => {
                              const vObj = participatingVendors.find(v => v.id === vid)
                                ?? getMasterVendor(vid, allAvailableVendors);
                              return `L${rIdx + 1}: ${vObj.name}`;
                            }).join(' < ')}
                          </div>
                        </td>
                        <td className="p-3 text-center bg-purple-100 border-l border-purple-200">
                          <button onClick={() => openMLEOModal(currentPR.items[0])} className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold shadow-xs">
                            Open MLEO Modal
                          </button>
                        </td>
                      </>
                    )}
                  </tr>

                  {/* ROW 2: QUOTED PAYMENT TERMS */}
                  <tr className="border-t border-slate-200 font-normal">
                    <td colSpan={3} className="p-3 bg-slate-50 text-slate-900 border-t border-slate-200 font-sans">
                      <div className="font-bold flex items-center space-x-1.5 text-xs text-slate-900">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        <span>Quoted Payment Terms:</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">Vendor Milestone & Credit Deviations</div>
                    </td>
                    <td colSpan={2} className="p-3 bg-blue-50/80 border-l border-r border-blue-200 border-t text-blue-950 font-sans text-[11px]">
                      <span className="text-[9px] uppercase font-bold text-blue-800 block">Target Baseline Terms:</span>
                      <div className="font-medium text-slate-800 leading-tight mt-0.5">10% Adv | 70% RA | 10% Handover | 10% DLP (30D Credit)</div>
                    </td>
                    <td colSpan={2} className="p-3 bg-purple-50/80 border-r border-purple-200 border-t text-purple-950 font-sans text-[11px]">
                      <span className="text-[9px] uppercase font-bold text-purple-800 block">AI Should-Cost Norm:</span>
                      <div className="font-medium text-slate-800 leading-tight mt-0.5">30 Days Net Credit post-GRN / Certification</div>
                    </td>

                    {isMethod2 ? (
                      <>
                        {(() => {
                          const v14Terms = getVendorCommercialTerms('VND-014', currentPR.id);
                          const v15Terms = getVendorCommercialTerms('VND-015', currentPR.id);
                          return (
                            <>
                              <td colSpan={2} className="p-3 border-t border-r font-sans text-xs bg-slate-50">
                                <div className="font-bold text-slate-900 text-[11px] leading-tight">{v14Terms.paymentTerms}</div>
                                <div className="mt-1"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${v14Terms.paymentBadgeClass}`}>{v14Terms.paymentBadge}</span></div>
                              </td>
                              <td colSpan={2} className="p-3 border-t border-r font-sans text-xs bg-slate-50">
                                <div className="font-bold text-slate-900 text-[11px] leading-tight">{v15Terms.paymentTerms}</div>
                                <div className="mt-1"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${v15Terms.paymentBadgeClass}`}>{v15Terms.paymentBadge}</span></div>
                              </td>
                              <td className="p-3 text-center bg-slate-50 border-t font-sans text-[10px]">
                                <span className="text-emerald-800 font-bold">Both Contracted</span>
                              </td>
                              <td className="p-3 text-center bg-purple-50/50 border-t border-l border-purple-200 font-sans text-slate-400 text-[10px]">—</td>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <>
                        {participatingVendors.map((v) => {
                          const vTerms = getVendorCommercialTerms(v.id, currentPR.id);
                          return (
                            <td key={v.id} colSpan={2} className="p-3 border-t border-r font-sans text-xs bg-slate-50">
                              <div className="font-bold text-slate-900 text-[11px] leading-tight">{vTerms.paymentTerms}</div>
                              <div className="mt-1"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${vTerms.paymentBadgeClass}`}>{vTerms.paymentBadge}</span></div>
                            </td>
                          );
                        })}
                        <td className="p-3 text-center bg-slate-50 border-t font-sans text-[10px]">
                          <div className="text-slate-800 font-bold">V1 Matches Target</div>
                          <div className="text-[9px] text-amber-700 font-medium">V2 +5% Adv / V5 Net 30D</div>
                        </td>
                        <td className="p-3 text-center bg-purple-50/50 border-t border-l border-purple-200 font-sans text-slate-400 text-[10px]">—</td>
                      </>
                    )}
                  </tr>

                  {/* ROW 3: COMMITTED DELIVERY TIMELINE */}
                  <tr className="border-t border-slate-200 font-normal">
                    <td colSpan={3} className="p-3 bg-slate-50 text-slate-900 border-t border-slate-200 font-sans">
                      <div className="font-bold flex items-center space-x-1.5 text-xs text-slate-900">
                        <Truck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Committed Delivery Timeline:</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">Lead Time & Site Handover Target</div>
                    </td>
                    <td colSpan={2} className="p-3 bg-blue-50/80 border-l border-r border-blue-200 border-t text-blue-950 font-sans text-[11px]">
                      <span className="text-[9px] uppercase font-bold text-blue-800 block">Target Delivery SLA:</span>
                      <div className="font-bold text-slate-900">12 - 15 Days (Target: {currentPR.targetDate})</div>
                    </td>
                    <td colSpan={2} className="p-3 bg-purple-50/80 border-r border-purple-200 border-t text-purple-950 font-sans text-[11px]">
                      <span className="text-[9px] uppercase font-bold text-purple-800 block">Industry SLA Benchmark:</span>
                      <div className="font-medium text-slate-800 leading-tight mt-0.5">12 - 14 Calendar Days Average</div>
                    </td>

                    {isMethod2 ? (
                      <>
                        {(() => {
                          const v14Terms = getVendorCommercialTerms('VND-014', currentPR.id);
                          const v15Terms = getVendorCommercialTerms('VND-015', currentPR.id);
                          return (
                            <>
                              <td colSpan={2} className="p-3 border-t border-r font-sans text-xs bg-slate-50">
                                <div className="font-bold text-slate-900 text-[11px]">{v14Terms.leadTime}</div>
                                <div className="text-[9px] text-slate-500 font-mono">Target: {v14Terms.deliveryDate}</div>
                                <div className="mt-0.5"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${v14Terms.deliveryBadgeClass}`}>{v14Terms.deliveryBadge}</span></div>
                              </td>
                              <td colSpan={2} className="p-3 border-t border-r font-sans text-xs bg-slate-50">
                                <div className="font-bold text-slate-900 text-[11px]">{v15Terms.leadTime}</div>
                                <div className="text-[9px] text-slate-500 font-mono">Target: {v15Terms.deliveryDate}</div>
                                <div className="mt-0.5"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${v15Terms.deliveryBadgeClass}`}>{v15Terms.deliveryBadge}</span></div>
                              </td>
                              <td className="p-3 text-center bg-slate-50 border-t font-sans text-[10px]">
                                <span className="text-sky-800 font-bold">⚡ V15 Faster by 2D</span>
                              </td>
                              <td className="p-3 text-center bg-purple-50/50 border-t border-l border-purple-200 font-sans text-slate-400 text-[10px]">—</td>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <>
                        {participatingVendors.map((v) => {
                          const vTerms = getVendorCommercialTerms(v.id, currentPR.id);
                          return (
                            <td key={v.id} colSpan={2} className="p-3 border-t border-r font-sans text-xs bg-slate-50">
                              <div className="font-bold text-slate-900 text-[11px]">{vTerms.leadTime}</div>
                              <div className="text-[9px] text-slate-500 font-mono">Target: {vTerms.deliveryDate}</div>
                              <div className="mt-0.5"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${vTerms.deliveryBadgeClass}`}>{vTerms.deliveryBadge}</span></div>
                            </td>
                          );
                        })}
                        <td className="p-3 text-center bg-slate-50 border-t font-sans text-[10px]">
                          <div className="text-emerald-800 font-bold">⚡ V2 Fastest (10-12D)</div>
                          <div className="text-[9px] text-slate-500 font-mono">V1 On Schedule / V5 +5D</div>
                        </td>
                        <td className="p-3 text-center bg-purple-50/50 border-t border-l border-purple-200 font-sans text-slate-400 text-[10px]">—</td>
                      </>
                    )}
                  </tr>

                  {/* ROW 4: COMMERCIAL TERMS COMPLIANCE & EXCEPTION ASSESSMENT */}
                  <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold">
                    <td colSpan={3} className="p-3 bg-slate-100 text-slate-900 border-t border-slate-200 font-sans">
                      <div className="font-bold flex items-center space-x-1.5 text-xs text-slate-900">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Terms Compliance Assessment:</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">Commercial Evaluation & Exception Status</div>
                    </td>
                    <td colSpan={2} className="p-3 bg-blue-50/80 border-l border-r border-blue-200 border-t text-blue-900 text-center font-sans">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-900 border border-blue-200">Target Baseline Standard</span>
                    </td>
                    <td colSpan={2} className="p-3 bg-purple-50/80 border-r border-purple-200 border-t text-purple-900 text-center font-sans">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-900 border border-purple-200">AI Cost Aligned</span>
                    </td>

                    {isMethod2 ? (
                      <>
                        {(() => {
                          const v14Terms = getVendorCommercialTerms('VND-014', currentPR.id);
                          const v15Terms = getVendorCommercialTerms('VND-015', currentPR.id);
                          return (
                            <>
                              <td colSpan={2} className="p-3 border-t border-r font-sans text-xs bg-slate-100 text-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${v14Terms.complianceClass}`}>{v14Terms.complianceBadge}</span>
                              </td>
                              <td colSpan={2} className="p-3 border-t border-r font-sans text-xs bg-slate-100 text-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${v15Terms.complianceClass}`}>{v15Terms.complianceBadge}</span>
                              </td>
                              <td className="p-3 text-center bg-slate-100 border-t font-sans text-[10px] font-bold text-emerald-800">
                                Award Recommendation: L1 Vendor 14
                              </td>
                              <td className="p-3 text-center bg-purple-100/50 border-t border-l border-purple-200 font-sans text-slate-400 text-[10px]">—</td>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <>
                        {participatingVendors.map((v) => {
                          const vTerms = getVendorCommercialTerms(v.id, currentPR.id);
                          return (
                            <td key={v.id} colSpan={2} className="p-3 border-t border-r font-sans text-xs bg-slate-100 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${vTerms.complianceClass}`}>{vTerms.complianceBadge}</span>
                              <div className="text-[9px] text-slate-500 mt-0.5 font-normal">{vTerms.complianceNote}</div>
                            </td>
                          );
                        })}
                        <td className="p-3 text-center bg-slate-100 border-t font-sans text-[10px] font-bold text-emerald-800">
                          <div>Recommended: {l1VendorObj.name}</div>
                          <div className="text-[9px] text-slate-600 font-normal">Lowest Bid + 100% Terms Compliant</div>
                        </td>
                        <td className="p-3 text-center bg-purple-100/50 border-t border-l border-purple-200 font-sans text-slate-400 text-[10px]">—</td>
                      </>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Bottom Transition Bar for Commercial Tab */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Next Sourcing Actions: Vendor Negotiations & Commercial Optimization</span>
                <p className="text-[11px] text-slate-500">Negotiate counter-offers item-by-item against AI Should-Cost benchmarks or proceed directly to PPO routing.</p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('negotiation')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center space-x-1.5 transition-all"
                >
                  <MessageSquareDiff className="w-3.5 h-3.5" />
                  <span>Open Negotiation Hub →</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ppogen')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center space-x-1.5 transition-all"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Proceed to PPO Proposal →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Vendor Negotiation Hub */}
        {activeTab === 'negotiation' && (
          <div className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-brand-900 text-white rounded-xl border border-brand-800 text-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-amber-400 font-black text-sm">Active Negotiation: {currentPR.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isBafoLocked ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-amber-500/20 text-amber-300'}`}>
                    {isBafoLocked ? 'BAFO AGREED & LOCKED ✓' : `Round ${negRound} Active`}
                  </span>
                </div>
                <p className="text-slate-300 mt-1">Multi-round line-item negotiation workbench. Update target counter rates line-by-line, dispatch offers vendor-wise, and receive 2nd Quote (Revised BAFO).</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Net Negotiated Savings</span>
                  <span className="text-base font-mono font-black text-emerald-400">₹ {negSavings.amount.toLocaleString()} ({negSavings.pct}%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowEAuctionPage(true)} 
                    className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-md text-xs flex items-center space-x-1.5 transition-all border border-purple-400/30 cursor-pointer"
                    title="Open Separate E-Auction Command & Monitoring Room"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>{UI_STRINGS.eauction.launchEAuctionButton}</span>
                  </button>
                  <button 
                    onClick={handleSimulate2ndQuote} 
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md text-xs flex items-center space-x-1.5 transition-all"
                    title="Simulate vendors responding with 2nd Quote (BAFO)"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
                    <span>Receive 2nd Quote (BAFO)</span>
                  </button>
                  {hasReceived2ndQuote && !isBafoLocked && (
                    <button 
                      onClick={handleAcceptBafo}
                      className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-md text-xs flex items-center space-x-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Lock & Accept BAFO</span>
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveTab('ppogen')} 
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center space-x-1.5 transition-all"
                    title="Proceed to PPO Proposal Generation"
                  >
                    <span>Proceed to PPO →</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Item-Wise Line Item Negotiation Studio */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Item-Wise Line Item Negotiation & MLEO Bottom-Up Breakdown</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Inspect and negotiate commercial unit rates item-by-item against AI Should-Cost targets. Click{' '}
                    <strong>MLEO Breakdown</strong> on any line to view detailed Material, Labor, Equipment,
                    and Overheads.
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[11px] font-mono bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-lg font-bold">
                    Interactive Line Item Workbench
                  </span>
                </div>
              </div>

              {/* Item-Wise Table */}
              <div className="overflow-x-auto border border-blue-200 rounded-xl shadow-sm">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-blue-50/80 font-bold border-b-2 border-blue-200 text-blue-950">
                    <tr>
                      <th className="p-3 w-12 text-center align-middle font-sans">#</th>
                      <th className="p-3 w-60 text-left align-middle font-sans">Item Code &amp; Specification</th>
                      <th className="p-3 text-center align-middle w-24 font-sans whitespace-nowrap">Qty &amp; UOM</th>
                      <th className="p-3 text-center align-middle bg-purple-50/90 text-purple-950 border-l border-r border-purple-200 min-w-[155px]">
                        <div className="font-bold text-xs font-sans whitespace-nowrap">AI Should-Cost Target (₹)</div>
                        <span className="block text-[9px] text-purple-700 font-sans font-normal mt-0.5">MLEO Breakdown</span>
                      </th>
                      {participatingVendors.map(v => (
                        <React.Fragment key={v.id}>
                          <th className="p-3 text-center align-middle bg-rose-50/70 text-rose-950 border-r border-rose-200 min-w-[150px]">
                            <div className="font-bold text-xs font-sans whitespace-nowrap">{v.name}</div>
                            <div className="text-[11px] font-bold text-rose-900 font-sans whitespace-nowrap">1st Quote (₹)</div>
                            <span className="block text-[9px] text-rose-700 font-sans font-normal mt-0.5">Initial Rate &amp; Amount</span>
                          </th>
                          <th className="p-3 text-center align-middle bg-emerald-50/70 text-emerald-950 border-r border-emerald-200 min-w-[165px]">
                            <div className="font-bold text-xs font-sans whitespace-nowrap">{v.name}</div>
                            <div className="text-[11px] font-bold text-emerald-900 font-sans whitespace-nowrap">2nd / Latest Quote (₹)</div>
                            <span className="block text-[9px] text-emerald-700 font-sans font-normal mt-0.5">Revised BAFO Rate &amp; Amount</span>
                          </th>
                        </React.Fragment>
                      ))}
                      <th className="p-3 text-center align-middle bg-sky-50/90 text-sky-950 min-w-[220px]">
                        <div className="font-bold text-xs font-sans whitespace-nowrap">Target Counter Offer (₹)</div>
                        <div className="text-[9px] text-sky-800 font-sans font-normal mt-0.5">Editable Rate &amp; Auto Amount</div>
                        <div className="mt-1.5 flex items-center justify-center space-x-1 font-sans">
                          <span className="text-[9px] text-slate-500 font-medium">Offer to:</span>
                          <select 
                            value={selectedOfferVendorId} 
                            onChange={(e) => setSelectedOfferVendorId(e.target.value)}
                            className="bg-white border border-sky-300 rounded text-[9px] px-1.5 py-0.5 font-bold text-slate-800 shadow-2xs"
                          >
                            {participatingVendors.map(v => (
                              <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                            <option value="ALL">All Vendors</option>
                          </select>
                          <button 
                            onClick={() => handleDispatchVendorWiseOffer()}
                            className="px-2 py-0.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-[9px] font-bold shadow-xs cursor-pointer"
                          >
                            Send Offer →
                          </button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100 font-mono">
                    {currentPR.items.map((it, idx) => {
                      const shouldCostAmt = it.qty * it.benchmark;
                      const selectedVendorDetail = it.vendorQuotes?.[selectedOfferVendorId === 'ALL' ? (participatingVendors[0]?.id || 'VND-001') : selectedOfferVendorId];
                      const currentCounterRate = lineCounterRates[it.code] !== undefined
                        ? lineCounterRates[it.code]
                        : (selectedVendorDetail?.buyerOffer1 ?? Math.round(it.benchmark * 1.04));
                      const currentCounterAmt = it.qty * currentCounterRate;

                      return (
                        <tr key={it.code} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 text-slate-400 font-mono text-center align-middle">{idx + 1}</td>
                          <td className="p-3 align-middle font-sans">
                            <span className="font-bold text-slate-900 block font-sans">{it.desc}</span>
                            <span className="font-mono text-sky-800 text-[10px]">{it.code}</span>
                          </td>
                          <td className="p-3 text-center align-middle font-bold text-slate-800 font-mono">{it.qty} {it.uom}</td>
                          <td className="p-3 text-center align-middle bg-purple-50/50 border-l border-r border-purple-200">
                            <div className="font-bold text-purple-950">₹ {it.benchmark.toLocaleString()} / {it.uom}</div>
                            <div className="text-[10px] text-purple-800 font-semibold">Tot: ₹ {Math.round(shouldCostAmt).toLocaleString()}</div>
                            <button 
                              onClick={() => {
                                setSelectedMLEOItem(it);
                                setIsMLEOModalOpen(true);
                              }}
                              className="mt-1 px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 rounded-md text-[10px] font-bold shadow-xs inline-flex items-center space-x-1 transition-all cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span>MLEO Breakdown</span>
                            </button>
                          </td>

                          {participatingVendors.map(v => {
                            const q = getItemVendorQuote(it, v.id);
                            const initRate = q.initialRate;
                            const initAmt = it.qty * initRate;
                            const revisedRateVal = q.revisedRate;
                            const isRevised = typeof revisedRateVal === 'number';
                            const revisedAmt = isRevised &&
                              revisedRateVal !== null &&
                              revisedRateVal !== undefined
                              ? it.qty * revisedRateVal
                              : null;

                            return (
                              <React.Fragment key={v.id}>
                                <td className="p-3 text-center align-middle bg-rose-50/30 font-mono text-slate-900 border-r border-slate-200">
                                  <div className="font-bold text-xs">₹ {initRate.toLocaleString()}</div>
                                  <div className="text-[10px] text-rose-700 font-semibold">Amt: ₹ {Math.round(initAmt).toLocaleString()}</div>
                                </td>
                                <td className="p-3 text-center align-middle bg-emerald-50/30 font-mono border-r border-slate-200">
                                  {isRevised &&
                                  revisedRateVal !== null &&
                                  revisedRateVal !== undefined &&
                                  revisedAmt !== null ? (
                                    <>
                                      <div className="font-black text-emerald-800 text-xs">₹ {revisedRateVal.toLocaleString()}</div>
                                      <div className="text-[10px] text-emerald-900 font-bold">Amt: ₹ {Math.round(revisedAmt).toLocaleString()}</div>
                                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-200 text-emerald-900 mt-0.5">
                                        (-{(((initRate - revisedRateVal) / initRate) * 100).toFixed(1)}%)
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px] font-sans">Awaiting 2nd Quote</span>
                                  )}
                                </td>
                              </React.Fragment>
                            );
                          })}

                          <td className="p-3 text-center align-middle bg-sky-50/40 font-mono border-l border-sky-200">
                            <div className="flex items-center justify-center space-x-1">
                              <span className="text-slate-400 text-xs">₹</span>
                              <input 
                                type="number" 
                                value={currentCounterRate} 
                                onChange={(e) => handleLineCounterRateChange(it.code, parseFloat(e.target.value) || 0)} 
                                className="w-24 px-2 py-1 border border-sky-300 rounded-lg font-mono font-bold text-xs text-center bg-white text-slate-900 focus:ring-2 focus:ring-sky-400 focus:outline-none shadow-inner" 
                              />
                            </div>
                            <div className="text-[10px] text-sky-800 font-bold mt-1 font-mono text-center">
                              Amt: ₹ {Math.round(currentCounterAmt).toLocaleString()}
                            </div>
                            <div className="mt-1.5 flex items-center justify-center space-x-1 font-sans">
                              <select 
                                id={`rowOfferVendorSelect_${idx}`} 
                                value={rowOfferVendors[idx] ?? participatingVendors[0].id}
                                onChange={(e) => {
                                  setRowOfferVendors({ ...rowOfferVendors, [idx]: e.target.value });
                                }}
                                className="bg-white border border-slate-300 rounded text-[9px] p-0.5 font-bold text-slate-800"
                              >
                                {participatingVendors.map(v => (
                                  <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                                <option value="ALL">All Vendors</option>
                              </select>
                              <button 
                                onClick={() => {
                                  handleDispatchVendorWiseOffer(rowOfferVendors[idx] ?? participatingVendors[0].id);
                                }} 
                                className="px-1.5 py-0.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-[9px] font-bold shadow-xs cursor-pointer" 
                                title="Send counter-offer on this item"
                              >
                                Offer →
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-100 font-black border-t-2 border-slate-300 text-slate-900 font-mono">
                    {(() => {
                      let totalQty = 0;
                      let totShouldCostRate = 0;
                      let totShouldCostAmt = 0;
                      let totCounterRateSum = 0;
                      let totCounterAmtSum = 0;

                      const vTotals1st: Record<string, { rate: number; amt: number }> = {};
                      const vTotals2nd: Record<string, { rate: number; amt: number; hasBafo: boolean }> = {};
                      participatingVendors.forEach(v => {
                        vTotals1st[v.id] = { rate: 0, amt: 0 };
                        vTotals2nd[v.id] = { rate: 0, amt: 0, hasBafo: false };
                      });

                      currentPR.items.forEach(it => {
                        totalQty += it.qty;
                        totShouldCostRate += it.benchmark;
                        totShouldCostAmt += it.qty * it.benchmark;

                        const r = lineCounterRates[it.code] ?? Math.round(it.benchmark * 1.04);
                        totCounterRateSum += r;
                        totCounterAmtSum += it.qty * r;

                        participatingVendors.forEach(v => {
                          const q = it.vendorQuotes?.[v.id] ?? {
                            initialRate: Math.round(it.benchmark * 1.15),
                            revisedRate: null,
                          };
                          vTotals1st[v.id].rate += q.initialRate;
                          vTotals1st[v.id].amt += it.qty * q.initialRate;
                          if (q.revisedRate !== null && q.revisedRate !== undefined) {
                            vTotals2nd[v.id].hasBafo = true;
                            vTotals2nd[v.id].rate += q.revisedRate;
                            vTotals2nd[v.id].amt += it.qty * q.revisedRate;
                          }
                        });
                      });

                      return (
                        <tr>
                          <td className="p-3 uppercase font-sans text-center align-middle font-bold text-slate-700">TOTALS:</td>
                          <td className="p-3 font-sans font-bold text-slate-900 align-middle">Summary Across {currentPR.items.length} Items</td>
                          <td className="p-3 text-center align-middle font-mono font-bold">{totalQty} Units</td>
                          <td className="p-3 text-center align-middle bg-purple-100 text-purple-950 font-bold border-l border-r border-purple-200">
                            <div className="text-xs">₹ {Math.round(totShouldCostRate).toLocaleString()}</div>
                            <div className="text-[10px] font-normal text-purple-800">Tot: ₹ {Math.round(totShouldCostAmt).toLocaleString()}</div>
                          </td>
                          {participatingVendors.map(v => {
                            const tot1 = vTotals1st[v.id];
                            const tot2 = vTotals2nd[v.id];
                            return (
                              <React.Fragment key={v.id}>
                                <td className="p-3 text-center align-middle bg-rose-100 text-rose-950 font-bold border-r border-rose-200">
                                  <div className="text-xs">₹ {Math.round(tot1.rate).toLocaleString()}</div>
                                  <div className="text-[10px] text-rose-800 font-semibold">Tot: ₹ {Math.round(tot1.amt).toLocaleString()}</div>
                                </td>
                                <td className="p-3 text-center align-middle bg-emerald-100 text-emerald-950 font-bold border-r border-emerald-200">
                                  {tot2?.hasBafo ? (
                                    <>
                                      <div className="text-xs">₹ {Math.round(tot2.rate).toLocaleString()}</div>
                                      <div className="text-[10px] text-emerald-800 font-semibold">Tot: ₹ {Math.round(tot2.amt).toLocaleString()}</div>
                                    </>
                                  ) : (
                                    <span className="text-slate-400 font-normal font-sans italic text-[10px]">Pending 2nd Quote</span>
                                  )}
                                </td>
                              </React.Fragment>
                            );
                          })}
                          <td className="p-3 text-center align-middle bg-sky-100 text-sky-950 font-black border-l border-sky-200">
                            <div className="text-xs">₹ {Math.round(totCounterRateSum).toLocaleString()}</div>
                            <div className="text-[10px] text-sky-800 font-bold">Tot: ₹ {Math.round(totCounterAmtSum).toLocaleString()}</div>
                          </td>
                        </tr>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: AI Cost Benchmarking & MLEO Breakdown */}
        {activeTab === 'aicost' && (
          <div className="space-y-5 pt-2">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-700" />
                <h4 className="font-black text-purple-950 text-sm">AI Cost Benchmarking Engine (MLEO Bottom-Up Decomposition)</h4>
              </div>
              <p className="text-purple-900">
                Machine learning model decomposing every BOQ line item into <strong>Material (M)</strong>,{' '}
                <strong>Labor (L)</strong>, <strong>Equipment (E)</strong>, and{' '}
                <strong>Overheads/Margin (O)</strong> with geographic cost indexing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPR.items.map((it, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{it.desc}</span>
                      <span className="text-[10px] text-sky-700 font-mono">{it.code}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 font-mono">
                      Conf: {it.mleo.conf}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Material</span>
                      <strong className="text-slate-900 font-mono">₹ {it.mleo.m}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Labor</span>
                      <strong className="text-slate-900 font-mono">₹ {it.mleo.l}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Equipment</span>
                      <strong className="text-slate-900 font-mono">₹ {it.mleo.e}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Overhead</span>
                      <strong className="text-slate-900 font-mono">₹ {it.mleo.o}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between font-mono text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-500 font-sans">AI Should-Cost Target:</span>
                    <span className="font-black text-purple-900">₹ {it.benchmark.toLocaleString()} / {it.uom}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: PPO Proposal & Routing */}

        {activeTab === 'ppogen' && (
          <div className="space-y-4 pt-2">
            {awardedPPO ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">{awardedPPO.ppoNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${awardedPPO.isNonL1 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'}`}>
                        {awardedPPO.isNonL1 ? '⚠️ Non-L1 Commercial Exception Award' : '✓ L1 Award (Lowest Bidder)'}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mt-1">{currentPR.title} • {currentPR.project}</h3>
                    <p className="text-xs text-slate-500">Awarded to: <strong className="text-slate-800">{awardedPPO.vendorName} ({awardedPPO.vendorId})</strong> • Delivery Site: <strong>{currentPR.site}</strong></p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Grand Total (Incl. 18% GST)</span>
                    <span className="text-xl font-black text-emerald-700">₹ {awardedPPO.grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Audited Non-L1 Note */}
                {awardedPPO.isNonL1 && awardedPPO.justification && (
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-xs space-y-1">
                    <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Audited Non-L1 Commercial Exception Justification Note:</span>
                    </span>
                    <p className="text-amber-900 pl-5"><strong>Category:</strong> {awardedPPO.justification.category} • <strong>Justification:</strong> &ldquo;{awardedPPO.justification.text}&rdquo;</p>
                  </div>
                )}

                <div className="overflow-x-auto border border-blue-200 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-blue-50/80 font-bold border-b-2 border-blue-200 text-blue-950">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Item Code & Specification</th>
                        <th className="p-3 text-right">Qty & UOM</th>
                        <th className="p-3 text-right font-mono">Awarded Rate (₹)</th>
                        <th className="p-3 text-right font-mono">Total Net Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100 font-mono">
                      {currentPR.items.map((it, idx) => {
                        let rate = 0;
                        if (isMethod2) {
                          rate = getItemRateCard(it, awardedPPO.vendorId);
                        } else {
                          const quote = getItemVendorQuote(it, awardedPPO.vendorId);
                          rate = quote.revisedRate ?? quote.initialRate;
                        }
                        return (
                          <tr key={idx}>
                            <td className="p-3 text-slate-400">{idx + 1}</td>
                            <td className="p-3 font-sans font-bold text-slate-900">{it.desc} <span className="font-mono text-sky-700 text-[10px] block">{it.code}</span></td>
                            <td className="p-3 text-right font-bold">{it.qty} {it.uom}</td>
                            <td className="p-3 text-right font-bold text-slate-800">₹ {Math.round(rate).toLocaleString()}</td>
                            <td className="p-3 text-right font-black text-emerald-950">₹ {Math.round(it.qty * rate).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold font-mono border-t">
                      <tr>
                        <td colSpan={4} className="p-3 text-right font-sans uppercase">Net Subtotal:</td>
                        <td className="p-3 text-right text-slate-900">₹ {awardedPPO.netTotal.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="p-3 text-right font-sans uppercase">GST (18%):</td>
                        <td className="p-3 text-right text-slate-900">₹ {awardedPPO.gst.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-emerald-50 text-emerald-950 font-black text-sm">
                        <td colSpan={4} className="p-3 text-right font-sans uppercase">Gross PPO Total:</td>
                        <td className="p-3 text-right">₹ {awardedPPO.grandTotal.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button onClick={() => setActiveTab('commercial')} className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50">
                    {UI_STRINGS.categoryManagerHub.backToCommercial}
                  </button>
                  <button
                    onClick={() => {
                      if (awardedPPO && typeof createPPO === 'function') {
                        createPPO({
                          prId: currentPR.id,
                          vendor: awardedPPO.vendorName,
                          itemDesc: `${currentPR.title} Package Scope Execution`,
                          unitRate: awardedPPO.netTotal,
                          qty: 1,
                          totalVal: awardedPPO.netTotal,
                          taxRate: 18,
                          taxAmount: awardedPPO.gst,
                          grandTotal: awardedPPO.grandTotal,
                          paymentTerms: '30 Days Net from delivery & QC signoff',
                          leadTime: '14 Calendar Days',
                        });
                      }
                      if (onRouteToPPO) {
                        onRouteToPPO();
                      }
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
                  >
                    <span>{UI_STRINGS.categoryManagerHub.routePPOToWorkflow}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No Vendor Finalized Yet for PPO Drafting</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">Please go to Sub-Tab 2 (4-Way Commercial Matrix &amp; CBA and PPO Raising) and click &ldquo;Award &amp; Generate PPO&rdquo; on your preferred vendor to initialize the PPO proposal.</p>
                <button onClick={() => setActiveTab('commercial')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow">
                  {UI_STRINGS.categoryManagerHub.openCommercialMatrix}
                </button>
              </div>
            )}
          </div>
        )}
      

      {/* Non-L1 Award Governance Modal */}
      {isNonL1ModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-amber-300 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Commercial Governance: Non-L1 Vendor Award</h3>
                  <p className="text-[11px] text-slate-500">Audited operational justification required for bypassing lowest commercial bidder.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNonL1ModalOpen(false)} 
                aria-label="Close Non-L1 Modal" 
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-600 font-sans">Package:</span>
                <span className="font-bold text-slate-900">{currentPR.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-sans">Selected Non-L1 Supplier:</span>
                <span className="font-bold text-amber-950 font-sans">{pendingVendorObj.name} ({pendingVendorObj.id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-sans">Lowest Bid (L1):</span>
                <span className="text-slate-700">₹ {l1MinTotal.toLocaleString()} ({l1VendorObj.name})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-sans">Selected Vendor Bid:</span>
                <span className="font-bold text-slate-900">₹ {pendingVendorTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-amber-200 pt-1 text-rose-700 font-bold">
                <span className="font-sans">Commercial Price Premium:</span>
                <span>+₹ {nonL1DeltaAmt.toLocaleString()} (+{nonL1DeltaPct}% over L1)</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Exception Reason Category:</label>
                <select 
                  value={nonL1ReasonCategory}
                  onChange={(e) => setNonL1ReasonCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white"
                >
                  <option>Lead Time / Immediate Delivery Urgency (Site Critical Path)</option>
                  <option>OEM Specified / Proprietary Compatibility Requirement</option>
                  <option>Past Performance & Quality Audit Score Higher</option>
                  <option>Regional Availability & Freight / Logistics Optimization</option>
                  <option>Comprehensive Turnkey / Single-Source Package Contract</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Operational Justification & Risk Mitigation Note:</label>
                <textarea 
                  rows={3}
                  value={nonL1JustificationText}
                  onChange={(e) => setNonL1JustificationText(e.target.value)}
                  placeholder="Explain why this higher bidder is awarded (e.g. Critical 4-day delivery needed for Block A raft casting; L1 cannot meet schedule)..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
              <button 
                onClick={() => setIsNonL1ModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button 
                onClick={confirmNonL1Award}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Generate Exception PPO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI SHOULD-COST MLEO DETAILS MODAL */}
      {isMLEOModalOpen && selectedMLEOItem && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-purple-300 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">AI Cost Model: Bottom-Up MLEO Breakdown</h3>
                  <p className="text-[11px] text-slate-500">Material (M), Labor (L), Equipment (E), and Overheads (O) parametric decomposition.</p>
                </div>
              </div>
              <button onClick={closeMLEOModal} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            {/* Item Header in Modal */}
            <div className="p-3.5 bg-purple-50/80 rounded-xl border border-purple-200 text-xs space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <span className="font-mono text-sky-800 text-[10px] font-bold block">{selectedMLEOItem.code}</span>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedMLEOItem.desc}</h4>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-900 border border-purple-300">
                    Confidence: {selectedMLEOItem.mleo.conf} (High Precision)
                  </span>
                  <div className="text-base font-mono font-black text-purple-950 mt-0.5">
                    ₹ {selectedMLEOItem.benchmark.toLocaleString()} / {selectedMLEOItem.uom}
                  </div>
                </div>
              </div>
            </div>

            {/* 4 MLEO Cards Grid */}
            {(() => {
              const m = selectedMLEOItem.mleo.m;
              const l = selectedMLEOItem.mleo.l;
              const e = selectedMLEOItem.mleo.e;
              const o = selectedMLEOItem.mleo.o;
              const sum = m + l + e + o;
              const mPct = ((m / sum) * 100).toFixed(1);
              const lPct = ((l / sum) * 100).toFixed(1);
              const ePct = ((e / sum) * 100).toFixed(1);
              const oPct = ((o / sum) * 100).toFixed(1);

              const quotedRate = getItemVendorQuote(selectedMLEOItem, l1VendorId).initialRate;
              const deltaRate = quotedRate - selectedMLEOItem.benchmark;
              const deltaPct = ((deltaRate / selectedMLEOItem.benchmark) * 100).toFixed(1);
              const lineSavings = deltaRate * selectedMLEOItem.qty;

              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 space-y-1">
                      <span className="text-[10px] font-bold text-blue-700 uppercase block">1. Material (M)</span>
                      <div className="text-base font-mono font-black text-blue-950">₹ {m.toLocaleString()}</div>
                      <span className="text-[11px] text-blue-800 font-bold block">{mPct}% of cost</span>
                      <p className="text-[10px] text-slate-500 leading-tight">Raw slab, 5% wastage allowance, IS grade benchmark.</p>
                    </div>

                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-1">
                      <span className="text-[10px] font-bold text-amber-700 uppercase block">2. Labor (L)</span>
                      <div className="text-base font-mono font-black text-amber-950">₹ {l.toLocaleString()}</div>
                      <span className="text-[11px] text-amber-800 font-bold block">{lPct}% of cost</span>
                      <p className="text-[10px] text-slate-500 leading-tight">Skilled mason & helper daily wage index (Zone A).</p>
                    </div>

                    <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200 space-y-1">
                      <span className="text-[10px] font-bold text-teal-700 uppercase block">3. Equipment (E)</span>
                      <div className="text-base font-mono font-black text-teal-950">₹ {e.toLocaleString()}</div>
                      <span className="text-[11px] text-teal-800 font-bold block">{ePct}% of cost</span>
                      <p className="text-[10px] text-slate-500 leading-tight">CNC bridge saw, edge bullnosing machine & power.</p>
                    </div>

                    <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 space-y-1">
                      <span className="text-[10px] font-bold text-purple-700 uppercase block">4. Overheads (O)</span>
                      <div className="text-base font-mono font-black text-purple-950">₹ {o.toLocaleString()}</div>
                      <span className="text-[11px] text-purple-800 font-bold block">{oPct}% of cost</span>
                      <p className="text-[10px] text-slate-500 leading-tight">Site logistics, freight, SG&A and 6% contractor profit.</p>
                    </div>
                  </div>

                  {/* Proportional Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600">
                      <span>MLEO Cost Distribution Structure:</span>
                      <span className="font-mono">100% Parameterized</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                      <div style={{ width: `${mPct}%` }} className="bg-blue-500 h-full" title={`Material: ${mPct}%`} />
                      <div style={{ width: `${lPct}%` }} className="bg-amber-500 h-full" title={`Labor: ${lPct}%`} />
                      <div style={{ width: `${ePct}%` }} className="bg-teal-500 h-full" title={`Equipment: ${ePct}%`} />
                      <div style={{ width: `${oPct}%` }} className="bg-purple-500 h-full" title={`Overheads: ${oPct}%`} />
                    </div>
                  </div>

                  {/* Variance vs Quoted Rate Analysis */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <span className="text-slate-500 block">Vendor Initial Quoted Rate vs AI Should-Cost:</span>
                      <div className="flex items-center space-x-2 mt-0.5 font-mono">
                        <span className="line-through text-slate-400">₹ {quotedRate.toLocaleString()} / {selectedMLEOItem.uom}</span>
                        <span className="text-purple-700 font-bold">→ ₹ {selectedMLEOItem.benchmark.toLocaleString()} / {selectedMLEOItem.uom}</span>
                        <span className="text-rose-600 font-bold text-[11px]">(+₹ {deltaRate.toLocaleString()} / +{deltaPct}% Premium)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Identified Line Savings Opportunity</span>
                      <span className="text-sm font-mono font-black text-emerald-600">₹ {Math.round(lineSavings).toLocaleString()}</span>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button onClick={closeMLEOModal} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">
                Close
              </button>
              <button onClick={applyLineShouldCostToNegotiation} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center space-x-1.5">
                <Check className="w-4 h-4" />
                <span>Apply Target to Counter-Offer Console →</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Rate Card Delta Items Pricing & Approval Modal */}
      {isDeltaModalOpen && selectedDeltaVendorId && (() => {
        const vendor = getMasterVendor(selectedDeltaVendorId, allAvailableVendors);
        const coverage = checkCoverage(currentPR.items, selectedDeltaVendorId);
        const coveredTotal = coverage.coveredItems.reduce((acc, it) => acc + it.totalVal, 0);
        const deltaTotal = coverage.deltaItems.reduce(
          (acc, it) => acc + it.qty * (deltaPrices[it.code] ?? it.benchmark ?? 1500),
          0
        );
        const grandTotal = Math.round((coveredTotal + deltaTotal) * 1.18);

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Rate Card Delta Scope Review
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{selectedDeltaVendorId}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {vendor.name} — Quote Approval for New Items
                  </h3>
                </div>
                <button onClick={() => setIsDeltaModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Covered Items Summary Banner */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-900 block">
                  ✓ {coverage.coveredItemsCount} Pre-Agreed Rate Card Line Items
                </span>
                <span className="text-emerald-700">
                  Total Rate Card Scope Value: ₹{coveredTotal.toLocaleString('en-IN')} (Locked at pre-agreed agreement rates)
                </span>
              </div>

              {/* Delta Items Inputs */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  New / Delta BOQ Scope Items ({coverage.deltaItemsCount})
                </h4>
                <div className="space-y-2">
                  {coverage.deltaItems.map((item) => (
                    <div key={item.code} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="max-w-md">
                        <span className="font-mono font-bold text-slate-800">{item.code}</span>
                        <p className="text-slate-600 mt-0.5">{item.desc}</p>
                        <span className="text-slate-400 text-[11px]">
                          Qty: {item.qty} {item.uom} • Benchmark: ₹{(item.benchmark ?? 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-slate-500 font-medium">Vendor Rate:</span>
                        <div className="relative w-28">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                          <input
                            type="number"
                            value={deltaPrices[item.code] ?? item.benchmark ?? 1500}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setDeltaPrices(prev => ({ ...prev, [item.code]: val }));
                            }}
                            className="w-full pl-5 pr-2 py-1 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-brand-500 text-right"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add to Rate Card Checkbox */}
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <input
                  type="checkbox"
                  id="addDeltaToRCCheckbox"
                  checked={addDeltaToRC}
                  onChange={(e) => setAddDeltaToRC(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="addDeltaToRCCheckbox" className="text-xs font-semibold text-emerald-900 cursor-pointer">
                  {UI_STRINGS.rateCards.addToRateCardCheckbox}
                </label>
              </div>

              {/* Grand Total & Submission */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Total Fast-Track PPO (inc. GST):</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDeltaModalOpen(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitDeltaPPO}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept Prices & Generate PPO
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
