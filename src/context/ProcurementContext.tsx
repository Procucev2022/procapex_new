'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  TenantKey,
  TenantConfig,
  PurchaseRequest,
  VendorQuote,
  NegotiationEvent,
  PPOItem,
  PurchaseOrder,
  AuditLog,
  ProcurementContextType,
} from '@/types';
import {
  TENANTS,
  INITIAL_PRS,
  INITIAL_QUOTES,
  INITIAL_NEGO,
  INITIAL_PPOS,
  INITIAL_POS,
  INITIAL_AUDIT_LOGS,
} from '@/constants';
import { logger } from '../lib/logger';

export { TENANTS } from '@/constants';

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export function ProcurementProvider({ children }: { children: React.ReactNode }) {
  const [activeTenantKey, setActiveTenantKey] = useState<TenantKey>('TNT_LNT');
  const [activeRole, setActiveRole] = useState<UserRole>('PROJECT_TEAM');
  const [prs, setPrs] = useState<PurchaseRequest[]>(INITIAL_PRS);
  const [quotes, setQuotes] = useState<Record<string, VendorQuote[]>>(INITIAL_QUOTES);
  const [negotiations, setNegotiations] = useState<Record<string, NegotiationEvent[]>>(INITIAL_NEGO);
  const [ppos, setPpos] = useState<PPOItem[]>(INITIAL_PPOS);
  const [pos, setPos] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // PPO 3-Tier Multi-Role Approval State
  const [tier1Approved, setTier1Approved] = useState<boolean>(false);
  const [tier2Approved, setTier2Approved] = useState<boolean>(false);
  const [tier3Approved, setTier3Approved] = useState<boolean>(false);
  const [poReleased, setPoReleased] = useState<boolean>(false);

  const activeTenant = TENANTS[activeTenantKey];

  const changeTenant = (key: TenantKey) => {
    logger.info('context/procurement', 'Switching active procurement tenant', {
      previousTenant: activeTenantKey,
      newTenant: key,
    });
    setActiveTenantKey(key);
  };

  const approveTier1 = () => {
    logger.info('context/procurement', 'Approved Tier 1 sign-off for PPO-2026-0015', {
      user: 'Rajesh Singhania (Category Manager 2)',
    });
    setTier1Approved(true);
    setAuditLogs(prev => [{
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'Rajesh Singhania (Category Manager 2)',
      action: 'PPO Tier 1 Signed-off',
      detail: 'Approved commercial savings & compliance for PPO-2026-0015.'
    }, ...prev]);
  };

  const approveTier2 = () => {
    logger.info('context/procurement', 'Approved Tier 2 site budget clearance for PPO-2026-0015', {
      user: 'Anil Kulkarni (Project Head)',
    });
    setTier2Approved(true);
    setAuditLogs(prev => [{
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'Anil Kulkarni (Project Head)',
      action: 'PPO Tier 2 Signed-off',
      detail: 'Site budget clearance given for PPO-2026-0015.'
    }, ...prev]);
  };

  const approveTier3AndReleasePO = () => {
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
      detail: 'Official PO-2026-0089 released to DesignCraft Millworks.'
    }, ...prev]);
  };

  const resetTiers = () => {
    logger.debug('context/procurement', 'Reset approval tiers state');
    setTier1Approved(false);
    setTier2Approved(false);
    setTier3Approved(false);
    setPoReleased(false);
  };

  const createPR = (prData: Omit<PurchaseRequest, 'id' | 'status' | 'buyer'>) => {
    const newPR: PurchaseRequest = {
      ...prData,
      id: `PR-2026-000${prs.length + 1}`,
      status: 'SUBMITTED',
      buyer: 'Unassigned'
    };
    logger.info('context/procurement', 'Purchase Request created and submitted', {
      prId: newPR.id,
      title: newPR.title,
      category: newPR.category,
      costCentre: newPR.costCentre,
      itemsCount: newPR.items.length,
    });
    setPrs(prev => [newPR, ...prev]);
    setAuditLogs(prev => [{
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: `${activeRole} (User)`,
      action: 'PR Submitted',
      detail: `Created ${newPR.id} - ${newPR.title}`
    }, ...prev]);
  };

  const updatePRStatus = (id: string, status: PurchaseRequest['status'], comments?: string) => {
    logger.info('context/procurement', 'Updated PR status', {
      prId: id,
      newStatus: status,
      role: activeRole,
      comments,
    });
    setPrs(prev => prev.map(p => p.id === id ? { ...p, status, buyer: status === 'ACCEPTED' ? 'Vikram Mehta (Category Mgr)' : p.buyer } : p));
    setAuditLogs(prev => [{
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: `${activeRole} (User)`,
      action: `PR Status Changed to ${status}`,
      detail: `PR ${id} updated to ${status}. Notes: ${comments || 'None'}`
    }, ...prev]);
  };

  const approvePRByProjectHead = (id: string) => {
    logger.info('context/procurement', 'PR approved by Project Head', { prId: id });
    updatePRStatus(id, 'APPROVED_BY_PROJECT_HEAD', 'Project Head approved. Routed to Category Manager.');
  };

  const updateBOQItems = (prId: string, items: PurchaseRequest['items']) => {
    logger.info('context/procurement', 'Updated BOQ line items for PR', {
      prId,
      itemsCount: items.length,
    });
    setPrs(prev => prev.map(p => p.id === prId ? { ...p, items } : p));
  };

  const addNegotiationRound = (prId: string, rate: number, remarks: string, actionType: string) => {
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
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setNegotiations(prev => ({
      ...prev,
      [prId]: [...(prev[prId] || []), newEvent]
    }));
  };

  const createPPO = (ppoData: Omit<PPOItem, 'id' | 'status' | 'createdDate'>) => {
    const newPPO: PPOItem = {
      ...ppoData,
      id: `PPO-2026-00${ppos.length + 11}`,
      status: 'PENDING_APPROVAL',
      createdDate: new Date().toISOString().split('T')[0]
    };
    logger.info('context/procurement', 'Created Pending Purchase Order (PPO)', {
      ppoId: newPPO.id,
      prId: newPPO.prId,
      vendor: newPPO.vendor,
      grandTotal: newPPO.grandTotal,
    });
    setPpos(prev => [newPPO, ...prev]);
  };

  const approvePPO = (ppoId: string) => {
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
        status: 'ISSUED'
      };
      setPos(prev => [newPO, ...prev]);
    }
  };

  const resetToSampleData = () => {
    logger.info('context/procurement', 'Reset procurement system data to sample state');
    setPrs(INITIAL_PRS);
    setQuotes(INITIAL_QUOTES);
    setNegotiations(INITIAL_NEGO);
    setPpos(INITIAL_PPOS);
    setPos(INITIAL_POS);
    resetTiers();
  };

  return (
    <ProcurementContext.Provider value={{
      activeRole,
      setActiveRole,
      activeTenantKey,
      activeTenant,
      changeTenant,
      tenants: TENANTS,
      prs,
      quotes,
      negotiations,
      ppos,
      pos,
      auditLogs,
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
      resetToSampleData
    }}>
      {children}
    </ProcurementContext.Provider>
  );
}

export function useProcurement() {
  const context = useContext(ProcurementContext);
  if (!context) throw new Error('useProcurement must be used within ProcurementProvider');
  return context;
}
