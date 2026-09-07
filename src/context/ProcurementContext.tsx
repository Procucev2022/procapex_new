'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, TenantKey, TenantConfig, PurchaseRequest, VendorQuote, NegotiationEvent, PPOItem, PurchaseOrder, AuditLog } from '../types';
import { logger } from '../lib/logger';

export const TENANTS: Record<TenantKey, TenantConfig> = {
  'TNT_LNT': {
    id: 'TNT-LNT-001',
    name: 'L&T Infra & Construction Ltd',
    short: 'LT',
    project: 'Metro Line 4 Underground & Stations',
    vendor: 'DesignCraft Millworks & Interiors Pvt Ltd',
    team: {
      'PROJECT_TEAM': { name: 'Rahul Verma', title: 'Senior Project Engineer (Site Lead)' },
      'PROJECT_HEAD_PR': { name: 'Anil Kulkarni', title: 'Vice President (Projects)' },
      'CATEGORY_MANAGER': { name: 'Vikram Mehta', title: 'Lead Category Manager (Interior & Fitouts)' },
      'CATEGORY_MANAGER_2': { name: 'Rajesh Singhania', title: 'Head of Strategic Sourcing' },
      'PROJECT_HEAD_PPO': { name: 'Anil Kulkarni', title: 'Vice President (Projects)' },
      'FINANCE_HEAD': { name: 'Sunil Deshmukh', title: 'Chief Financial Officer' },
      'VENDOR': { name: 'DesignCraft Millworks Pvt Ltd', title: 'Approved Tier-1 Joinery Contractor' }
    }
  },
  'TNT_TATA': {
    id: 'TNT-TATA-002',
    name: 'Tata Projects Global',
    short: 'TP',
    project: 'Noida International Airport Terminal 1',
    vendor: 'Tata Steel & BlueStar Chiller Div',
    team: {
      'PROJECT_TEAM': { name: 'Siddharth Rao', title: 'Package Lead Engineer' },
      'PROJECT_HEAD_PR': { name: 'Capt. R. K. Nair', title: 'Project Director' },
      'CATEGORY_MANAGER': { name: 'Megha Sen', title: 'Senior Procurement Manager' },
      'CATEGORY_MANAGER_2': { name: 'Arunav Roy', title: 'Chief Procurement Officer' },
      'PROJECT_HEAD_PPO': { name: 'Capt. R. K. Nair', title: 'Project Director' },
      'FINANCE_HEAD': { name: 'G. Swaminathan', title: 'VP - Commercial & Finance' },
      'VENDOR': { name: 'Tata Steel & BlueStar Chiller Div', title: 'OEM Strategic Partner' }
    }
  },
  'TNT_GODREJ': {
    id: 'TNT-GODREJ-003',
    name: 'Godrej Properties & Living',
    short: 'GP',
    project: 'Godrej Sky Terraces Luxury Highrise',
    vendor: 'Godrej Interio Enterprise',
    team: {
      'PROJECT_TEAM': { name: 'Karan Joshi', title: 'Site In-charge (Architecture)' },
      'PROJECT_HEAD_PR': { name: 'Rohan Godrej', title: 'Regional Projects Head' },
      'CATEGORY_MANAGER': { name: 'Divya Nair', title: 'Category Manager (Interior Works)' },
      'CATEGORY_MANAGER_2': { name: 'Pradeep Khurana', title: 'Head - Central Procurement' },
      'PROJECT_HEAD_PPO': { name: 'Rohan Godrej', title: 'Regional Projects Head' },
      'FINANCE_HEAD': { name: 'Deepak Varma', title: 'Financial Controller' },
      'VENDOR': { name: 'Godrej Interio Enterprise', title: 'Approved Millwork Vendor' }
    }
  },
  'TNT_SHAPOORJI': {
    id: 'TNT-SHAPOORJI-004',
    name: 'Shapoorji Pallonji Real Estate',
    short: 'SP',
    project: 'Parkwest Tech Park Phase 3',
    vendor: 'SP Fabricators & Interior Solutions',
    team: {
      'PROJECT_TEAM': { name: 'Tanmay Saxena', title: 'Senior Construction Manager' },
      'PROJECT_HEAD_PR': { name: 'Farokh Mistry', title: 'Executive VP - Infra' },
      'CATEGORY_MANAGER': { name: 'Cyrus Broacha', title: 'Procurement Specialist' },
      'CATEGORY_MANAGER_2': { name: 'Neville Tata', title: 'Head of Global Procurement' },
      'PROJECT_HEAD_PPO': { name: 'Farokh Mistry', title: 'Executive VP - Infra' },
      'FINANCE_HEAD': { name: 'Ratan Mehta', title: 'Director of Finance' },
      'VENDOR': { name: 'SP Fabricators & Interior Solutions', title: 'Registered Contractor' }
    }
  }
};

export interface ProcurementContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeTenantKey: TenantKey;
  activeTenant: TenantConfig;
  changeTenant: (key: TenantKey) => void;
  tenants: Record<TenantKey, TenantConfig>;
  prs: PurchaseRequest[];
  quotes: Record<string, VendorQuote[]>;
  negotiations: Record<string, NegotiationEvent[]>;
  ppos: PPOItem[];
  pos: PurchaseOrder[];
  auditLogs: AuditLog[];
  // PPO 3-Tier Workflow
  tier1Approved: boolean;
  tier2Approved: boolean;
  tier3Approved: boolean;
  poReleased: boolean;
  approveTier1: () => void;
  approveTier2: () => void;
  approveTier3AndReleasePO: () => void;
  resetTiers: () => void;
  // Actions
  createPR: (pr: Omit<PurchaseRequest, 'id' | 'status' | 'buyer'>) => void;
  updatePRStatus: (id: string, status: PurchaseRequest['status'], comments?: string) => void;
  approvePRByProjectHead: (id: string) => void;
  updateBOQItems: (prId: string, items: PurchaseRequest['items']) => void;
  addNegotiationRound: (prId: string, rate: number, remarks: string, actionType: string) => void;
  createPPO: (ppo: Omit<PPOItem, 'id' | 'status' | 'createdDate'>) => void;
  approvePPO: (ppoId: string) => void;
  resetToSampleData: () => void;
}

const INITIAL_PRS: PurchaseRequest[] = [
  {
    id: 'PR-2026-0005',
    title: 'Fabrication & Installation of Reception Counter (Counter Elevation D)',
    projectName: 'Metro Line 4 Underground & Stations',
    costCentre: 'CC-104 (Finishing, Interior & Millwork)',
    category: 'Interior & Fitouts',
    requester: 'Rahul Verma (Site Lead)',
    reqDate: '2026-09-25',
    status: 'SUBMITTED',
    buyer: 'Vikram Mehta (Category Manager)',
    remarks: 'Reception Counter & Lobby Joinery Package (PKG-2026-INT-001). 6 items, 4 drawings attached.',
    items: [
      { code: 'CNT-TOP-GRN20', desc: '20mm thick Polished Jet Black Granite Countertop with bullnose profiling', uom: 'Sqm', qty: 12.5, rateCard: 3550, benchmark: 3450, std: 3500, aiConf: '98%' },
      { code: 'CNT-PLY-BWP18', desc: 'Marine Grade Boiling Water Proof (BWP) Plywood 18mm IS 710', uom: 'Sqm', qty: 38.0, rateCard: 1520, benchmark: 1480, std: 1500, aiConf: '97%' },
      { code: 'CNT-LAM-1MM', desc: '1.0mm thick High Pressure Textured Decorative Laminate', uom: 'Sqm', qty: 24.0, rateCard: 890, benchmark: 850, std: 880, aiConf: '96%' },
      { code: 'CNT-HDW-SOFT', desc: 'Joinery & Hardware Package: Soft-close hinges & slides', uom: 'Set', qty: 14.0, rateCard: 1780, benchmark: 1720, std: 1750, aiConf: '95%' },
      { code: 'CNT-LED-PROF', desc: '12V DC Warm White LED Strip Light in recessed channel', uom: 'Rmt', qty: 16.0, rateCard: 420, benchmark: 400, std: 410, aiConf: '93%' },
      { code: 'CNT-SKT-SS304', desc: '100mm high Stainless Steel Grade 304 Brushed Skirting', uom: 'Rmt', qty: 14.0, rateCard: 780, benchmark: 750, std: 770, aiConf: '94%' }
    ]
  },
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
    id: 'PPO-2026-0015',
    prId: 'PR-2026-0005',
    vendor: 'DesignCraft Millworks & Interiors Pvt Ltd',
    itemDesc: 'Reception Counter & Lobby Joinery Package (PKG-2026-INT-001)',
    unitRate: 148500,
    qty: 1,
    totalVal: 148500,
    taxRate: 18,
    taxAmount: 26730,
    grandTotal: 175230,
    paymentTerms: '30 Days Net from delivery & QC signoff',
    leadTime: '12 Calendar Days',
    status: 'TIER_1_PENDING',
    createdDate: '2026-09-06'
  },
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
    id: 'PO-2026-0089',
    ppoRef: 'PPO-2026-0015',
    prRef: 'PR-2026-0005',
    vendor: 'DesignCraft Millworks & Interiors Pvt Ltd',
    amount: 175230,
    issueDate: '2026-09-06',
    deliveryDate: '2026-09-25',
    status: 'ISSUED'
  },
  {
    id: 'PO-2026-0001',
    ppoRef: 'PPO-2026-0011',
    prRef: 'PR-2026-0001',
    vendor: 'Apex Steel Traders Ltd',
    amount: 14519900,
    issueDate: '2026-08-24',
    deliveryDate: '2026-09-10',
    status: 'ISSUED'
  }
];

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export function ProcurementProvider({ children }: { children: React.ReactNode }) {
  const [activeTenantKey, setActiveTenantKey] = useState<TenantKey>('TNT_LNT');
  const [activeRole, setActiveRole] = useState<UserRole>('PROJECT_TEAM');
  const [prs, setPrs] = useState<PurchaseRequest[]>(INITIAL_PRS);
  const [quotes, setQuotes] = useState<Record<string, VendorQuote[]>>(INITIAL_QUOTES);
  const [negotiations, setNegotiations] = useState<Record<string, NegotiationEvent[]>>(INITIAL_NEGO);
  const [ppos, setPpos] = useState<PPOItem[]>(INITIAL_PPOS);
  const [pos, setPos] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { time: '2026-09-06 14:45', user: 'Vikram Mehta (Category Mgr)', action: 'PPO Generated', detail: 'Created PPO-2026-0015 for DesignCraft Millworks.' },
    { time: '2026-09-06 11:20', user: 'Vikram Mehta (Category Mgr)', action: 'AI Cost Analysis Invoked', detail: 'Deconstructed Reception Counter into MLEO cost pillars.' },
    { time: '2026-08-25 10:12', user: 'Vikram Mehta (Buyer)', action: 'PPO Generated', detail: 'Created PPO-2026-0012 for Vertex Infratech.' }
  ]);

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
