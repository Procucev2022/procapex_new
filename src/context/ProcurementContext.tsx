'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  UserRole,
  TenantKey,
  PurchaseRequest,
  VendorQuote,
  NegotiationEvent,
  PPOItem,
  PurchaseOrder,
  AuditLog,
  ProcurementContextType,
  PricingTierId,
  VendorRFQItem,
} from '@/types';
import {
  TENANTS,
  INITIAL_PRS,
  INITIAL_QUOTES,
  INITIAL_NEGO,
  INITIAL_PPOS,
  INITIAL_POS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CIRCULATED_RFQS,
  PURCHASE_REQUEST_FORM_SCHEMA,
  NEGOTIATION_ROUND_FORM_SCHEMA,
  PPO_CREATE_FORM_SCHEMA,
  PRICING_TIERS,
  TENANT_TIER_UPDATE_SCHEMA,
} from '@/constants';
import { logger } from '../lib/logger';
import { validateSchema } from '../lib/validator';
import { useBudgetManager } from './useBudgetManager';
import { useVendorManager } from './useVendorManager';
import { useRateCardManager } from './useRateCardManager';
import { useEAuctionManager } from './useEAuctionManager';

export { TENANTS } from '@/constants';

export const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export function ProcurementProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [activeTenantKey, setActiveTenantKey] = useState<TenantKey>('TNT_LNT');
  const [activeRole, setActiveRole] = useState<UserRole>('PROJECT_TEAM');
  const [prs, setPrs] = useState<PurchaseRequest[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage?.getItem('procapex_prs_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((p: PurchaseRequest) => ({
              ...p,
              nominatedVendors: p.id.startsWith('PR-2026-000') && parseInt(p.id.split('-')[2] || '99', 10) <= 5
                ? []
                : (Array.isArray(p.nominatedVendors) ? p.nominatedVendors : []),
            }));
          }
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_PRS;
  });

  const [quotes, setQuotes] = useState<Record<string, VendorQuote[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage?.getItem('procapex_quotes_v1');
        if (stored) return { ...INITIAL_QUOTES, ...JSON.parse(stored) };
      } catch {
        // ignore
      }
    }
    return INITIAL_QUOTES;
  });

  const [negotiations, setNegotiations] = useState<Record<string, NegotiationEvent[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage?.getItem('procapex_negotiations_v1');
        if (stored) return { ...INITIAL_NEGO, ...JSON.parse(stored) };
      } catch {
        // ignore
      }
    }
    return INITIAL_NEGO;
  });

  const [ppos, setPpos] = useState<PPOItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage?.getItem('procapex_ppos_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_PPOS;
  });

  const [pos, setPos] = useState<PurchaseOrder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage?.getItem('procapex_pos_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_POS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage?.getItem('procapex_audit_logs_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [circulatedRFQs, setCirculatedRFQs] = useState<Record<string, VendorRFQItem>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage?.getItem('procapex_circulated_rfqs_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          const sanitized: Record<string, VendorRFQItem> = {};
          Object.entries(parsed).forEach(([key, val]) => {
            const rfqVal = val as VendorRFQItem;
            sanitized[key] = {
              ...rfqVal,
              invitedVendors: key.startsWith('PR-2026-000') && parseInt(key.split('-')[2] || '99', 10) <= 5
                ? []
                : (Array.isArray(rfqVal.invitedVendors) ? rfqVal.invitedVendors : []),
            };
          });
          return { ...INITIAL_CIRCULATED_RFQS, ...sanitized };
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_CIRCULATED_RFQS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem('procapex_prs_v1', JSON.stringify(prs));
      } catch {
        // ignore
      }
    }
  }, [prs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem('procapex_audit_logs_v1', JSON.stringify(auditLogs));
      } catch {
        // ignore
      }
    }
  }, [auditLogs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem('procapex_quotes_v1', JSON.stringify(quotes));
      } catch {
        // ignore
      }
    }
  }, [quotes]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem('procapex_negotiations_v1', JSON.stringify(negotiations));
      } catch {
        // ignore
      }
    }
  }, [negotiations]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem('procapex_ppos_v1', JSON.stringify(ppos));
      } catch {
        // ignore
      }
    }
  }, [ppos]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem('procapex_pos_v1', JSON.stringify(pos));
      } catch {
        // ignore
      }
    }
  }, [pos]);

  // Project Budget Planning (Finance Manager)
  const budgetManager = useBudgetManager(setAuditLogs);

  // PPO 3-Tier Multi-Role Approval State
  const [tier1Approved, setTier1Approved] = useState<boolean>(false);
  const [tier2Approved, setTier2Approved] = useState<boolean>(false);
  const [tier3Approved, setTier3Approved] = useState<boolean>(false);
  const [poReleased, setPoReleased] = useState<boolean>(false);

  // Multi-Tenant Pricing & Subscription Tier State
  const [tenantTiers, setTenantTiers] = useState<Record<TenantKey, PricingTierId>>({
    TNT_LNT: TENANTS.TNT_LNT.tier,
    TNT_TATA: TENANTS.TNT_TATA.tier,
    TNT_GODREJ: TENANTS.TNT_GODREJ.tier,
    TNT_SHAPOORJI: TENANTS.TNT_SHAPOORJI.tier,
  });

  const activeTenantTier = tenantTiers[activeTenantKey] ?? 'MODULE_1';

  const activeTenant = {
    ...TENANTS[activeTenantKey],
    tier: activeTenantTier,
  };

  const vendorManager = useVendorManager(activeTenantKey, activeTenant.name, setAuditLogs);
  const rateCardManager = useRateCardManager(budgetManager.projectCategories);
  const eauctionManager = useEAuctionManager();

  const currentTenants: Record<TenantKey, typeof TENANTS[TenantKey]> = (
    Object.keys(TENANTS) as TenantKey[]
  ).reduce((acc, k) => {
    acc[k] = {
      ...TENANTS[k],
      tier: tenantTiers[k] ?? TENANTS[k].tier,
    };
    return acc;
  }, {} as Record<TenantKey, typeof TENANTS[TenantKey]>);

  const isModuleAllowed = (moduleId: string): boolean => {
    const tierConfig = PRICING_TIERS[activeTenantTier];
    if (!tierConfig) return false;
    return tierConfig.allowedModules.includes(moduleId);
  };

  const isRoleAllowed = (role: UserRole): boolean => {
    const tierConfig = PRICING_TIERS[activeTenantTier];
    if (!tierConfig) return false;
    return tierConfig.allowedRoles.includes(role);
  };

  const changeTenantTier = (tenantKey: TenantKey, newTier: PricingTierId): void => {
    const validation = validateSchema({ tenantKey, newTier }, TENANT_TIER_UPDATE_SCHEMA);
    if (!validation.isValid) {
      logger.warn('context/procurement', 'Rejected invalid tenant tier update', {
        errors: validation.errors,
        tenantKey,
        newTier,
      });
      return;
    }

    const prevTier = tenantTiers[tenantKey];
    logger.info('context/procurement', 'Updated tenant subscription tier', {
      tenantKey,
      prevTier,
      newTier,
      price: PRICING_TIERS[newTier]?.priceFormatted,
    });

    setTenantTiers(prev => ({
      ...prev,
      [tenantKey]: newTier,
    }));

    setAuditLogs(prev => [{
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'System Admin (Billing & Subscription)',
      action: `Tenant Subscription Updated: ${tenantKey}`,
      detail: `Upgraded ${TENANTS[tenantKey].name} to ${PRICING_TIERS[newTier].name} (${PRICING_TIERS[newTier].priceFormatted}${PRICING_TIERS[newTier].billingPeriod})`,
    }, ...prev]);
  };

  const changeTenant = (key: TenantKey): void => {
    logger.info('context/procurement', 'Switching active procurement tenant', {
      previousTenant: activeTenantKey,
      newTenant: key,
    });
    setActiveTenantKey(key);
    const targetTier = tenantTiers[key] ?? TENANTS[key].tier;
    const tierConfig = PRICING_TIERS[targetTier];
    if (tierConfig && !tierConfig.allowedRoles.includes(activeRole)) {
      const fallbackRole: UserRole = tierConfig.allowedRoles.includes('FINANCE_HEAD')
        ? 'FINANCE_HEAD'
        : (tierConfig.allowedRoles[0] ?? 'VENDOR');
      logger.info('context/procurement', 'Role adjusted for new tenant subscription tier', {
        previousRole: activeRole,
        fallbackRole,
        tier: targetTier,
      });
      setActiveRole(fallbackRole);
    }
  };

  const approveTier1 = (): void => {
    logger.info('context/procurement', 'Approved Tier 1 sign-off for PPO-2026-0015', {
      user: 'Rajesh Singhania (Category Manager 2)',
    });
    setTier1Approved(true);
    setAuditLogs(prev => [{
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'Rajesh Singhania (Category Manager 2)',
      action: 'PPO Tier 1 Signed-off',
      detail: 'Approved commercial savings & compliance for PPO-2026-0015.',
    }, ...prev]);
  };

  const approveTier2 = (): void => {
    logger.info('context/procurement', 'Approved Tier 2 site budget clearance for PPO-2026-0015', {
      user: 'Anil Kulkarni (Project Head)',
    });
    setTier2Approved(true);
    setPoReleased(true);
    setPpos(prev => prev.map(p => p.id === 'PPO-2026-0015' ? { ...p, status: 'APPROVED_PO_ISSUED' } : p));
    setAuditLogs(prev => [{
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'Anil Kulkarni (Project Head)',
      action: 'PPO Tier 2 Signed-off & Order Issued',
      detail: 'Site budget clearance given for PPO-2026-0015. Official order issued.',
    }, ...prev]);
  };

  const approveTier3AndReleasePO = (): void => {
    logger.info('context/procurement', 'PPO Tier 3 Approved & Purchase Order Released', {
      user: 'Sunil Deshmukh (Finance Head)',
      ppoId: 'PPO-2026-0015',
      poId: 'PO-2026-0089',
    });
    setTier3Approved(true);
    setPoReleased(true);
    setPpos(prev => prev.map(p => p.id === 'PPO-2026-0015' ? { ...p, status: 'APPROVED_PO_ISSUED' } : p));
    setAuditLogs(prev => [{
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'Sunil Deshmukh (Finance Head)',
      action: 'PPO Tier 3 Signed & PO Released',
      detail: 'Official PO-2026-0089 released to DesignCraft Millworks.',
    }, ...prev]);
  };

  const resetTiers = (): void => {
    logger.debug('context/procurement', 'Reset approval tiers state');
    setTier1Approved(false);
    setTier2Approved(false);
    setTier3Approved(false);
    setPoReleased(false);
  };

  const createPR = (
    prData: Omit<PurchaseRequest, 'id' | 'status' | 'buyer'> & { id?: string }
  ): PurchaseRequest | null => {
    const validation = validateSchema(prData, PURCHASE_REQUEST_FORM_SCHEMA);
    if (!validation.isValid) {
      logger.warn('context/procurement', 'Purchase request input validation failed, rejecting submission', {
        errors: validation.errors,
      });
      return null;
    }

    let targetId = prData.id;
    if (!targetId) {
      const maxNum = prs.reduce((max, p) => {
        const match = p.id.match(/PR-\d{4}-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      const nextNum = Math.max(maxNum + 1, prs.length + 1);
      targetId = `PR-2026-${String(nextNum).padStart(4, '0')}`;
    }
    const newPR: PurchaseRequest = {
      ...prData,
      id: targetId,
      status: 'SUBMITTED',
      buyer: 'Unassigned',
      items: prData.items?.map((it, idx) => ({
        ...it,
        rateCard: it.rateCard || it.benchmark || 1500,
        benchmark: it.benchmark || it.rateCard || 1450,
        std: it.std || 1480,
        code: it.code || `ITEM-${idx + 1}`,
        desc: it.desc || 'Scope Item',
        uom: it.uom || 'Nos',
        qty: it.qty || 1,
      })) || [],
    };
    logger.info('context/procurement', 'Purchase Request created and submitted', {
      prId: newPR.id,
      title: newPR.title,
      category: newPR.category,
      costCentre: newPR.costCentre,
      itemsCount: newPR.items.length,
    });
    setPrs(prev => {
      const exists = prev.some(p => p.id === targetId);
      if (exists) {
        return prev.map(p => (p.id === targetId ? { ...p, ...newPR, status: 'SUBMITTED' } : p));
      }
      return [newPR, ...prev];
    });
    setAuditLogs(prev => [{
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: `${activeRole} (User)`,
      action: 'PR Submitted',
      detail: `Created ${newPR.id} - ${newPR.title}`,
    }, ...prev]);
    return newPR;
  };

  const updatePRStatus = (id: string, status: PurchaseRequest['status'], comments?: string): void => {
    logger.info('context/procurement', 'Updated PR status', {
      prId: id,
      newStatus: status,
      role: activeRole,
      comments,
    });
    setPrs(prev => prev.map(p => p.id === id ? {
      ...p,
      status,
      buyer: status === 'ACCEPTED' ? 'Vikram Mehta (Category Mgr)' : p.buyer,
    } : p));
    setAuditLogs(prev => [{
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: `${activeRole} (User)`,
      action: `PR Status Changed to ${status}`,
      detail: `PR ${id} updated to ${status}. Notes: ${comments || 'None'}`,
    }, ...prev]);
  };

  const approvePRByProjectHead = (id: string): void => {
    logger.info('context/procurement', 'PR approved by Project Head', { prId: id });
    updatePRStatus(id, 'APPROVED_BY_PROJECT_HEAD', 'Project Head approved. Routed to Category Manager.');
  };

  const updateBOQItems = (prId: string, items: PurchaseRequest['items']): void => {
    if (!Array.isArray(items) || items.length === 0) {
      logger.warn('context/procurement', 'Invalid BOQ line items update: items must be a non-empty array', { prId });
      return;
    }
    logger.info('context/procurement', 'Updated BOQ line items for PR', {
      prId,
      itemsCount: items.length,
    });
    setPrs(prev => prev.map(p => p.id === prId ? { ...p, items } : p));
  };

  const addNegotiationRound = (prId: string, rate: number, remarks: string, actionType: string): void => {
    const validation = validateSchema({ rate, remarks, actionType }, NEGOTIATION_ROUND_FORM_SCHEMA);
    if (!validation.isValid) {
      logger.warn('context/procurement', 'Negotiation round input validation failed, rejecting submission', {
        errors: validation.errors,
      });
      return;
    }

    const roundNum = (negotiations[prId]?.length || 0) + 1;
    logger.info('context/procurement', 'Recorded negotiation round event', {
      prId,
      round: roundNum,
      rate,
      actionType,
    });
    const newEvent: NegotiationEvent = {
      round: roundNum,
      user: actionType === 'BUYER_COUNTER' ? 'Vikram Mehta (Category Mgr)' : 'Vendor Representative',
      type: actionType.replace('_', ' '),
      rate,
      remarks,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setNegotiations(prev => ({
      ...prev,
      [prId]: [...(prev[prId] || []), newEvent],
    }));
  };

  const createPPO = (ppoData: Omit<PPOItem, 'id' | 'status' | 'createdDate'>): void => {
    const validation = validateSchema(ppoData, PPO_CREATE_FORM_SCHEMA);
    if (!validation.isValid) {
      logger.warn('context/procurement', 'PPO creation input validation failed, rejecting creation', {
        errors: validation.errors,
      });
      return;
    }

    const newPPO: PPOItem = {
      ...ppoData,
      id: `PPO-2026-00${ppos.length + 11}`,
      status: 'PENDING_APPROVAL',
      createdDate: new Date().toISOString().split('T')[0],
    };
    logger.info('context/procurement', 'Created Pending Purchase Order (PPO)', {
      ppoId: newPPO.id,
      prId: newPPO.prId,
      vendor: newPPO.vendor,
      grandTotal: newPPO.grandTotal,
    });
    setPpos(prev => {
      const existingIdx = prev.findIndex(p => p.prId === ppoData.prId && p.vendor === ppoData.vendor);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...ppoData,
          status: 'PENDING_APPROVAL',
        };
        return updated;
      }
      return [newPPO, ...prev];
    });
  };

  const approvePPO = (ppoId: string): void => {
    const ppo = ppos.find(p => p.id === ppoId);
    logger.info('context/procurement', 'Approved PPO and issuing official Purchase Order', {
      ppoId,
      vendor: ppo?.vendor,
      amount: ppo?.grandTotal,
    });
    setPpos(prev => prev.map(p => p.id === ppoId ? { ...p, status: 'APPROVED' } : p));
    if (ppo) {
      const newPO: PurchaseOrder = {
        id: `PO-2026-000${pos.length + 1}`,
        ppoRef: ppo.id,
        prRef: ppo.prId,
        vendor: ppo.vendor,
        amount: ppo.grandTotal,
        issueDate: new Date().toISOString().split('T')[0],
        status: 'ISSUED',
      };
      setPos(prev => [newPO, ...prev]);
    }
  };

  const circulateRFQ = (prId: string, invitedVendors: string[], closureDate?: string): void => {
    const targetPR = prs.find((p) => p.id === prId) || INITIAL_PRS.find((p) => p.id === prId);
    const rfqId = `RFQ-2026-${prId.split('-')[2] || '0005'}`;
    const newRFQ: VendorRFQItem = {
      id: rfqId,
      prId,
      title: targetPR?.title || 'Tender Package Specification',
      projectName: targetPR?.projectName || 'Godrej Woods, Tower C',
      category: targetPR?.category || 'General Procurement',
      closureDate: closureDate || targetPR?.reqDate || '2026-09-28',
      site: targetPR?.deliveryAddress || 'Tower C Reception Lobby, Godrej Woods, Sector 43, Noida',
      invitedVendors,
      status: 'PENDING',
      itemsCount: targetPR?.items?.length || 0,
      items: targetPR?.items || [],
    };

    setCirculatedRFQs((prev) => {
      const next = { ...prev, [prId]: newRFQ, [rfqId]: newRFQ };
      if (typeof window !== 'undefined') {
        try {
          window.localStorage?.setItem('procapex_circulated_rfqs_v1', JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });

    setPrs((prev) =>
      prev.map((p) =>
        p.id === prId
          ? {
              ...p,
              nominatedVendors: Array.from(new Set([...(p.nominatedVendors || []), ...invitedVendors])),
            }
          : p
      )
    );

    logger.info('context/procurement', 'Circulated RFQ tender to vendors', {
      rfqId,
      prId,
      invitedVendors,
    });

    setAuditLogs((prev) => [{
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: `${activeRole} (Category Manager)`,
      action: 'RFQ Tender Circulated',
      detail: `Circulated ${rfqId} (${newRFQ.title}) to ${invitedVendors.length} vendors: ${invitedVendors.join(', ')}`,
    }, ...prev]);
  };

  const submitVendorQuote = (
    prId: string,
    vendorId: string,
    round: number,
    totalAmount: number,
    remarks?: string,
    lineRates?: Record<string, number>
  ): void => {
    // 1. Update line item rates on prs
    setPrs((prevPrs) => {
      const updated = prevPrs.map((pr) => {
        if (pr.id !== prId) return pr;
        const updatedItems = (pr.items || []).map((it) => {
          const currentVQ = it.vendorQuotes || {};
          const currentDetail = currentVQ[vendorId] || {
            initialRate: it.rateCard || it.benchmark || 1500,
            revisedRate: null,
            buyerOffer1: null,
            buyerOffer2: null,
            finalRate: null,
          };
          const newRate = lineRates?.[it.code];
          const updatedDetail = { ...currentDetail };
          if (round === 1) {
            updatedDetail.initialRate = newRate !== undefined ? newRate : currentDetail.initialRate;
          } else if (round === 2) {
            updatedDetail.revisedRate = newRate !== undefined ? newRate : currentDetail.revisedRate;
          } else if (round === 3) {
            updatedDetail.finalRate = newRate !== undefined ? newRate : currentDetail.finalRate;
          }
          return {
            ...it,
            vendorQuotes: {
              ...currentVQ,
              [vendorId]: updatedDetail,
            },
          };
        });
        return {
          ...pr,
          items: updatedItems,
        };
      });
      if (typeof window !== 'undefined') {
        try {
          window.localStorage?.setItem('procapex_prs_v1', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });

    addNegotiationRound(
      prId,
      totalAmount,
      remarks || `Vendor Quote submitted for Round ${round}`,
      `VENDOR_QUOTE_ROUND_${round}`
    );
    setAuditLogs((prev) => [{
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: `Vendor (${vendorId})`,
      action: `Vendor Quote Submitted (Round ${round})`,
      detail: `Submitted ₹ ${Math.round(totalAmount).toLocaleString()} for ${prId}`,
    }, ...prev]);

    logger.info('context/procurement', 'Vendor quote submitted with line rates and stored', {
      prId,
      vendorId,
      round,
      totalAmount,
    });
  };

  const submitBuyerCounterOffer = (
    prId: string,
    vendorId: string,
    round: number,
    totalAmount: number,
    remarks?: string,
    lineRates?: Record<string, number>
  ): void => {
    setPrs((prevPrs) => {
      const updated = prevPrs.map((pr) => {
        if (pr.id !== prId) return pr;
        const quoteVendors = (pr.items || []).flatMap((it) => Object.keys(it.vendorQuotes || {}));
        const uniqueQuoteVendors = Array.from(new Set(quoteVendors));
        const targetVendors = vendorId === 'ALL'
          ? (pr.nominatedVendors && pr.nominatedVendors.length > 0
              ? pr.nominatedVendors
              : (uniqueQuoteVendors.length > 0 ? uniqueQuoteVendors : ['VND-001', 'VND-002']))
          : [vendorId];

        const updatedItems = (pr.items || []).map((it) => {
          const currentVQ = { ...(it.vendorQuotes || {}) };
          targetVendors.forEach((vId) => {
            const currentDetail = currentVQ[vId] || {
              initialRate: it.rateCard || it.benchmark || 1500,
              revisedRate: null,
              buyerOffer1: null,
              buyerOffer2: null,
              finalRate: null,
            };
            const counterRate = lineRates?.[it.code] ?? Math.round((it.benchmark || 1400) * 1.04);
            currentVQ[vId] = {
              ...currentDetail,
              ...(round === 1 ? { buyerOffer1: counterRate } : { buyerOffer2: counterRate }),
            };
          });
          return {
            ...it,
            vendorQuotes: currentVQ,
          };
        });
        return {
          ...pr,
          items: updatedItems,
        };
      });
      if (typeof window !== 'undefined') {
        try {
          window.localStorage?.setItem('procapex_prs_v1', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });

    addNegotiationRound(
      prId,
      totalAmount,
      remarks || `Category Manager Counter-Offer for Round ${round}`,
      'BUYER_COUNTER'
    );

    setAuditLogs((prev) => [{
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: `${activeRole} (Category Manager)`,
      action: `Buyer Counter-Offer Dispatched (Round ${round})`,
      detail: `Dispatched ₹ ${Math.round(totalAmount).toLocaleString()} for ${prId} to ${vendorId}`,
    }, ...prev]);

    logger.info('context/procurement', 'Buyer counter-offer dispatched with line rates and stored', {
      prId,
      vendorId,
      round,
      totalAmount,
    });
  };

  const resetToSampleData = (): void => {
    logger.info('context/procurement', 'Reset procurement system data to sample state');
    setPrs(INITIAL_PRS);
    setQuotes(INITIAL_QUOTES);
    setNegotiations(INITIAL_NEGO);
    setPpos(INITIAL_PPOS);
    setPos(INITIAL_POS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCirculatedRFQs(INITIAL_CIRCULATED_RFQS);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.removeItem('procapex_prs_v1');
        window.localStorage?.removeItem('procapex_quotes_v1');
        window.localStorage?.removeItem('procapex_negotiations_v1');
        window.localStorage?.removeItem('procapex_ppos_v1');
        window.localStorage?.removeItem('procapex_pos_v1');
        window.localStorage?.removeItem('procapex_audit_logs_v1');
        window.localStorage?.removeItem('procapex_circulated_rfqs_v1');
      } catch {
        // ignore
      }
    }
    resetTiers();
    vendorManager.resetVendors();
  };

  return (
    <ProcurementContext.Provider value={{
      activeRole,
      setActiveRole,
      activeTenantKey,
      activeTenant,
      changeTenant,
      tenants: currentTenants,
      activeTenantTier,
      tenantTiers,
      changeTenantTier,
      isModuleAllowed,
      isRoleAllowed,
      prs,
      quotes,
      negotiations,
      ppos,
      pos,
      auditLogs,
      circulatedRFQs,
      circulateRFQ,
      submitVendorQuote,
      submitBuyerCounterOffer,
      // Project Budget Planning (Finance Manager)
      projectCategories: budgetManager.projectCategories,
      projectBudget: budgetManager.projectBudget,
      updateItemQuantity: budgetManager.updateItemQuantity,
      updateContingencyRate: budgetManager.updateContingencyRate,
      updateProjectSqFt: budgetManager.updateProjectSqFt,
      freezeBudgetBaseline: budgetManager.freezeBudgetBaseline,
      resetCategoryQuantities: budgetManager.resetCategoryQuantities,
      downloadCategoryBOQCSV: budgetManager.downloadCategoryBOQCSV,
      downloadProjectBudgetCSV: budgetManager.downloadProjectBudgetCSV,
      downloadCategorySummaryCSV: budgetManager.downloadCategorySummaryCSV,
      addCategory: budgetManager.addCategory,
      addSubCategory: budgetManager.addSubCategory,
      addStandardBOQItem: budgetManager.addStandardBOQItem,
      uploadBatchStandardBOQItems: budgetManager.uploadBatchStandardBOQItems,
      toggleItemHoldStatus: budgetManager.toggleItemHoldStatus,
      tier1Approved,
      tier2Approved,
      tier3Approved,
      poReleased,
      approveTier1,
      approveTier2,
      approveTier3AndReleasePO,
      resetTiers,
      createPR,
      updatePRStatus,
      approvePRByProjectHead,
      updateBOQItems,
      addNegotiationRound,
      createPPO,
      approvePPO,
      resetToSampleData,
      // Vendor Management & Evaluation (Module 2 & 3)
      managedVendors: vendorManager.managedVendors,
      addClientVendors: vendorManager.addClientVendors,
      addSingleClientVendor: vendorManager.addSingleClientVendor,
      submitVendorEvaluation: vendorManager.submitVendorEvaluation,
      submitPPORating: vendorManager.submitPPORating,
      sendEvaluationInvite: vendorManager.sendEvaluationInvite,
      updateVendorCataloguePrices: vendorManager.updateVendorCataloguePrices,
      sendVendorCatalogueIntimation: vendorManager.sendVendorCatalogueIntimation,
      updateVendorCategories: vendorManager.updateVendorCategories,
      // Rate Card Management (Module 4)
      rateCards: rateCardManager.rateCards,
      createRateCardProposal: rateCardManager.createRateCardProposal,
      sellerRespondRateCardProposal: rateCardManager.sellerRespondRateCardProposal,
      finalizeRateCard: rateCardManager.finalizeRateCard,
      addItemToRateCard: rateCardManager.addItemToRateCard,
      checkPRRateCardCoverage: rateCardManager.checkPRRateCardCoverage,
      getVendorCategoryRateCardCoverage: rateCardManager.getVendorCategoryRateCardCoverage,
      getLinePricingReferences: rateCardManager.getLinePricingReferences,
      // E-Auction Management (Module 5)
      eauctions: eauctionManager.eauctions,
      activeEAuctionId: eauctionManager.activeEAuctionId,
      setActiveEAuctionId: eauctionManager.setActiveEAuctionId,
      getEAuctionByPRId: eauctionManager.getEAuctionByPRId,
      startEAuction: eauctionManager.startEAuction,
      pauseEAuction: eauctionManager.pauseEAuction,
      resumeEAuction: eauctionManager.resumeEAuction,
      extendEAuction: eauctionManager.extendEAuction,
      concludeEAuction: eauctionManager.concludeEAuction,
      submitEAuctionBid: eauctionManager.submitEAuctionBid,
      setEAuctionProxyFloor: eauctionManager.setEAuctionProxyFloor,
      simulateNextCompetitiveBid: eauctionManager.simulateNextCompetitiveBid,
      awardEAuctionToL1: eauctionManager.awardEAuctionToL1,
    }}>
      {children}
    </ProcurementContext.Provider>
  );
}

export function useProcurement(): ProcurementContextType {
  const context = useContext(ProcurementContext);
  if (!context) throw new Error('useProcurement must be used within ProcurementProvider');
  return context;
}
