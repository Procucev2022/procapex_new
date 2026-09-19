'use client';

import { useState, useMemo, useContext, useEffect } from 'react';
import type {
  VendorQuoteItem,
  VendorItem,
  VendorQuotedTerms,
  VendorRFQItem,
  PurchaseRequest,
} from '@/types';
import {
  INITIAL_VENDOR_QUOTE_ITEMS,
  VENDOR_DATABASE,
  INITIAL_PRS,
} from '@/constants';
import { ProcurementContext } from '@/context/ProcurementContext';

export const DEFAULT_VENDOR_TERMS: VendorQuotedTerms = {
  paymentStructure: 'PRESET_1',
  creditDays: '30 Days Net',
  advPct: '10%',
  retPct: '10%',
  abg: 'YES',
  leadTime: '12 - 15 Calendar Days',
  deliveryDate: '2026-09-25',
  incoterms: 'FOR_SITE',
  warranty: '12 Months Defect Liability Period + 24 Months OEM Hardware Warranty',
  deviations: '100% Compliant with PR scope specifications. Safe unloading included.',
};

export interface UseVendorPortalReturn {
  allVendors: VendorItem[];
  activeVendor: string;
  setActiveVendor: (vendorId: string) => void;
  activePR: string;
  setActivePR: (prId: string) => void;
  activeTab: 'rfq' | 'quote' | 'ppo' | 'rate_card' | 'catalogue' | 'eauction';
  setActiveTab: (
    tab: 'rfq' | 'quote' | 'ppo' | 'rate_card' | 'catalogue' | 'eauction'
  ) => void;
  activeRound: 1 | 2 | 3 | 'all';
  setActiveRound: (round: 1 | 2 | 3 | 'all') => void;
  isAuthenticated: boolean;
  handleLoginSuccess: (vendorId: string) => void;
  handleLogout: () => void;
  vendorRFQs: VendorRFQItem[];
  currentActiveRFQ: VendorRFQItem | undefined;
  items: VendorQuoteItem[];
  acceptedRFQs: Record<string, boolean>;
  isCurrentRFQAccepted: boolean;
  handleAcceptRfq: (targetId?: string) => void;
  ppoAccepted: boolean;
  setPpoAccepted: (val: boolean) => void;
  quote1Submitted: boolean;
  setQuote1Submitted: (val: boolean) => void;
  quote2Submitted: boolean;
  setQuote2Submitted: (val: boolean) => void;
  quote3Submitted: boolean;
  setQuote3Submitted: (val: boolean) => void;
  terms: VendorQuotedTerms;
  setTerms: React.Dispatch<React.SetStateAction<VendorQuotedTerms>>;
  handleRate1Change: (idx: number, val: string) => void;
  handleRate2Change: (idx: number, val: string) => void;
  handleRate3Change: (idx: number, val: string) => void;
  activeVendorObj: VendorItem;
  submitVendorQuote?: (
    prId: string,
    vendorId: string,
    round: number,
    totalAmount: number,
    remarks?: string,
    lineRates?: Record<string, number>
  ) => void;
}

const collectCirculatedRFQs = (
  circulatedRFQs: Record<string, VendorRFQItem> | undefined,
  prs: PurchaseRequest[] | undefined,
  activeVendor: string,
  seenIds: Set<string>,
  targetList: VendorRFQItem[]
): void => {
  if (!circulatedRFQs) return;
  Object.values(circulatedRFQs).forEach((rfq) => {
    if (rfq.invitedVendors?.includes(activeVendor) && !seenIds.has(rfq.id)) {
      const livePr = prs?.find((p) => p.id === rfq.prId || p.id === rfq.id);
      const items = livePr?.items ?? rfq.items;
      targetList.push({
        ...rfq,
        items,
        itemsCount: items.length,
      });
      seenIds.add(rfq.id);
    }
  });
};

const isInteriorVendor = (vendorId: string): boolean => {
  return vendorId === 'CLT-VND-003' || vendorId === 'VND-001' || vendorId === 'VND-002';
};

const shouldVendorReceivePR = (pr: PurchaseRequest, activeVendor: string): boolean => {
  if (pr.nominatedVendors?.includes(activeVendor)) return true;
  if (!isInteriorVendor(activeVendor)) return false;
  return Boolean(pr.category?.toLowerCase().includes('interior'));
};

const transformPRToVendorRFQ = (pr: PurchaseRequest, rfqId: string, activeVendor: string): VendorRFQItem => {
  const itemsList = pr.items ?? [];
  return {
    id: rfqId,
    prId: pr.id,
    title: pr.title,
    projectName: pr.projectName ?? 'Godrej Woods, Tower C',
    category: pr.category,
    closureDate: pr.reqDate ?? '2026-09-28',
    site: pr.deliveryAddress ?? 'Tower C Reception Lobby, Godrej Woods, Sector 43, Noida',
    invitedVendors: pr.nominatedVendors ?? [activeVendor],
    status: 'PENDING',
    itemsCount: itemsList.length,
    items: itemsList,
  };
};

const collectPRRFQs = (
  prs: PurchaseRequest[] | undefined,
  activeVendor: string,
  seenIds: Set<string>,
  targetList: VendorRFQItem[]
): void => {
  if (!prs) return;
  prs.forEach((pr) => {
    const suffix = pr.id.split('-')[2] ?? '0005';
    const rfqId = `RFQ-2026-${suffix}`;
    if (seenIds.has(rfqId)) return;
    if (shouldVendorReceivePR(pr, activeVendor)) {
      targetList.push(transformPRToVendorRFQ(pr, rfqId, activeVendor));
      seenIds.add(rfqId);
    }
  });
};

const getFallbackRFQ = (activeVendor: string): VendorRFQItem | null => {
  if (!isInteriorVendor(activeVendor)) return null;
  const defaultPr = INITIAL_PRS[0];
  return {
    id: 'RFQ-2026-0005',
    prId: defaultPr.id,
    title: defaultPr.title,
    projectName: defaultPr.projectName,
    category: defaultPr.category,
    closureDate: defaultPr.reqDate ?? '2026-09-28',
    site: 'Tower C Reception Lobby, Godrej Woods, Sector 43, Noida',
    invitedVendors: [activeVendor],
    status: 'PENDING',
    itemsCount: defaultPr.items.length,
    items: defaultPr.items,
  };
};

const mapActiveVendorObj = (allVendors: VendorItem[], activeVendor: string): VendorItem => {
  const found = allVendors.find((v) => v.id === activeVendor);
  if (found) return found;
  const baseVendor = allVendors[0] ?? VENDOR_DATABASE[0];

  let resolvedName = activeVendor;
  if (activeVendor === 'VND-001') resolvedName = 'DesignCraft Millworks & Interiors Pvt Ltd';
  else if (activeVendor === 'VND-002') resolvedName = 'Apex Modular Systems Pvt Ltd';
  else if (activeVendor === 'VND-005') resolvedName = 'NorthCraft Engineering & Woodworks';
  else if (activeVendor === 'CLT-VND-003') resolvedName = 'Rao Interior works';

  return {
    ...baseVendor,
    id: activeVendor,
    name: resolvedName,
    city: 'Mumbai',
    category: 'Interior & Fitouts',
    source: activeVendor.startsWith('CLT-') ? 'CLIENT_ONBOARDED' : 'PROCAPX_PLATFORM',
  };
};

export const useVendorPortal = (initialAuthenticated?: boolean): UseVendorPortalReturn => {
  const procurementContext = useContext(ProcurementContext);
  const managedVendors = procurementContext?.managedVendors;
  const prs = procurementContext?.prs;
  const circulatedRFQs = procurementContext?.circulatedRFQs;

  const allVendors: VendorItem[] = useMemo(() => {
    return managedVendors && managedVendors.length > 0 ? managedVendors : VENDOR_DATABASE;
  }, [managedVendors]);

  const [activeVendor, setActiveVendor] = useState<string>('VND-001');
  const [activePR, setActivePR] = useState<string>('PR-2026-0005');
  const [activeTab, setActiveTab] = useState<
    'rfq' | 'quote' | 'ppo' | 'rate_card' | 'catalogue' | 'eauction'
  >('rfq');
  const [activeRound, setActiveRound] = useState<1 | 2 | 3 | 'all'>(1);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof initialAuthenticated === 'boolean') return initialAuthenticated;
    if (typeof window !== 'undefined') {
      return window.sessionStorage?.getItem('procapex_vendor_authenticated') === 'true';
    }
    return false;
  });

  const handleLoginSuccess = (vendorId: string): void => {
    setActiveVendor(vendorId);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      window.sessionStorage?.setItem('procapex_vendor_authenticated', 'true');
      window.sessionStorage?.setItem('procapex_vendor_active_id', vendorId);
    }
  };

  const handleLogout = (): void => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      window.sessionStorage?.removeItem('procapex_vendor_authenticated');
    }
  };

  const vendorRFQs: VendorRFQItem[] = useMemo(() => {
    const list: VendorRFQItem[] = [];
    const seenIds = new Set<string>();

    collectCirculatedRFQs(circulatedRFQs, prs, activeVendor, seenIds, list);
    collectPRRFQs(prs, activeVendor, seenIds, list);

    if (list.length === 0) {
      const fallback = getFallbackRFQ(activeVendor);
      if (fallback) list.push(fallback);
    }

    return list;
  }, [circulatedRFQs, prs, activeVendor]);

  const currentActiveRFQ = useMemo(() => {
    return vendorRFQs.find((r) => r.prId === activePR || r.id === activePR) ?? vendorRFQs[0];
  }, [vendorRFQs, activePR]);

  useEffect(() => {
    if (vendorRFQs.length > 0) {
      const exists = vendorRFQs.some((r) => r.prId === activePR || r.id === activePR);
      if (!exists) {
        setActivePR(vendorRFQs[0].prId || vendorRFQs[0].id);
      }
    }
  }, [vendorRFQs, activePR]);

  const [items, setItems] = useState<VendorQuoteItem[]>(INITIAL_VENDOR_QUOTE_ITEMS);
  const [acceptedRFQs, setAcceptedRFQs] = useState<Record<string, boolean>>({});
  const isCurrentRFQAccepted = Boolean(
    acceptedRFQs[activePR] ||
    (currentActiveRFQ ? acceptedRFQs[currentActiveRFQ.id] || acceptedRFQs[currentActiveRFQ.prId] : false)
  );

  const handleAcceptRfq = (targetId?: string): void => {
    const idToAccept = targetId ?? activePR;
    setAcceptedRFQs((prev) => ({
      ...prev,
      [idToAccept]: true,
      ...(currentActiveRFQ ? { [currentActiveRFQ.id]: true, [currentActiveRFQ.prId]: true } : {}),
    }));
  };

  useEffect(() => {
    if (currentActiveRFQ?.items?.length) {
      const mapped: VendorQuoteItem[] = currentActiveRFQ.items.map((it, idx) => {
        const rc = it.rateCard ?? it.benchmark ?? 1500;
        const bm = it.benchmark ?? Math.round(rc * 0.95);
        const vDetail = it.vendorQuotes?.[activeVendor];
        const defaultSample =
          INITIAL_VENDOR_QUOTE_ITEMS.find((s) => s.code === it.code) ?? INITIAL_VENDOR_QUOTE_ITEMS[idx];

        const rate1 = vDetail?.initialRate ?? defaultSample?.rate1 ?? Math.round(rc * 1.08);
        const buyerOffer1 = vDetail?.buyerOffer1 ?? defaultSample?.buyerOffer1 ?? Math.round(bm * 1.02);
        const rate2 = vDetail?.revisedRate ?? defaultSample?.rate2 ?? Math.round(rc * 1.03);
        const buyerOffer2 = vDetail?.buyerOffer2 ?? defaultSample?.buyerOffer2 ?? Math.round(bm * 0.98);
        const rate3 = vDetail?.finalRate ?? defaultSample?.rate3 ?? Math.round(bm * 1.01);

        return {
          code: it.code,
          desc: it.desc,
          uom: it.uom,
          qty: it.qty,
          targetRate: bm,
          rate1,
          buyerOffer1,
          rate2,
          buyerOffer2,
          rate3,
        };
      });
      setItems(mapped);
    }
  }, [currentActiveRFQ, activeVendor]);

  const [ppoAccepted, setPpoAccepted] = useState<boolean>(false);
  const [quote1Submitted, setQuote1Submitted] = useState<boolean>(false);
  const [quote2Submitted, setQuote2Submitted] = useState<boolean>(false);
  const [quote3Submitted, setQuote3Submitted] = useState<boolean>(false);
  const [terms, setTerms] = useState<VendorQuotedTerms>(DEFAULT_VENDOR_TERMS);

  useEffect(() => {
    const prEvents = (procurementContext?.negotiations?.[activePR] || []);
    const hasQ1 = prEvents.some((e) =>
      e.type?.includes('ROUND 1') || e.type?.includes('ROUND_1') || e.type?.includes('Original Quotation') || e.type?.includes('1st Quote')
    );

    const hasQ2 = prEvents.some((e) =>
      e.type?.includes('ROUND 2') || e.type?.includes('ROUND_2') || e.type?.includes('BAFO') || e.type?.includes('2nd Quote')
    ) || Boolean(currentActiveRFQ?.items?.some((it) => it.vendorQuotes?.[activeVendor]?.revisedRate));

    const hasQ3 = prEvents.some((e) =>
      e.type?.includes('ROUND 3') || e.type?.includes('ROUND_3') || e.type?.includes('Final')
    ) || Boolean(currentActiveRFQ?.items?.some((it) => it.vendorQuotes?.[activeVendor]?.finalRate));

    if (hasQ1) setQuote1Submitted(true);
    if (hasQ2) setQuote2Submitted(true);
    if (hasQ3) setQuote3Submitted(true);
  }, [procurementContext?.negotiations, activePR, activeVendor, currentActiveRFQ]);

  const handleRate1Change = (idx: number, val: string): void => {
    const updated = [...items];
    updated[idx].rate1 = parseFloat(val) || 0;
    setItems(updated);
  };

  const handleRate2Change = (idx: number, val: string): void => {
    const updated = [...items];
    updated[idx].rate2 = parseFloat(val) || 0;
    setItems(updated);
  };

  const handleRate3Change = (idx: number, val: string): void => {
    const updated = [...items];
    updated[idx].rate3 = parseFloat(val) || 0;
    setItems(updated);
  };

  const activeVendorObj: VendorItem = useMemo(() => {
    return mapActiveVendorObj(allVendors, activeVendor);
  }, [allVendors, activeVendor]);

  return {
    allVendors,
    activeVendor,
    setActiveVendor,
    activePR,
    setActivePR,
    activeTab,
    setActiveTab,
    activeRound,
    setActiveRound,
    isAuthenticated,
    handleLoginSuccess,
    handleLogout,
    vendorRFQs,
    currentActiveRFQ,
    items,
    acceptedRFQs,
    isCurrentRFQAccepted,
    handleAcceptRfq,
    ppoAccepted,
    setPpoAccepted,
    quote1Submitted,
    setQuote1Submitted,
    quote2Submitted,
    setQuote2Submitted,
    quote3Submitted,
    setQuote3Submitted,
    terms,
    setTerms,
    handleRate1Change,
    handleRate2Change,
    handleRate3Change,
    activeVendorObj,
    submitVendorQuote: procurementContext?.submitVendorQuote,
  };
};
