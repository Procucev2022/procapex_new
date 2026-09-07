'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, PurchaseRequest, VendorQuote, NegotiationEvent, PPOItem, PurchaseOrder, AuditLog } from '../types';

interface ProcurementContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  prs: PurchaseRequest[];
  quotes: Record<string, VendorQuote[]>;
  negotiations: Record<string, NegotiationEvent[]>;
  ppos: PPOItem[];
  pos: PurchaseOrder[];
  auditLogs: AuditLog[];
  createPR: (pr: Omit<PurchaseRequest, 'id' | 'status' | 'buyer'>) => void;
  updatePRStatus: (id: string, status: PurchaseRequest['status'], comments?: string) => void;
  updateBOQItems: (prId: string, items: PurchaseRequest['items']) => void;
  addNegotiationRound: (prId: string, rate: number, remarks: string, actionType: string) => void;
  createPPO: (ppo: Omit<PPOItem, 'id' | 'status' | 'createdDate'>) => void;
  approvePPO: (ppoId: string) => void;
  resetToSampleData: () => void;
}

const INITIAL_PRS: PurchaseRequest[] = [
  {
    id: 'PR-2026-0001',
    title: 'Foundation TMT Rebar Fe500D Supply',
    projectName: 'Metro Line 4 - Pier Foundations',
    costCentre: 'CC-102 (Structural Steel)',
    category: 'Structural Steel',
    requester: 'Rahul Verma (Site Incharge)',
    reqDate: '2026-09-15',
    status: 'ACCEPTED',
    buyer: 'Vikram Mehta (Buyer)',
    remarks: 'Requirement for Pier Cap 101 to 115. Mill test certs required.',
    items: [
      { code: 'STL-TMT-25MM', desc: 'TMT Reinforcement Steel Bars Fe500D 25mm dia', uom: 'Ton', qty: 150, rateCard: 54000, benchmark: 53200, std: 54500, aiConf: '98%' },
      { code: 'STL-TMT-16MM', desc: 'TMT Reinforcement Steel Bars Fe500D 16mm dia', uom: 'Ton', qty: 80, rateCard: 55000, benchmark: 54100, std: 55200, aiConf: '95%' }
    ]
  },
  {
    id: 'PR-2026-0002',
    title: 'Ready Mix Concrete M30 Pouring for Tower Slab',
    projectName: 'Apex Sky Tower - Slab Pour Phase 2',
    costCentre: 'CC-101 (Civil & Concrete)',
    category: 'Civil Materials',
    requester: 'Amit Sharma (Civil Engineer)',
    reqDate: '2026-09-01',
    status: 'ACCEPTED',
    buyer: 'Vikram Mehta (Buyer)',
    remarks: 'Pumping and transit mixer supply included with temperature monitoring.',
    items: [
      { code: 'CON-RMC-M30', desc: 'Design Mix Concrete M30 with Fly Ash & Superplasticizer', uom: 'Cum', qty: 450, rateCard: 4200, benchmark: 4350, std: 4150, aiConf: '99%' }
    ]
  },
  {
    id: 'PR-2026-0003',
    title: 'Central HVAC Water-Cooled Chillers (200 TR)',
    projectName: 'Commercial Tower Mall Terminal',
    costCentre: 'CC-103 (MEP & HVAC)',
    category: 'MEP Equipment',
    requester: 'Pooja Iyer (MEP Consultant)',
    reqDate: '2026-10-10',
    status: 'SUBMITTED',
    buyer: 'Unassigned',
    remarks: 'High efficiency VFD chillers with BMS integration.',
    items: [
      { code: 'MEP-CHL-200TR', desc: 'Water Cooled Screw Chiller Unit 200 TR Capacity', uom: 'Nos', qty: 2, rateCard: 3800000, benchmark: 3650000, std: 3750000, aiConf: '92%' }
    ]
  }
];

const INITIAL_QUOTES: Record<string, VendorQuote[]> = {
  'PR-2026-0005': [
    { vendor: 'Vendor 1 (VND-001)', rate: 162260, gst: 18, leadTime: '12 Days', validTill: '2026-09-30', isL1: true },
    { vendor: 'Vendor 2 (VND-002)', rate: 174800, gst: 18, leadTime: '14 Days', validTill: '2026-09-30', isL1: false }
  ],
  'PR-2026-0003': [
    { vendor: 'Vendor 14 (VND-014)', rate: 595400, gst: 18, leadTime: '15 Days', validTill: '2026-10-20', isL1: true },
    { vendor: 'Vendor 15 (VND-015)', rate: 628000, gst: 18, leadTime: '18 Days', validTill: '2026-10-20', isL1: false }
  ],
  'PR-2026-0002': [
    { vendor: 'Vertex Infratech Pvt Ltd', rate: 4950, gst: 18, leadTime: '3 Days', validTill: '2026-09-30', isL1: false },
    { vendor: 'UltraMix Concrete Corp', rate: 5100, gst: 18, leadTime: '5 Days', validTill: '2026-09-30', isL1: false },
    { vendor: 'BuildWell RMC Supplies', rate: 5250, gst: 18, leadTime: '2 Days', validTill: '2026-09-30', isL1: false }
  ],
  'PR-2026-0001': [
    { vendor: 'Apex Steel Traders Ltd', rate: 53500, gst: 18, leadTime: '4 Days', validTill: '2026-09-30', isL1: true },
    { vendor: 'Jindal Direct Distribution', rate: 54200, gst: 18, leadTime: '7 Days', validTill: '2026-09-30', isL1: false }
  ]
};

const INITIAL_NEGO: Record<string, NegotiationEvent[]> = {
  'PR-2026-0005': [
    { round: 1, user: 'Vendor 1 (VND-001)', type: 'Original Quotation', rate: 162260, remarks: 'Initial competitive bid submitted against tender specifications.', timestamp: '2026-09-06 10:30' },
    { round: 2, user: 'Rahul Verma (Category Manager)', type: 'Buyer Counter-Offer', rate: 148500, remarks: 'Reference AI MLEO cost model on granite and joinery. Volume rate requested with 45-day payment cycle.', timestamp: '2026-09-06 14:15' }
  ],
  'PR-2026-0003': [
    { round: 1, user: 'Vendor 14 (VND-014)', type: 'Original Quotation', rate: 595400, remarks: 'Standard HVAC template OEM line items with 1-year warranty.', timestamp: '2026-09-06 11:00' },
    { round: 2, user: 'Sanjay Gupta (Category Manager)', type: 'Buyer Counter-Offer', rate: 546000, remarks: 'Counter-offer aligned with corporate master rate card and factory fabricated ducting volume.', timestamp: '2026-09-06 15:30' }
  ],
  'PR-2026-0002': [
    { round: 1, user: 'Vertex Infratech (Vendor)', type: 'Original Quotation', rate: 4950, remarks: 'Includes high-grade additive and pumping charges.', timestamp: '2026-08-24 10:15' },
    { round: 2, user: 'Vikram Mehta (Buyer)', type: 'Buyer Counter-Offer', rate: 4350, remarks: 'AI Cost breakdown shows cement/aggregate local rates support ₹4,350/Cum for 450 Cum volume.', timestamp: '2026-08-24 14:30' },
    { round: 3, user: 'Vertex Infratech (Vendor)', type: 'Vendor Revised Quote', rate: 4400, remarks: 'Agreed on volume commitment of 450 Cum with 30-day payment cycle.', timestamp: '2026-08-25 09:45' }
  ]
};

const INITIAL_PPOS: PPOItem[] = [
  {
    id: 'PPO-2026-0012',
    prId: 'PR-2026-0002',
    vendor: 'Vertex Infratech Pvt Ltd',
    itemDesc: 'Design Mix Concrete M30 with Fly Ash (450 Cum)',
    unitRate: 4400,
    qty: 450,
    totalVal: 1980000,
    taxRate: 18,
    taxAmount: 356400,
    grandTotal: 2336400,
    paymentTerms: '30 Days Net from delivery & QC signoff',
    leadTime: '3 Days from PO',
    status: 'PENDING_APPROVAL',
    createdDate: '2026-08-25'
  }
];

const INITIAL_POS: PurchaseOrder[] = [
  {
    id: 'PO-2026-0001',
    ppoRef: 'PPO-2026-0011',
    prRef: 'PR-2026-0001',
    vendor: 'Apex Steel Traders Ltd',
    amount: 14519900,
    issueDate: '2026-08-24',
    status: 'ISSUED'
  }
];

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export function ProcurementProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRole] = useState<UserRole>('BUYER');
  const [prs, setPrs] = useState<PurchaseRequest[]>(INITIAL_PRS);
  const [quotes, setQuotes] = useState<Record<string, VendorQuote[]>>(INITIAL_QUOTES);
  const [negotiations, setNegotiations] = useState<Record<string, NegotiationEvent[]>>(INITIAL_NEGO);
  const [ppos, setPpos] = useState<PPOItem[]>(INITIAL_PPOS);
  const [pos, setPos] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { time: '2026-08-25 10:12', user: 'Vikram Mehta (Buyer)', action: 'PPO Generated', detail: 'Created PPO-2026-0012 for Vertex Infratech.' },
    { time: '2026-08-24 14:30', user: 'Vikram Mehta (Buyer)', action: 'AI Cost Analysis Invoked', detail: 'Deconstructed M30 concrete into MLEO cost pillars.' }
  ]);

  const createPR = (prData: Omit<PurchaseRequest, 'id' | 'status' | 'buyer'>) => {
    const newPR: PurchaseRequest = {
      ...prData,
      id: `PR-2026-000${prs.length + 1}`,
      status: 'SUBMITTED',
      buyer: 'Unassigned'
    };
    setPrs(prev => [newPR, ...prev]);
    setAuditLogs(prev => [{
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: `${activeRole} (User)`,
      action: 'PR Submitted',
      detail: `Created ${newPR.id} - ${newPR.title}`
    }, ...prev]);
  };

  const updatePRStatus = (id: string, status: PurchaseRequest['status'], comments?: string) => {
    setPrs(prev => prev.map(p => p.id === id ? { ...p, status, buyer: status === 'ACCEPTED' ? 'Vikram Mehta (Buyer)' : p.buyer } : p));
    setAuditLogs(prev => [{
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: `${activeRole} (User)`,
      action: `PR Status Changed to ${status}`,
      detail: `PR ${id} updated to ${status}. Notes: ${comments || 'None'}`
    }, ...prev]);
  };

  const updateBOQItems = (prId: string, items: PurchaseRequest['items']) => {
    setPrs(prev => prev.map(p => p.id === prId ? { ...p, items } : p));
  };

  const addNegotiationRound = (prId: string, rate: number, remarks: string, actionType: string) => {
    const roundNum = (negotiations[prId]?.length || 0) + 1;
    const newEvent: NegotiationEvent = {
      round: roundNum,
      user: actionType === 'BUYER_COUNTER' ? 'Vikram Mehta (Buyer)' : 'Vendor Representative',
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
    setPpos(prev => [newPPO, ...prev]);
  };

  const approvePPO = (ppoId: string) => {
    setPpos(prev => prev.map(p => p.id === ppoId ? { ...p, status: 'APPROVED' } : p));
    const ppo = ppos.find(p => p.id === ppoId);
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
    setPrs(INITIAL_PRS);
    setQuotes(INITIAL_QUOTES);
    setNegotiations(INITIAL_NEGO);
    setPpos(INITIAL_PPOS);
    setPos(INITIAL_POS);
  };

  return (
    <ProcurementContext.Provider value={{
      activeRole,
      setActiveRole,
      prs,
      quotes,
      negotiations,
      ppos,
      pos,
      auditLogs,
      createPR,
      updatePRStatus,
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
