import type {
  PurchaseRequest,
  VendorQuote,
  NegotiationEvent,
  PPOItem,
  PurchaseOrder,
  AuditLog,
} from '@/types';

export const INITIAL_PRS: PurchaseRequest[] = [
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
      { code: 'CNT-SKT-SS304', desc: '100mm high Stainless Steel Grade 304 Brushed Skirting', uom: 'Rmt', qty: 14.0, rateCard: 780, benchmark: 750, std: 770, aiConf: '94%' },
    ],
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
      { code: 'STL-TMT-16MM', desc: 'TMT Reinforcement Steel Bars Fe500D 16mm dia', uom: 'Ton', qty: 80, rateCard: 55000, benchmark: 54100, std: 55200, aiConf: '95%' },
    ],
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
      { code: 'CON-RMC-M30', desc: 'Design Mix Concrete M30 with Fly Ash & Superplasticizer', uom: 'Cum', qty: 450, rateCard: 4200, benchmark: 4350, std: 4150, aiConf: '99%' },
    ],
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
      { code: 'MEP-CHL-200TR', desc: 'Water Cooled Screw Chiller Unit 200 TR Capacity', uom: 'Nos', qty: 2, rateCard: 3800000, benchmark: 3650000, std: 3750000, aiConf: '92%' },
    ],
  },
];

export const INITIAL_QUOTES: Record<string, VendorQuote[]> = {
  'PR-2026-0005': [
    { vendor: 'Vendor 1 (VND-001)', rate: 162260, gst: 18, leadTime: '12 Days', validTill: '2026-09-30', isL1: true },
    { vendor: 'Vendor 2 (VND-002)', rate: 174800, gst: 18, leadTime: '14 Days', validTill: '2026-09-30', isL1: false },
  ],
  'PR-2026-0003': [
    { vendor: 'Vendor 14 (VND-014)', rate: 595400, gst: 18, leadTime: '15 Days', validTill: '2026-10-20', isL1: true },
    { vendor: 'Vendor 15 (VND-015)', rate: 628000, gst: 18, leadTime: '18 Days', validTill: '2026-10-20', isL1: false },
  ],
  'PR-2026-0002': [
    { vendor: 'Vertex Infratech Pvt Ltd', rate: 4950, gst: 18, leadTime: '3 Days', validTill: '2026-09-30', isL1: false },
    { vendor: 'UltraMix Concrete Corp', rate: 5100, gst: 18, leadTime: '5 Days', validTill: '2026-09-30', isL1: false },
    { vendor: 'BuildWell RMC Supplies', rate: 5250, gst: 18, leadTime: '2 Days', validTill: '2026-09-30', isL1: false },
  ],
  'PR-2026-0001': [
    { vendor: 'Apex Steel Traders Ltd', rate: 53500, gst: 18, leadTime: '4 Days', validTill: '2026-09-30', isL1: true },
    { vendor: 'Jindal Direct Distribution', rate: 54200, gst: 18, leadTime: '7 Days', validTill: '2026-09-30', isL1: false },
  ],
};

export const INITIAL_NEGO: Record<string, NegotiationEvent[]> = {
  'PR-2026-0005': [
    { round: 1, user: 'Vendor 1 (VND-001)', type: 'Original Quotation', rate: 162260, remarks: 'Initial competitive bid submitted against tender specifications.', timestamp: '2026-09-06 10:30' },
    { round: 2, user: 'Rahul Verma (Category Manager)', type: 'Buyer Counter-Offer', rate: 148500, remarks: 'Reference AI MLEO cost model on granite and joinery. Volume rate requested with 45-day payment cycle.', timestamp: '2026-09-06 14:15' },
  ],
  'PR-2026-0003': [
    { round: 1, user: 'Vendor 14 (VND-014)', type: 'Original Quotation', rate: 595400, remarks: 'Standard HVAC template OEM line items with 1-year warranty.', timestamp: '2026-09-06 11:00' },
    { round: 2, user: 'Sanjay Gupta (Category Manager)', type: 'Buyer Counter-Offer', rate: 546000, remarks: 'Counter-offer aligned with corporate master rate card and factory fabricated ducting volume.', timestamp: '2026-09-06 15:30' },
  ],
  'PR-2026-0002': [
    { round: 1, user: 'Vertex Infratech (Vendor)', type: 'Original Quotation', rate: 4950, remarks: 'Includes high-grade additive and pumping charges.', timestamp: '2026-08-24 10:15' },
    { round: 2, user: 'Vikram Mehta (Buyer)', type: 'Buyer Counter-Offer', rate: 4350, remarks: 'AI Cost breakdown shows cement/aggregate local rates support ₹4,350/Cum for 450 Cum volume.', timestamp: '2026-08-24 14:30' },
    { round: 3, user: 'Vertex Infratech (Vendor)', type: 'Vendor Revised Quote', rate: 4400, remarks: 'Agreed on volume commitment of 450 Cum with 30-day payment cycle.', timestamp: '2026-08-25 09:45' },
  ],
};

export const INITIAL_PPOS: PPOItem[] = [
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
    createdDate: '2026-09-06',
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
    createdDate: '2026-08-25',
  },
];

export const INITIAL_POS: PurchaseOrder[] = [
  {
    id: 'PO-2026-0089',
    ppoRef: 'PPO-2026-0015',
    prRef: 'PR-2026-0005',
    vendor: 'DesignCraft Millworks & Interiors Pvt Ltd',
    amount: 175230,
    issueDate: '2026-09-06',
    deliveryDate: '2026-09-25',
    status: 'ISSUED',
  },
  {
    id: 'PO-2026-0001',
    ppoRef: 'PPO-2026-0011',
    prRef: 'PR-2026-0001',
    vendor: 'Apex Steel Traders Ltd',
    amount: 14519900,
    issueDate: '2026-08-24',
    deliveryDate: '2026-09-10',
    status: 'ISSUED',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { time: '2026-09-06 14:45', user: 'Vikram Mehta (Category Mgr)', action: 'PPO Generated', detail: 'Created PPO-2026-0015 for DesignCraft Millworks.' },
  { time: '2026-09-06 11:20', user: 'Vikram Mehta (Category Mgr)', action: 'AI Cost Analysis Invoked', detail: 'Deconstructed Reception Counter into MLEO cost pillars.' },
  { time: '2026-08-25 10:12', user: 'Vikram Mehta (Buyer)', action: 'PPO Generated', detail: 'Created PPO-2026-0012 for Vertex Infratech.' },
];
