'use client';

import React, { useState } from 'react';
import { Send, CreditCard, Scale, Sparkles, MessageSquareDiff, FileCheck2, Users, AlertTriangle, CheckCircle2, RefreshCw, Handshake, History, FileText, ChevronDown, Check, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { MLEOBreakdown, VendorQuoteDetail, NonL1Justification } from '../types';

function getVendorCommercialTerms(vendorId: string, prId?: string) {
  const TERMS_MAP: Record<string, {
    paymentTerms: string;
    advancePct: string;
    retentionPct: string;
    creditDays: string;
    paymentBadge: string;
    paymentBadgeClass: string;
    leadTime: string;
    deliveryDate: string;
    deliveryBadge: string;
    deliveryBadgeClass: string;
    complianceStatus: string;
    complianceBadge: string;
    complianceClass: string;
    complianceNote: string;
  }> = {
    'VND-001': {
      paymentTerms: '10% Adv | 70% Progress RA | 10% Handover | 10% DLP (30D Credit)',
      advancePct: '10%',
      retentionPct: '10%',
      creditDays: '30 Days',
      paymentBadge: '✓ Matches PR Baseline',
      paymentBadgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      leadTime: '12 - 15 Calendar Days',
      deliveryDate: '2026-09-25 (Strict Handover)',
      deliveryBadge: '✓ Meets Target Date',
      deliveryBadgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      complianceStatus: 'COMPLIANT',
      complianceBadge: '✓ 100% Commercial Compliant',
      complianceClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      complianceNote: 'Fully compliant with Requisition Payment & Delivery Terms'
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
      complianceNote: 'Requires 15% Advance (PR Baseline: 10%), offers 3-day faster delivery'
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
      complianceNote: 'Beneficial 0% advance terms, but lead time exceeds target by 5 days'
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
      complianceNote: 'Contractually bound to corporate master rate card terms'
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
      complianceNote: 'Standard credit terms, 2 days faster factory dispatch'
    }
  };

  if (TERMS_MAP[vendorId]) return TERMS_MAP[vendorId];
  return {
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
    complianceNote: 'Standard vendor empanelment commercial conditions'
  };
}

interface BOQItemWithMLEO {
  code: string;
  desc: string;
  uom: string;
  qty: number;
  rateCard: number;
  benchmark: number;
  bestHistoricalPrice?: number;
  prevPo?: string;
  mleo: MLEOBreakdown;
  vendorRateCards?: Record<string, number>;
  vendorQuotes?: Record<string, VendorQuoteDetail>;
}

interface PRData {
  id: string;
  title: string;
  project: string;
  costCenter: string;
  category: string;
  categoryMajor: string;
  method: string;
  methodName: string;
  methodBadgeClass: string;
  sourceFile: string;
  raiser: string;
  estBaseline: number;
  targetDate: string;
  site: string;
  contact: string;
  docCount: number;
  nominatedVendors: string[];
  items: BOQItemWithMLEO[];
}

const INITIAL_PRS_DATA: Record<string, PRData> = {
  'PR-2026-0005': {
    id: 'PR-2026-0005',
    title: 'Reception Counter Fabrication (Drawing: Counter Elevation D)',
    project: 'Godrej Woods, Tower C',
    costCenter: 'CC-104 (Finishing)',
    category: 'Interior & Fitouts',
    categoryMajor: 'INTERIOR',
    method: 'METHOD_3',
    methodName: 'Method 3: Drawing / PDF AI Scope Extraction',
    methodBadgeClass: 'bg-purple-100 text-purple-900 border border-purple-300',
    sourceFile: 'Counter_Elevation_D.pdf',
    raiser: 'Rahul Verma (Site Lead)',
    estBaseline: 141700,
    targetDate: '2026-09-28',
    site: 'Tower C Reception Lobby, Godrej Woods, Sector 43, Noida',
    contact: 'Rajesh Sharma (+91 98765 43210)',
    docCount: 2,
    nominatedVendors: ['VND-001', 'VND-002'],
    items: [
      {
        code: 'CNT-TOP-GRN20',
        desc: '20mm Polished Jet Black Granite Countertop',
        uom: 'Sqm',
        qty: 12.5,
        rateCard: 3400,
        benchmark: 3250,
        bestHistoricalPrice: 3400,
        prevPo: 'PO-2025-0912 (Godrej Woods)',
        mleo: { m: 1820, l: 580, e: 490, o: 360, conf: '98%' },
        vendorQuotes: {
          'VND-001': { initialRate: 3900, revisedRate: null },
          'VND-002': { initialRate: 4100, revisedRate: null },
          'VND-005': { initialRate: 4050, revisedRate: null }
        }
      },
      {
        code: 'CNT-PLY-BWP18',
        desc: '18mm Marine Grade BWP Plywood (IS 710)',
        uom: 'Sqm',
        qty: 38.0,
        rateCard: 1450,
        benchmark: 1380,
        bestHistoricalPrice: 1450,
        prevPo: 'PO-2025-0912 (Godrej Woods)',
        mleo: { m: 820, l: 290, e: 120, o: 150, conf: '97%' },
        vendorQuotes: {
          'VND-001': { initialRate: 1650, revisedRate: null },
          'VND-002': { initialRate: 1780, revisedRate: null },
          'VND-005': { initialRate: 1720, revisedRate: null }
        }
      },
      {
        code: 'CNT-LAM-1MM',
        desc: '1.0mm Textured HPL Laminate Fascia',
        uom: 'Sqm',
        qty: 24.0,
        rateCard: 850,
        benchmark: 820,
        bestHistoricalPrice: 850,
        prevPo: 'PO-2025-0912 (Godrej Woods)',
        mleo: { m: 480, l: 180, e: 60, o: 100, conf: '96%' },
        vendorQuotes: {
          'VND-001': { initialRate: 980, revisedRate: null },
          'VND-002': { initialRate: 1050, revisedRate: null },
          'VND-005': { initialRate: 1020, revisedRate: null }
        }
      },
      {
        code: 'CNT-HDW-SOFT',
        desc: 'Soft-Close Concealed Hinges & Telescopic Slides',
        uom: 'Set',
        qty: 14.0,
        rateCard: 1750,
        benchmark: 1650,
        bestHistoricalPrice: 1750,
        prevPo: 'PO-2025-0912 (Godrej Woods)',
        mleo: { m: 1050, l: 280, e: 90, o: 230, conf: '95%' },
        vendorQuotes: {
          'VND-001': { initialRate: 2100, revisedRate: null },
          'VND-002': { initialRate: 2250, revisedRate: null },
          'VND-005': { initialRate: 2180, revisedRate: null }
        }
      },
      {
        code: 'CNT-LED-PROF',
        desc: '12V DC Warm White LED Strip in Profile',
        uom: 'Rmt',
        qty: 16.0,
        rateCard: 380,
        benchmark: 350,
        bestHistoricalPrice: 380,
        prevPo: 'PO-2025-0912 (Godrej Woods)',
        mleo: { m: 210, l: 75, e: 20, o: 45, conf: '94%' },
        vendorQuotes: {
          'VND-001': { initialRate: 450, revisedRate: null },
          'VND-002': { initialRate: 490, revisedRate: null },
          'VND-005': { initialRate: 470, revisedRate: null }
        }
      },
      {
        code: 'CNT-SKT-SS304',
        desc: '100mm SS 304 Brushed Skirting',
        uom: 'Rmt',
        qty: 14.0,
        rateCard: 720,
        benchmark: 680,
        bestHistoricalPrice: 720,
        prevPo: 'PO-2025-0912 (Godrej Woods)',
        mleo: { m: 420, l: 140, e: 35, o: 85, conf: '96%' },
        vendorQuotes: {
          'VND-001': { initialRate: 850, revisedRate: null },
          'VND-002': { initialRate: 920, revisedRate: null },
          'VND-005': { initialRate: 890, revisedRate: null }
        }
      }
    ]
  },
  'PR-2026-0003': {
    id: 'PR-2026-0003',
    title: 'HVAC Chillers, AHU & Air Distribution Package (Standard Template)',
    project: 'Godrej One Corporate Towers',
    costCenter: 'CC-103 (MEP & Heavy Systems)',
    category: 'MEP & Heavy Systems',
    categoryMajor: 'MEP',
    method: 'METHOD_2',
    methodName: 'Method 2: Corporate Standard Template (Filled)',
    methodBadgeClass: 'bg-teal-100 text-teal-900 border border-teal-300',
    sourceFile: 'Standard_HVAC_Package_Template_v2.csv',
    raiser: 'Sanjay Gupta (MEP Lead)',
    estBaseline: 656350,
    targetDate: '2026-10-15',
    site: 'HVAC Plant Room & Floor 4-8 AHU, Godrej One, Mumbai',
    contact: 'Anil Deshmukh (+91 98330 44556)',
    docCount: 2,
    nominatedVendors: ['VND-014', 'VND-015'],
    items: [
      {
        code: 'MEP-HVAC-AHU01',
        desc: 'Double Skin Floor Mounted AHU 5000 CFM with VFD',
        uom: 'Nos',
        qty: 4.0,
        rateCard: 65000,
        benchmark: 62000,
        bestHistoricalPrice: 65000,
        prevPo: 'PO-2025-0810 (Godrej One)',
        mleo: { m: 38000, l: 12500, e: 6000, o: 5500, conf: '99%' },
        vendorRateCards: {
          'VND-014': 65000,
          'VND-015': 68500
        },
        vendorQuotes: {
          'VND-014': { initialRate: 72000, revisedRate: null },
          'VND-015': { initialRate: 76000, revisedRate: null }
        }
      },
      {
        code: 'MEP-HVAC-DUCT',
        desc: 'Factory Fabricated Galvanized GI Ducting (Class 24)',
        uom: 'Sqm',
        qty: 320.0,
        rateCard: 680,
        benchmark: 640,
        bestHistoricalPrice: 680,
        prevPo: 'PO-2025-0810 (Godrej One)',
        mleo: { m: 390, l: 140, e: 45, o: 65, conf: '98%' },
        vendorRateCards: {
          'VND-014': 680,
          'VND-015': 650
        },
        vendorQuotes: {
          'VND-014': { initialRate: 780, revisedRate: null },
          'VND-015': { initialRate: 820, revisedRate: null }
        }
      },
      {
        code: 'MEP-HVAC-VAV',
        desc: 'Pressure Independent VAV Terminal Units with Actuator',
        uom: 'Nos',
        qty: 16.0,
        rateCard: 8500,
        benchmark: 8100,
        bestHistoricalPrice: 8500,
        prevPo: 'PO-2025-0810 (Godrej One)',
        mleo: { m: 5100, l: 1600, e: 600, o: 800, conf: '97%' },
        vendorRateCards: {
          'VND-014': 8500,
          'VND-015': 8900
        },
        vendorQuotes: {
          'VND-014': { initialRate: 9400, revisedRate: null },
          'VND-015': { initialRate: 9900, revisedRate: null }
        }
      },
      {
        code: 'MEP-HVAC-GRIL',
        desc: 'Extruded Aluminium Powder Coated Supply Air Grilles',
        uom: 'Rmt',
        qty: 45.0,
        rateCard: 950,
        benchmark: 900,
        bestHistoricalPrice: 950,
        prevPo: 'PO-2025-0810 (Godrej One)',
        mleo: { m: 560, l: 190, e: 60, o: 90, conf: '95%' },
        vendorRateCards: {
          'VND-014': 950,
          'VND-015': 920
        },
        vendorQuotes: {
          'VND-014': { initialRate: 1080, revisedRate: null },
          'VND-015': { initialRate: 1150, revisedRate: null }
        }
      }
    ]
  },
  'PR-2026-0002': {
    id: 'PR-2026-0002',
    title: 'Substructure Concrete & Raft Foundation Package',
    project: 'L&T Infotech Park Phase II',
    costCenter: 'CC-101 (Civil & Structural)',
    category: 'Civil & Structural',
    categoryMajor: 'CIVIL',
    method: 'METHOD_1',
    methodName: 'Method 1: Spreadsheet Upload / Blank BOQ',
    methodBadgeClass: 'bg-sky-100 text-sky-900 border border-sky-300',
    sourceFile: 'Foundation_BOQ_Rev3.xlsx',
    raiser: 'Amit Sharma (Structural Lead)',
    estBaseline: 435000,
    targetDate: '2026-09-20',
    site: 'Block A Substructure, Infotech Park, Powai, Mumbai',
    contact: 'Vikram Patil (+91 98220 11223)',
    docCount: 3,
    nominatedVendors: ['VND-011', 'VND-012'],
    items: [
      {
        code: 'CIV-CONC-M30',
        desc: 'Ready Mix Concrete M30 Grade with Flyash',
        uom: 'Cum',
        qty: 85.0,
        rateCard: 4350,
        benchmark: 4200,
        bestHistoricalPrice: 4350,
        prevPo: 'PO-2025-0450 (L&T Phase I)',
        mleo: { m: 2650, l: 680, e: 450, o: 420, conf: '99%' },
        vendorQuotes: {
          'VND-011': { initialRate: 4850, revisedRate: null },
          'VND-012': { initialRate: 5100, revisedRate: null }
        }
      },
      {
        code: 'CIV-FRM-PLY12',
        desc: 'Waterproof Film-Faced Shuttering Plywood 12mm',
        uom: 'Sqm',
        qty: 140.0,
        rateCard: 460,
        benchmark: 430,
        bestHistoricalPrice: 460,
        prevPo: 'PO-2025-0450 (L&T Phase I)',
        mleo: { m: 270, l: 90, e: 25, o: 45, conf: '97%' },
        vendorQuotes: {
          'VND-011': { initialRate: 520, revisedRate: null },
          'VND-012': { initialRate: 550, revisedRate: null }
        }
      }
    ]
  },
  'PR-2026-0004': {
    id: 'PR-2026-0004',
    title: 'Executive Joinery, Acoustic Paneling & Door Assemblies',
    project: 'Tata Cyber City Tower 2',
    costCenter: 'CC-104 (Finishing)',
    category: 'Interior & Fitouts',
    categoryMajor: 'INTERIOR',
    method: 'METHOD_4',
    methodName: 'Method 4: AI Pre-Estimator & Catalog',
    methodBadgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
    sourceFile: 'ProCPX Standard Pre-Estimate Catalog',
    raiser: 'Priya Nair (Interior Architect)',
    estBaseline: 285000,
    targetDate: '2026-10-05',
    site: '7th Floor Executive Suites, Cyber City, Bengaluru',
    contact: 'Karan Mehta (+91 97110 55443)',
    docCount: 1,
    nominatedVendors: ['VND-001', 'VND-003', 'VND-007'],
    items: [
      {
        code: 'INT-ACS-PANEL',
        desc: 'Fabric Wrapped Acoustic Wall Panels 25mm',
        uom: 'Sqm',
        qty: 65.0,
        rateCard: 2200,
        benchmark: 2100,
        bestHistoricalPrice: 2200,
        prevPo: 'PO-2025-0622 (Tata Cyber City T1)',
        mleo: { m: 1320, l: 450, e: 140, o: 190, conf: '98%' },
        vendorQuotes: {
          'VND-001': { initialRate: 2450, revisedRate: null },
          'VND-003': { initialRate: 2600, revisedRate: null },
          'VND-007': { initialRate: 2520, revisedRate: null }
        }
      },
      {
        code: 'INT-DR-FLUSH',
        desc: 'Solid Core Flush Doors 45mm with Teak Veneer',
        uom: 'Nos',
        qty: 18.0,
        rateCard: 7800,
        benchmark: 7400,
        bestHistoricalPrice: 7800,
        prevPo: 'PO-2025-0622 (Tata Cyber City T1)',
        mleo: { m: 4600, l: 1550, e: 450, o: 800, conf: '97%' },
        vendorQuotes: {
          'VND-001': { initialRate: 8600, revisedRate: null },
          'VND-003': { initialRate: 9100, revisedRate: null },
          'VND-007': { initialRate: 8850, revisedRate: null }
        }
      }
    ]
  }
};

const MASTER_VENDORS = [
  { id: 'VND-001', name: 'Vendor 1', category: 'INTERIOR', rating: 4.9, isRateCard: true, city: 'Mumbai', leadTime: '12-15 Days' },
  { id: 'VND-002', name: 'Vendor 2', category: 'INTERIOR', rating: 4.8, isRateCard: true, city: 'Pune', leadTime: '10-14 Days' },
  { id: 'VND-003', name: 'Vendor 3', category: 'INTERIOR', rating: 4.3, isRateCard: false, city: 'Ahmedabad', leadTime: '18-20 Days' },
  { id: 'VND-004', name: 'Vendor 4', category: 'INTERIOR', rating: 3.9, isRateCard: false, city: 'Thane', leadTime: '20-25 Days' },
  { id: 'VND-005', name: 'Vendor 5', category: 'INTERIOR', rating: 4.7, isRateCard: true, city: 'Noida', leadTime: '12-14 Days' },
  { id: 'VND-007', name: 'Vendor 7', category: 'INTERIOR', rating: 4.8, isRateCard: true, city: 'Bengaluru', leadTime: '10-12 Days' },
  { id: 'VND-011', name: 'Vendor 11', category: 'CIVIL', rating: 4.9, isRateCard: true, city: 'Navi Mumbai', leadTime: '3-5 Days' },
  { id: 'VND-012', name: 'Vendor 12', category: 'CIVIL', rating: 4.7, isRateCard: true, city: 'Thane', leadTime: '4-6 Days' },
  { id: 'VND-013', name: 'Vendor 13', category: 'CIVIL', rating: 4.1, isRateCard: false, city: 'Panvel', leadTime: '7-10 Days' },
  { id: 'VND-014', name: 'Vendor 14', category: 'MEP', rating: 4.9, isRateCard: true, city: 'Mumbai', leadTime: '15-20 Days' },
  { id: 'VND-015', name: 'Vendor 15', category: 'MEP', rating: 4.8, isRateCard: true, city: 'Mumbai', leadTime: '14-18 Days' },
  { id: 'VND-016', name: 'Vendor 16', category: 'MEP', rating: 4.2, isRateCard: false, city: 'Pune', leadTime: '20-25 Days' }
];

export const CategoryManagerHub: React.FC<{ onRouteToPPO: () => void }> = ({ onRouteToPPO }) => {
  const [prsData, setPrsData] = useState<Record<string, PRData>>(INITIAL_PRS_DATA);
  const [activePRId, setActivePRId] = useState<string>('PR-2026-0005');
  const [activeTab, setActiveTab] = useState<'rfq' | 'ratecard' | 'commercial' | 'aicost' | 'negotiation' | 'ppogen'>('rfq');
  
  const currentPR = prsData[activePRId] || prsData['PR-2026-0005'];
  const [rfqVendors, setRfqVendors] = useState<string[]>(currentPR.nominatedVendors);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // MLEO Breakdown Modal State
  const [selectedMLEOItem, setSelectedMLEOItem] = useState<BOQItemWithMLEO | null>(null);
  const [isMLEOModalOpen, setIsMLEOModalOpen] = useState<boolean>(false);

  // Non-L1 Justification Modal State
  const [isNonL1ModalOpen, setIsNonL1ModalOpen] = useState<boolean>(false);
  const [pendingAwardVendorId, setPendingAwardVendorId] = useState<string | null>(null);
  const [nonL1ReasonCategory, setNonL1ReasonCategory] = useState<string>('Lead Time / Immediate Delivery Urgency');
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
  const [counterOfferRemarks, setCounterOfferRemarks] = useState<string>('Reference AI cost model on granite & plywood. Volume rate requested with 45-day credit terms.');
  const [negRound, setNegRound] = useState<number>(1);
  const [negSavings, setNegSavings] = useState<{ amount: number; pct: string }>({ amount: 0, pct: '0.0' });
  const [isBafoLocked, setIsBafoLocked] = useState<boolean>(false);
  const [hasReceived2ndQuote, setHasReceived2ndQuote] = useState<boolean>(false);

  const openMLEOModal = (item: BOQItemWithMLEO) => {
    setSelectedMLEOItem(item);
    setIsMLEOModalOpen(true);
  };

  const closeMLEOModal = () => {
    setSelectedMLEOItem(null);
    setIsMLEOModalOpen(false);
  };

  const applyLineShouldCostToNegotiation = () => {
    const benchTot = currentPR.items.reduce((acc, it) => acc + (it.qty * it.benchmark), 0);
    setCounterOfferInput(Math.round(benchTot * 1.04));
    closeMLEOModal();
  };

  const selectPR = (prId: string) => {
    setActivePRId(prId);
    const pr = prsData[prId];
    if (pr) {
      setRfqVendors([...pr.nominatedVendors]);
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

  const toggleVendorSelection = (vid: string) => {
    if (rfqVendors.includes(vid)) {
      setRfqVendors(rfqVendors.filter(item => item !== vid));
    } else {
      setRfqVendors([...rfqVendors, vid]);
    }
  };

  const addAllRateCard = () => {
    const matching = MASTER_VENDORS.filter(v => v.category === currentPR.categoryMajor && v.isRateCard).map(v => v.id);
    const merged = Array.from(new Set([...rfqVendors, ...matching]));
    setRfqVendors(merged);
  };

  const resetToRaiser = () => {
    setRfqVendors([...currentPR.nominatedVendors]);
  };

  const handleLineCounterRateChange = (itemCode: string, newRate: number) => {
    const updated = { ...lineCounterRates, [itemCode]: newRate };
    setLineCounterRates(updated);

    let totAmt = 0;
    currentPR.items.forEach(it => {
      const r = updated[it.code] !== undefined ? updated[it.code] : Math.round(it.benchmark * 1.04);
      totAmt += it.qty * r;
    });
    setCounterOfferInput(Math.round(totAmt));
  };

  const handleDispatchVendorWiseOffer = (targetVid?: string) => {
    const vid = targetVid || selectedOfferVendorId;
    setSelectedOfferVendorId(vid);
    setNegRound(1.5);
  };

  const handleSimulate2ndQuote = () => {
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
          const targetRate = lineCounterRates[it.code] !== undefined ? lineCounterRates[it.code] : Math.round(it.benchmark * 1.04);
          const reductionRatio = targetRate / q.initialRate;
          const discountedRate = Math.round(q.initialRate * Math.min(1.0, Math.max(0.85, reductionRatio * 1.02)));
          vendorQuotes[vid] = {
            initialRate: q.initialRate,
            revisedRate: discountedRate
          };
        });
        return {
          ...it,
          vendorQuotes
        };
      });
      setPrsData(updatedPRs);
    }

    let initialTotal = 0;
    targetVendors.forEach(vid => {
      currentPR.items.forEach(it => {
        const q = it.vendorQuotes && it.vendorQuotes[vid] ? it.vendorQuotes[vid].initialRate : it.benchmark * 1.15;
        initialTotal += it.qty * q;
      });
    });

    const savings = Math.max(0, Math.round(initialTotal - counterOfferInput));
    const pct = initialTotal > 0 ? ((savings / initialTotal) * 100).toFixed(1) : '8.5';
    setNegSavings({ amount: savings, pct });
  };

  const handleAcceptBafo = () => {
    setIsBafoLocked(true);
  };

  // Direct PPO Award Handler
  const initiatePPOAward = (vendorId: string, isNonL1: boolean) => {
    if (!isNonL1) {
      executePPOAward(vendorId, false, undefined);
    } else {
      setPendingAwardVendorId(vendorId);
      setIsNonL1ModalOpen(true);
    }
  };

  const confirmNonL1Award = () => {
    if (!nonL1JustificationText.trim()) {
      alert('Please enter an operational justification note for Non-L1 award.');
      return;
    }
    if (pendingAwardVendorId) {
      executePPOAward(pendingAwardVendorId, true, {
        category: nonL1ReasonCategory,
        text: nonL1JustificationText.trim()
      });
    }
    setIsNonL1ModalOpen(false);
    setPendingAwardVendorId(null);
  };

  const executePPOAward = (vendorId: string, isNonL1: boolean, justification?: NonL1Justification) => {
    const v = MASTER_VENDORS.find(item => item.id === vendorId) || { id: vendorId, name: vendorId };
    const isMethod2 = currentPR.method === 'METHOD_2';

    let netTotal = 0;
    currentPR.items.forEach(it => {
      if (isMethod2) {
        const rc = it.vendorRateCards ? it.vendorRateCards[vendorId] || 65000 : 65000;
        netTotal += it.qty * rc;
      } else {
        const q = it.vendorQuotes && it.vendorQuotes[vendorId] ? (it.vendorQuotes[vendorId].revisedRate || it.vendorQuotes[vendorId].initialRate) : (it.benchmark * 1.15);
        netTotal += it.qty * q;
      }
    });

    const gst = Math.round(netTotal * 0.18);
    const grandTotal = Math.round(netTotal + gst);
    const ppoNumber = `PPO-2026-${currentPR.id.split('-')[2] || '0015'}`;

    setAwardedPPO({
      ppoNumber,
      vendorId: v.id,
      vendorName: v.name,
      isNonL1,
      justification,
      netTotal: Math.round(netTotal),
      gst,
      grandTotal
    });

    setActiveTab('ppogen');
  };

  // Participating Vendors
  const participatingVendors = rfqVendors.map(vid => {
    return MASTER_VENDORS.find(v => v.id === vid) || { id: vid, name: vid, category: currentPR.categoryMajor, rating: 4.8, isRateCard: true, city: 'Mumbai', leadTime: '14 Days' };
  });

  const isMethod2 = currentPR.method === 'METHOD_2';

  // Calculate totals per participating vendor
  const vendorTotals: Record<string, { total: number; initialTotal: number }> = {};
  participatingVendors.forEach(v => {
    let tot = 0;
    let initTot = 0;
    currentPR.items.forEach(it => {
      if (isMethod2) {
        const rc = it.vendorRateCards ? it.vendorRateCards[v.id] || 65000 : 65000;
        tot += it.qty * rc;
        initTot += it.qty * rc;
      } else {
        const q = it.vendorQuotes && it.vendorQuotes[v.id] ? it.vendorQuotes[v.id] : { initialRate: it.benchmark * 1.15, revisedRate: null };
        initTot += it.qty * q.initialRate;
        tot += it.qty * (q.revisedRate || q.initialRate);
      }
    });
    vendorTotals[v.id] = { total: Math.round(tot), initialTotal: Math.round(initTot) };
  });

  const sortedVendorIds = Object.keys(vendorTotals).sort((a, b) => vendorTotals[a].total - vendorTotals[b].total);
  const l1VendorId = sortedVendorIds[0] || (participatingVendors[0] ? participatingVendors[0].id : 'VND-001');
  const l1MinTotal = vendorTotals[l1VendorId] ? vendorTotals[l1VendorId].total : currentPR.estBaseline;
  const l1VendorObj = participatingVendors.find(v => v.id === l1VendorId) || { id: l1VendorId, name: l1VendorId };

  // For Non-L1 modal calculations
  const pendingVendorObj = MASTER_VENDORS.find(v => v.id === pendingAwardVendorId) || { id: pendingAwardVendorId || '', name: pendingAwardVendorId || '' };
  const pendingVendorTotal = pendingAwardVendorId && vendorTotals[pendingAwardVendorId] ? vendorTotals[pendingAwardVendorId].total : 0;
  const nonL1DeltaAmt = pendingVendorTotal - l1MinTotal;
  const nonL1DeltaPct = l1MinTotal > 0 ? ((nonL1DeltaAmt / l1MinTotal) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-brand-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-amber-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                Role 3: Category Manager (Buyer Command Center)
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Active Requisition: {currentPR.id} ({currentPR.category})
              </span>
            </div>
            <h1 className="text-2xl font-black mt-1">Strategic Sourcing, RFQ, Rate Card & AI Cost Studio</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Complete buyer workbench for <strong>Vendor Finalization</strong>: PR Summary, RFQ Float & Supplier Alteration, Master Rate Card Governance, 4-Way Automated CBA Matrix, Multi-Round Negotiation (Counter-Offer & 2nd Quote), and PPO Generation with Audited Exception Governance.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button 
              onClick={() => setActiveTab('rfq')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Raise / Manage RFQ</span>
            </button>
            <button 
              onClick={() => setActiveTab('commercial')}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Scale className="w-4 h-4" />
              <span>4-Way Matrix (CBA)</span>
            </button>
          </div>
        </div>
      </div>

      {/* PR Requisition Selection Queue Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Approved Purchase Requests Queue (Category Manager Ingestion):</span>
          <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">4 PRs Available</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(prsData).map(pr => {
            const isSelected = pr.id === activePRId;
            return (
              <div 
                key={pr.id}
                onClick={() => selectPR(pr.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-amber-50/80 border-amber-400 shadow-md ring-2 ring-amber-300' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-black text-xs text-slate-900">{pr.id}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${pr.methodBadgeClass}`}>
                    {pr.method.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{pr.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{pr.project}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">Est: ₹ {pr.estBaseline.toLocaleString()}</span>
                  <span className="font-bold text-emerald-700">{pr.items.length} Line Items</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected PR Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-black bg-brand-900 text-white px-2 py-0.5 rounded">{currentPR.id}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${currentPR.methodBadgeClass}`}>{currentPR.methodName}</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Project Head Approved ✓</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1.5">{currentPR.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Project: <strong>{currentPR.project}</strong> • Cost Center: <strong>{currentPR.costCenter}</strong> • Raised By: <strong>{currentPR.raiser}</strong></p>
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

        {/* PR Delivery & Nominated Vendors */}
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
            <span className="font-bold text-amber-300 uppercase text-[10px] block">PR Raiser Nominated Suppliers (Step 4)</span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {currentPR.nominatedVendors.map(vid => {
                const v = MASTER_VENDORS.find(item => item.id === vid) || { id: vid, name: vid, rating: 4.8, isRateCard: true };
                return (
                  <span key={vid} className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold border ${v.isRateCard ? 'bg-emerald-900/60 text-emerald-200 border-emerald-500/40' : 'bg-sky-900/60 text-sky-200 border-sky-500/40'}`}>
                    <span>{v.isRateCard ? '🟢' : '🔵'}</span>
                    <span>{v.name} ({v.id})</span>
                    <span className="text-amber-400 text-[10px]">★{v.rating.toFixed(1)}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Buyer Functionality Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('rfq')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'rfq' ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>1. RFQ & Vendor Tender Management</span>
          </button>
          <button
            onClick={() => setActiveTab('ratecard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'ratecard' ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>2. Master Rate Card Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('commercial')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'commercial' ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>3. 4-Way Commercial Matrix & CBA</span>
          </button>
          <button
            onClick={() => setActiveTab('aicost')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'aicost' ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>4. AI Cost Benchmarking & MLEO</span>
          </button>
          <button
            onClick={() => setActiveTab('negotiation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'negotiation' ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquareDiff className="w-4 h-4" />
            <span>5. Vendor Negotiation Hub</span>
          </button>
          <button
            onClick={() => setActiveTab('ppogen')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'ppogen' ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>6. PPO Proposal & Routing</span>
          </button>
        </div>

        {/* Tab 1: RFQ Management & Alter Suppliers */}
        {activeTab === 'rfq' && (
          <div className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-amber-950 text-sm">Active RFQ: RFQ-2026-{currentPR.id.split('-')[2]}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-mono font-bold text-[10px]">Linked PR: {currentPR.id}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Tender Circulated ✓</span>
                </div>
                <p className="text-amber-800 mt-1">Inviting nominated suppliers for competitive electronic quotation.</p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-300">
                  {rfqVendors.length} of {rfqVendors.length} Bids Received
                </span>
              </div>
            </div>

            {/* CM Supplier Alteration Studio */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-sky-600" />
                    <span>Category Manager Supplier Review & Alteration Studio</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Vendors initially nominated by PR Raiser (Step 4) are loaded below. CM can add more suppliers or alter circulation list.</p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button onClick={resetToRaiser} className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold text-[11px] border border-slate-300 rounded-lg bg-white shadow-sm">
                    ↺ Reset to Raiser Selection
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

                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full text-left bg-white border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-800 shadow-sm flex items-center justify-between hover:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <div className="flex items-center space-x-2 overflow-hidden flex-1">
                      {rfqVendors.slice(0, 3).map(vid => {
                        const v = MASTER_VENDORS.find(item => item.id === vid) || { id: vid, name: vid, isRateCard: false };
                        return (
                          <span key={vid} className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${v.isRateCard ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-sky-50 text-sky-900 border-sky-300'}`}>
                            <span>{v.isRateCard ? '🟢' : '🔵'}</span>
                            <span>{v.name}</span>
                          </span>
                        );
                      })}
                      {rfqVendors.length > 3 && <span className="text-xs font-bold text-slate-600">+{rfqVendors.length - 3} more</span>}
                    </div>
                    <div className="flex items-center space-x-2 shrink-0 ml-2">
                      <span className="text-[11px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">{rfqVendors.length} selected</span>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-30 max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {MASTER_VENDORS.filter(v => v.category === currentPR.categoryMajor).map(v => {
                        const isChecked = rfqVendors.includes(v.id);
                        const isNominatedByRaiser = currentPR.nominatedVendors.includes(v.id);
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
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-900 text-xs font-mono">{v.name} ({v.id})</span>
                                {isNominatedByRaiser && <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-purple-100 text-purple-900 border border-purple-300">★ Raiser Nominated</span>}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.isRateCard ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-sky-100 text-sky-900 border border-sky-300'}`}>
                                  {v.isRateCard ? '🟢 Rate Card' : '🔵 Non-Rate Card'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="text-amber-500 font-bold">★ {v.rating.toFixed(1)}</span>
                              <span className="text-slate-400 font-mono">{v.leadTime}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selected Chips */}
                <div className="flex flex-wrap gap-2 items-center min-h-[36px] p-2.5 bg-white rounded-xl border border-slate-200">
                  {rfqVendors.map(vid => {
                    const v = MASTER_VENDORS.find(item => item.id === vid) || { id: vid, name: vid, rating: 4.8, isRateCard: true };
                    const isNominatedByRaiser = currentPR.nominatedVendors.includes(vid);
                    return (
                      <div key={vid} className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${v.isRateCard ? 'bg-emerald-100 text-emerald-950 border-emerald-300' : 'bg-sky-100 text-sky-950 border-sky-300'}`}>
                        <span>{v.isRateCard ? '🟢' : '🔵'}</span>
                        <span>{v.name} ({v.id})</span>
                        {isNominatedByRaiser && <span className="text-[9px] bg-purple-200 text-purple-950 px-1 py-0.2 rounded font-extrabold">PR Raiser</span>}
                        <span className="text-amber-600 font-mono text-[11px]">★ {v.rating.toFixed(1)}</span>
                        <button onClick={() => toggleVendorSelection(vid)} className="ml-1 text-slate-500 hover:text-rose-600 font-black">✕</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quotation Comparative Statement */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center">
                <Users className="w-4 h-4 text-sky-600 mr-1.5" />
                Vendor Quotation Comparative Statement (L1 / L2 / L3 Rankings):
              </h4>
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 font-bold border-b text-slate-800">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">Vendor</th>
                      <th className="p-3">Vendor Type</th>
                      <th className="p-3 text-right">Quoted Net Amount (₹)</th>
                      <th className="p-3 text-center">Variance vs Est Baseline</th>
                      <th className="p-3">Lead Time</th>
                      <th className="p-3">Compliance</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sortedVendorIds.slice(0, 3).map((vid, idx) => {
                      const v = MASTER_VENDORS.find(item => item.id === vid) || { id: vid, name: `Vendor ${idx + 1}`, isRateCard: idx === 0, leadTime: '15 Days' };
                      const data = vendorTotals[vid] || { total: currentPR.estBaseline, initialTotal: currentPR.estBaseline };
                      const varPct = (((data.total - currentPR.estBaseline) / currentPR.estBaseline) * 100).toFixed(1);

                      return (
                        <tr key={vid} className={idx === 0 ? 'bg-emerald-50/40' : ''}>
                          <td className="p-3 font-bold text-emerald-700">
                            <span className={`px-2 py-0.5 rounded font-bold font-mono ${idx === 0 ? 'bg-emerald-200 text-emerald-950 font-black' : 'bg-slate-200 text-slate-800'}`}>L{idx + 1}</span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">{v.name} ({v.id})</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.isRateCard ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-sky-100 text-sky-900 border border-sky-300'}`}>
                              {v.isRateCard ? '🟢 Rate Card' : '🔵 Non-Rate Card'}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-950">₹ {data.total.toLocaleString()}</td>
                          <td className={`p-3 text-center font-bold font-mono ${parseFloat(varPct) >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {parseFloat(varPct) >= 0 ? '+' : ''}{varPct}%
                          </td>
                          <td className="p-3">{v.leadTime}</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Compliant</span></td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5 flex-wrap gap-1">
                              {idx === 0 ? (
                                <button 
                                  onClick={() => initiatePPOAward(vid, false)} 
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm flex items-center space-x-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Award PPO (L1) →</span>
                                </button>
                              ) : (
                                <button 
                                  onClick={() => initiatePPOAward(vid, true)} 
                                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-sm flex items-center space-x-1"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
                                  <span>Award PPO (Non-L1) →</span>
                                </button>
                              )}
                              <button 
                                onClick={() => setActiveTab('commercial')} 
                                className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs shadow-sm"
                                title="View in 4-Way CBA Matrix"
                              >
                                CBA Matrix →
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Master Rate Card Studio & Multi-Vendor Comparison (Method 2) */}
        {activeTab === 'ratecard' && (
          <div className="space-y-5 pt-2">
            {isMethod2 ? (
              // Method 2 Vendor Rate Card Comparison (Vendor 14 vs Vendor 15)
              <div className="space-y-4">
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase bg-teal-200 text-teal-900 px-2 py-0.5 rounded font-mono">Method 2 Corporate Standard Template</span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">Multi-Vendor Contracted Rate Card Comparison Matrix</h4>
                      <p className="text-xs text-slate-600">Side-by-side comparison of contracted schedule rates agreed with Tier-1 MEP OEM partners.</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Overall Lowest Rate Card (L1)</span>
                      <span className="text-sm font-mono font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 inline-block mt-0.5">Vendor 14 (VND-014)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 bg-white rounded-xl border border-emerald-300 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">🟢 Vendor 14 (RC-2026-MEP-01)</span>
                        <p className="text-[11px] text-slate-500">Contract: Valid till Dec 2026 • 15 Days Lead Time</p>
                      </div>
                      <span className="text-base font-mono font-black text-emerald-700">₹ {(vendorTotals['VND-014'] ? vendorTotals['VND-014'].total : 656350).toLocaleString()}</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">🟢 Vendor 15 (RC-2026-MEP-02)</span>
                        <p className="text-[11px] text-slate-500">Contract: Valid till Jan 2027 • 14 Days Lead Time</p>
                      </div>
                      <span className="text-base font-mono font-black text-slate-800">₹ {(vendorTotals['VND-015'] ? vendorTotals['VND-015'].total : 665800).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 font-bold border-b text-slate-800">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Specification & Item Code</th>
                        <th className="p-3 text-right">Qty & UOM</th>
                        <th className="p-3 text-right bg-blue-50/80 font-mono text-blue-950">Best Historical Price (₹)</th>
                        <th className="p-3 text-right bg-purple-50/80 font-mono">AI Should-Cost</th>
                        <th className="p-3 text-right bg-emerald-50/80 font-mono text-emerald-950">Vendor 14 Rate Card</th>
                        <th className="p-3 text-right bg-slate-50 font-mono text-slate-800">Vendor 15 Rate Card</th>
                        <th className="p-3 text-center font-mono">Rate Delta</th>
                        <th className="p-3 text-center">L1 Winner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {currentPR.items.map((it, idx) => {
                        const rc14 = it.vendorRateCards ? it.vendorRateCards['VND-014'] || 65000 : 65000;
                        const rc15 = it.vendorRateCards ? it.vendorRateCards['VND-015'] || 68500 : 68500;
                        const amt14 = it.qty * rc14;
                        const amt15 = it.qty * rc15;
                        const isL1_14 = rc14 <= rc15;
                        const delta = Math.abs(rc14 - rc15);

                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 text-slate-400">{idx + 1}</td>
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block font-sans">{it.desc}</span>
                              <span className="text-[10px] text-sky-700">{it.code}</span>
                            </td>
                            <td className="p-3 text-right font-bold">{it.qty} {it.uom}</td>
                            <td className="p-3 text-right bg-blue-50/50 text-blue-950 font-bold">
                              <div>₹ {(it.bestHistoricalPrice || it.rateCard || 65000).toLocaleString()}</div>
                              <div className="text-[9px] text-slate-400 font-normal font-sans">{it.prevPo || 'PO-2025-0810'}</div>
                            </td>
                            <td className="p-3 text-right bg-purple-50/50 text-purple-900 font-bold">₹ {it.benchmark.toLocaleString()}</td>
                            <td className={`p-3 text-right ${isL1_14 ? 'bg-emerald-50 text-emerald-950 font-black border-2 border-emerald-300' : 'bg-slate-50 text-slate-800'}`}>
                              <div>₹ {rc14.toLocaleString()} / {it.uom}</div>
                              <div className="text-[10px] text-slate-500 font-normal">Tot: ₹ {amt14.toLocaleString()}</div>
                              {isL1_14 && <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-200 text-emerald-900">★ L1 RATE</span>}
                            </td>
                            <td className={`p-3 text-right ${!isL1_14 ? 'bg-emerald-50 text-emerald-950 font-black border-2 border-emerald-300' : 'bg-slate-50 text-slate-800'}`}>
                              <div>₹ {rc15.toLocaleString()} / {it.uom}</div>
                              <div className="text-[10px] text-slate-500 font-normal">Tot: ₹ {amt15.toLocaleString()}</div>
                              {!isL1_14 && <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-200 text-emerald-900">★ L1 RATE</span>}
                            </td>
                            <td className="p-3 text-center font-bold text-slate-700">₹ {delta.toLocaleString()}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isL1_14 ? 'bg-emerald-100 text-emerald-900' : 'bg-sky-100 text-sky-900'}`}>
                                {isL1_14 ? 'Vendor 14 L1' : 'Vendor 15 L1'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-100 font-black border-t-2 border-slate-300 text-slate-900 font-mono">
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-sans uppercase">Total Package Commitment:</td>
                        <td className="p-3 text-right text-blue-950 bg-blue-100/70 font-bold">₹ {currentPR.items.reduce((acc, it) => acc + (it.qty * (it.bestHistoricalPrice || it.rateCard || 65000)), 0).toLocaleString()}</td>
                        <td className="p-3 text-right text-purple-900 font-bold">₹ {currentPR.items.reduce((acc, it) => acc + (it.qty * it.benchmark), 0).toLocaleString()}</td>
                        <td className="p-3 text-right text-emerald-950 bg-emerald-100/70 font-black">₹ {(vendorTotals['VND-014'] ? vendorTotals['VND-014'].total : 656350).toLocaleString()}</td>
                        <td className="p-3 text-right text-slate-900 font-bold">₹ {(vendorTotals['VND-015'] ? vendorTotals['VND-015'].total : 665800).toLocaleString()}</td>
                        <td className="p-3 text-center text-emerald-700 font-bold">₹ {Math.abs((vendorTotals['VND-014']?.total || 656350) - (vendorTotals['VND-015']?.total || 665800)).toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <button onClick={() => initiatePPOAward('VND-014', false)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] shadow-sm">
                            Direct Award L1 →
                          </button>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              // Standard Tenant Rate Card
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Tenant Contracted Master Rate Cards ({currentPR.category})</h4>
                    <p className="text-[11px] text-slate-500">Agreed schedule of rates with empanelled vendors for {currentPR.project}.</p>
                  </div>
                  <span className="text-xs font-mono bg-blue-50 text-blue-800 font-bold px-2.5 py-1 rounded-lg border border-blue-200">Active Rate Agreement: RC-2026-{currentPR.categoryMajor}-01</span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 font-bold border-b text-slate-800">
                      <tr>
                        <th className="p-3">Item Code</th>
                        <th className="p-3">Specification</th>
                        <th className="p-3 w-20">UOM</th>
                        <th className="p-3 w-36 text-right bg-blue-50 font-mono font-bold text-blue-950">Best Historical Price (₹)</th>
                        <th className="p-3 w-40 text-left font-sans">Previous Award Reference</th>
                        <th className="p-3 w-32 text-right font-mono">AI Benchmark (₹)</th>
                        <th className="p-3 w-28 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {currentPR.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-bold text-sky-800">{it.code}</td>
                          <td className="p-3 font-sans font-semibold text-slate-800">{it.desc}</td>
                          <td className="p-3 font-bold">{it.uom}</td>
                          <td className="p-3 text-right bg-blue-50/60 font-bold text-blue-950">₹ {(it.bestHistoricalPrice || it.rateCard).toLocaleString()}</td>
                          <td className="p-3 font-sans text-xs text-slate-600">{it.prevPo || 'PO-2025-0912 (Godrej Woods)'}</td>
                          <td className="p-3 text-right font-bold text-emerald-700">₹ {it.benchmark.toLocaleString()}</td>
                          <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">ACTIVE</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: 4-Way Commercial Matrix & CBA with Line-Item Rate, Amount, MLEO & PPO Direct Award */}
        {activeTab === 'commercial' && (
          <div className="space-y-6 pt-2">
            
            {/* Top 4 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-[10px] font-bold uppercase text-blue-700">1. Best Historical Price Target</span>
                <p className="text-lg font-black text-blue-950 mt-1 font-mono">₹ {currentPR.items.reduce((acc, it) => acc + (it.qty * (it.bestHistoricalPrice || it.rateCard)), 0).toLocaleString()}</p>
              </div>
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold uppercase text-amber-700">2. L1 Lowest Bid ({l1VendorObj.name})</span>
                <p className="text-lg font-black text-amber-950 mt-1 font-mono">₹ {l1MinTotal.toLocaleString()}</p>
                {(() => {
                  const histTot = currentPR.items.reduce((acc, it) => acc + (it.qty * (it.bestHistoricalPrice || it.rateCard)), 0);
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
                  const v = participatingVendors.find(item => item.id === vid) || { id: vid, name: vid, rating: 4.8, isRateCard: true, leadTime: '14 Days' };
                  const data = vendorTotals[vid] || { total: l1MinTotal, initialTotal: l1MinTotal };
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
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 font-bold border-b text-slate-800">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3 w-56">Item Code & Specification</th>
                    <th className="p-3 text-right w-20">Qty & UOM</th>
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
                      participatingVendors.map((v, idx) => {
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
                <tbody className="divide-y divide-slate-200 font-mono">
                  {currentPR.items.map((it, idx) => {
                    const histRate = it.bestHistoricalPrice || it.rateCard || 0;
                    const histAmt = it.qty * histRate;
                    const benchAmt = it.qty * it.benchmark;

                    if (isMethod2) {
                      const rc14 = it.vendorRateCards ? it.vendorRateCards['VND-014'] || 65000 : 65000;
                      const rc15 = it.vendorRateCards ? it.vendorRateCards['VND-015'] || 68500 : 68500;
                      const amt14 = it.qty * rc14;
                      const amt15 = it.qty * rc15;
                      const isL1_14 = rc14 <= rc15;

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
                            <div className="text-[9px] text-slate-400 font-normal font-sans">{it.prevPo || 'PO-2025-0810'}</div>
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
                          <td className={`p-3 text-right ${isL1_14 ? 'bg-emerald-50/80 text-emerald-950 font-black' : 'bg-slate-50/50 text-slate-800 font-bold'}`}>
                            <div>₹ {rc14.toLocaleString()}</div>
                            {isL1_14 && <span className="block text-[9px] font-bold text-emerald-800">★ L1 Rate</span>}
                          </td>
                          <td className={`p-3 text-right border-r border-slate-200 ${isL1_14 ? 'bg-emerald-50/80 text-emerald-950 font-black' : 'bg-slate-50/50 text-slate-800 font-bold'}`}>
                            ₹ {amt14.toLocaleString()}
                          </td>
                          <td className={`p-3 text-right ${!isL1_14 ? 'bg-emerald-50/80 text-emerald-950 font-black' : 'bg-slate-50/50 text-slate-800 font-bold'}`}>
                            <div>₹ {rc15.toLocaleString()}</div>
                            {!isL1_14 && <span className="block text-[9px] font-bold text-emerald-800">★ L1 Rate</span>}
                          </td>
                          <td className={`p-3 text-right border-r border-slate-200 ${!isL1_14 ? 'bg-emerald-50/80 text-emerald-950 font-black' : 'bg-slate-50/50 text-slate-800 font-bold'}`}>
                            ₹ {amt15.toLocaleString()}
                          </td>
                          <td className="p-3 text-center">
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${isL1_14 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-sky-100 text-sky-900 border border-sky-300'} font-mono`}>
                              {isL1_14 ? '★ L1: Vendor 14' : '★ L1: Vendor 15'}
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                              {isL1_14 ? `L2: Vendor 15 (+₹${(rc15 - rc14).toLocaleString()})` : `L2: Vendor 14 (+₹${(rc14 - rc15).toLocaleString()})`}
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
                      const q = it.vendorQuotes && it.vendorQuotes[v.id] ? it.vendorQuotes[v.id] : { initialRate: it.benchmark * 1.15, revisedRate: null };
                      const effectiveRate = q.revisedRate || q.initialRate;
                      return {
                        vendorId: v.id,
                        vendorName: v.name,
                        initialRate: q.initialRate,
                        revisedRate: q.revisedRate,
                        effectiveRate,
                        amount: it.qty * effectiveRate
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
                        <td className="p-3 text-right font-bold text-slate-800">{it.qty} {it.uom}</td>
                        <td className="p-3 text-right bg-blue-50/40 border-l border-blue-100 font-bold text-blue-950">
                          <div>₹ {histRate.toLocaleString()}</div>
                          <div className="text-[9px] text-slate-400 font-normal font-sans">{it.prevPo || 'PO-2025-0912'}</div>
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
                          const vData = vendorLineRates.find(item => item.vendorId === v.id) || vendorLineRates[0];
                          const isItemL1 = v.id === lineL1.vendorId;
                          const isRevised = vData.revisedRate !== null && vData.revisedRate !== undefined;

                          return (
                            <React.Fragment key={v.id}>
                              <td className={`p-3 text-right font-mono ${isItemL1 ? 'bg-emerald-50/70 font-black text-emerald-950' : 'text-slate-800 font-bold'}`}>
                                {isRevised ? (
                                  <div>
                                    <div className="line-through text-[10px] text-slate-400">₹ {vData.initialRate.toLocaleString()}</div>
                                    <div className="text-xs text-emerald-700 font-black">₹ {vData.revisedRate?.toLocaleString()}</div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-900">₹ {vData.initialRate.toLocaleString()}</div>
                                )}
                                {isItemL1 && <span className="inline-block px-1 py-0.2 rounded text-[8px] font-black bg-emerald-200 text-emerald-900">★ L1 Rate</span>}
                              </td>
                              <td className={`p-3 text-right font-mono border-r border-slate-200 ${isItemL1 ? 'bg-emerald-50/70 font-black text-emerald-950' : 'text-slate-800 font-bold'}`}>
                                <div className={`text-xs ${isItemL1 ? 'text-emerald-950 font-black' : 'text-slate-900 font-bold'}`}>
                                  ₹ {Math.round(vData.amount).toLocaleString()}
                                </div>
                                {isRevised && (
                                  <span className="text-[9px] text-emerald-600">
                                    (-{(((vData.initialRate - (vData.revisedRate || 0)) / vData.initialRate) * 100).toFixed(1)}%)
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
                              L2: {lineL2.vendorName} (+{(((lineL2.effectiveRate - lineL1.effectiveRate) / lineL1.effectiveRate) * 100).toFixed(1)}%)
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
                      ₹ {Math.round(currentPR.items.reduce((acc, it) => acc + (it.bestHistoricalPrice || it.rateCard || 0), 0)).toLocaleString()}
                    </td>
                    <td className="p-3 text-right bg-blue-100 text-blue-950 font-black border-r border-blue-200">
                      <div>₹ {Math.round(currentPR.items.reduce((acc, it) => acc + (it.qty * (it.bestHistoricalPrice || it.rateCard || 0)), 0)).toLocaleString()}</div>
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
                          const t14 = vendorTotals['VND-014']?.total || 656350;
                          const t15 = vendorTotals['VND-015']?.total || 665800;
                          const r14 = currentPR.items.reduce((acc, it) => acc + (it.vendorRateCards?.['VND-014'] || 65000), 0);
                          const r15 = currentPR.items.reduce((acc, it) => acc + (it.vendorRateCards?.['VND-015'] || 68500), 0);
                          const isL1_14 = t14 <= t15;

                          return (
                            <>
                              <td className={`p-3 text-right ${isL1_14 ? 'bg-emerald-100 text-emerald-950 font-bold' : 'bg-slate-100 text-slate-900'}`}>
                                ₹ {Math.round(r14).toLocaleString()}
                              </td>
                              <td className={`p-3 text-right border-r ${isL1_14 ? 'bg-emerald-100 text-emerald-950 font-black' : 'bg-slate-100 text-slate-900 font-bold'}`}>
                                <div>₹ {t14.toLocaleString()}</div>
                                <div className={`text-[9px] ${isL1_14 ? 'text-emerald-800 font-bold' : 'text-slate-600'} font-sans`}>
                                  Rank: {isL1_14 ? 'L1 (Lowest)' : 'L2'}
                                </div>
                              </td>
                              <td className={`p-3 text-right ${!isL1_14 ? 'bg-emerald-100 text-emerald-950 font-bold' : 'bg-slate-100 text-slate-900'}`}>
                                ₹ {Math.round(r15).toLocaleString()}
                              </td>
                              <td className={`p-3 text-right border-r ${!isL1_14 ? 'bg-emerald-100 text-emerald-950 font-black' : 'bg-slate-100 text-slate-900 font-bold'}`}>
                                <div>₹ {t15.toLocaleString()}</div>
                                <div className={`text-[9px] ${!isL1_14 ? 'text-emerald-800 font-bold' : 'text-slate-600'} font-sans`}>
                                  Rank: {!isL1_14 ? 'L1 (Lowest)' : 'L2'}
                                </div>
                              </td>
                              <td className="p-3 text-center bg-slate-100 font-sans">
                                <div className="text-xs font-bold text-emerald-800">L1: {isL1_14 ? 'Vendor 14' : 'Vendor 15'}</div>
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
                          const data = vendorTotals[v.id] || { total: 0, initialTotal: 0 };
                          const isOverallL1 = v.id === l1VendorId;
                          const rankNum = sortedVendorIds.indexOf(v.id) + 1;
                          const diffOverL1 = data.total - l1MinTotal;
                          const diffPct = l1MinTotal > 0 ? ((diffOverL1 / l1MinTotal) * 100).toFixed(1) : '0.0';
                          const totRate = currentPR.items.reduce((acc, it) => {
                            const q = it.vendorQuotes && it.vendorQuotes[v.id] ? it.vendorQuotes[v.id] : { initialRate: it.benchmark * 1.15, revisedRate: null };
                            return acc + (q.revisedRate || q.initialRate);
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
                              const vObj = participatingVendors.find(v => v.id === vid) || { name: vid };
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
                      <span className="text-[9px] uppercase font-bold text-blue-800 block">PR Baseline Terms:</span>
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
                          <div className="text-slate-800 font-bold">V1 Matches PR</div>
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
                      <span className="text-[9px] uppercase font-bold text-blue-800 block">Requisition Target SLA:</span>
                      <div className="font-bold text-slate-900">12 - 15 Days (Target: {currentPR.targetDate || '2026-09-25'})</div>
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
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-900 border border-blue-200">PR Baseline Standard</span>
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
                Machine learning model decomposing every BOQ line item into <strong>Material (M)</strong>, <strong>Labor (L)</strong>, <strong>Equipment (E)</strong>, and <strong>Overheads/Margin (O)</strong> with geographic cost indexing.
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
                      Conf: {it.mleo.conf || '97%'}
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

        {/* Tab 5: Vendor Negotiation Hub (Multi-Round with 2nd Quote) */}
        {activeTab === 'negotiation' && (
          <div className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-900 text-white rounded-xl border border-slate-800 text-xs">
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
                    onClick={handleSimulate2ndQuote} 
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md text-xs flex items-center space-x-1.5 transition-all"
                    title="Simulate vendors responding with 2nd Quote (BAFO)"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
                    <span>Receive 2nd Quote (BAFO)</span>
                  </button>
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
                    Inspect and negotiate commercial unit rates item-by-item against AI Should-Cost targets. Click <strong>MLEO Breakdown</strong> on any line to view detailed Material, Labor, Equipment, and Overheads.
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[11px] font-mono bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-lg font-bold">
                    Interactive Line Item Workbench
                  </span>
                </div>
              </div>

              {/* Item-Wise Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 font-bold border-b text-slate-800">
                    <tr>
                      <th className="p-3 w-10 text-center">#</th>
                      <th className="p-3 w-56">Item Code & Specification</th>
                      <th className="p-3 text-right w-20">Qty & UOM</th>
                      <th className="p-3 text-center bg-purple-50/90 font-mono text-purple-950 border-l border-r border-purple-200">
                        AI Should-Cost Target (₹)
                        <span className="block text-[9px] text-purple-700 font-sans font-normal">MLEO Breakdown</span>
                      </th>
                      {participatingVendors.map(v => (
                        <React.Fragment key={v.id}>
                          <th className="p-3 text-right bg-rose-50/70 font-mono text-rose-950 border-r border-rose-200">
                            {v.name} 1st Quote (₹)
                            <span className="block text-[9px] text-rose-700 font-sans font-normal">Initial Rate & Amount</span>
                          </th>
                          <th className="p-3 text-right bg-emerald-50/70 font-mono text-emerald-950 border-r border-emerald-200">
                            {v.name} 2nd / Latest Quote (₹)
                            <span className="block text-[9px] text-emerald-700 font-sans font-normal">Revised BAFO Rate & Amount</span>
                          </th>
                        </React.Fragment>
                      ))}
                      <th className="p-3 text-right bg-sky-50/90 font-mono text-sky-950 min-w-[210px]">
                        Target Counter Offer (₹)
                        <div className="text-[9px] text-sky-800 font-sans font-normal">Editable Rate & Auto Amount</div>
                        <div className="mt-1 flex items-center justify-end space-x-1 font-sans">
                          <span className="text-[9px] text-slate-500">Offer to:</span>
                          <select 
                            value={selectedOfferVendorId} 
                            onChange={(e) => setSelectedOfferVendorId(e.target.value)}
                            className="bg-white border border-sky-300 rounded text-[9px] px-1 py-0.5 font-bold"
                          >
                            {participatingVendors.map(v => (
                              <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                            <option value="ALL">All Vendors</option>
                          </select>
                          <button 
                            onClick={() => handleDispatchVendorWiseOffer()}
                            className="px-2 py-0.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-[9px] font-bold shadow-xs"
                          >
                            Send Offer →
                          </button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {currentPR.items.map((it, idx) => {
                      const shouldCostAmt = it.qty * it.benchmark;
                      const currentCounterRate = lineCounterRates[it.code] !== undefined ? lineCounterRates[it.code] : Math.round(it.benchmark * 1.04);
                      const currentCounterAmt = it.qty * currentCounterRate;

                      return (
                        <tr key={it.code} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 text-slate-400 font-mono text-center">{idx + 1}</td>
                          <td className="p-3">
                            <span className="font-sans font-bold text-slate-900 block">{it.desc}</span>
                            <span className="font-mono text-sky-800 text-[10px]">{it.code}</span>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-800">{it.qty} {it.uom}</td>
                          <td className="p-3 text-center bg-purple-50/50 border-l border-r border-purple-200">
                            <div className="font-bold text-purple-950">₹ {it.benchmark.toLocaleString()} / {it.uom}</div>
                            <div className="text-[10px] text-purple-800 font-semibold">Tot: ₹ {Math.round(shouldCostAmt).toLocaleString()}</div>
                            <button 
                              onClick={() => {
                                setSelectedMLEOItem(it);
                                setShowMLEOModal(true);
                              }}
                              className="mt-1 px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 rounded-md text-[10px] font-bold shadow-xs inline-flex items-center space-x-1 transition-all"
                            >
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span>MLEO Breakdown</span>
                            </button>
                          </td>

                          {participatingVendors.map(v => {
                            const q = (it.vendorQuotes && it.vendorQuotes[v.id]) ? it.vendorQuotes[v.id] : { initialRate: Math.round(it.benchmark * 1.15), revisedRate: null };
                            const initRate = q.initialRate;
                            const initAmt = it.qty * initRate;
                            const isRevised = q.revisedRate !== null && q.revisedRate !== undefined;
                            const revisedRate = isRevised ? q.revisedRate : null;
                            const revisedAmt = isRevised ? it.qty * (revisedRate || 0) : null;

                            return (
                              <React.Fragment key={v.id}>
                                <td className="p-3 text-right bg-rose-50/30 font-mono text-slate-900 border-r border-slate-200">
                                  <div className="font-bold text-xs">₹ {initRate.toLocaleString()}</div>
                                  <div className="text-[10px] text-rose-700 font-semibold">Amt: ₹ {Math.round(initAmt).toLocaleString()}</div>
                                </td>
                                <td className="p-3 text-right bg-emerald-50/30 font-mono border-r border-slate-200">
                                  {isRevised && revisedRate !== null && revisedAmt !== null ? (
                                    <>
                                      <div className="font-black text-emerald-800 text-xs">₹ {revisedRate.toLocaleString()}</div>
                                      <div className="text-[10px] text-emerald-900 font-bold">Amt: ₹ {Math.round(revisedAmt).toLocaleString()}</div>
                                      <span className="inline-block px-1 py-0.2 rounded text-[8px] font-extrabold bg-emerald-200 text-emerald-900">
                                        (-{(((initRate - revisedRate) / initRate) * 100).toFixed(1)}%)
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px] font-sans">Awaiting 2nd Quote</span>
                                  )}
                                </td>
                              </React.Fragment>
                            );
                          })}

                          <td className="p-3 text-right bg-sky-50/40 font-mono border-l border-sky-200">
                            <div className="flex items-center justify-end space-x-1">
                              <span className="text-slate-400 text-xs">₹</span>
                              <input 
                                type="number" 
                                value={currentCounterRate} 
                                onChange={(e) => handleLineCounterRateChange(it.code, parseFloat(e.target.value) || 0)} 
                                className="w-24 px-2 py-1 border border-sky-300 rounded-lg font-mono font-bold text-xs text-right bg-white text-slate-900 focus:ring-2 focus:ring-sky-400 focus:outline-none shadow-inner" 
                              />
                            </div>
                            <div className="text-[10px] text-sky-800 font-bold mt-1 font-mono">
                              Amt: ₹ {Math.round(currentCounterAmt).toLocaleString()}
                            </div>
                            <div className="mt-1 flex items-center justify-end space-x-1 font-sans">
                              <select 
                                id={`rowOfferVendorSelect_${idx}`} 
                                defaultValue={participatingVendors[0]?.id || 'ALL'}
                                className="bg-white border border-slate-300 rounded text-[9px] p-0.5 font-bold"
                              >
                                {participatingVendors.map(v => (
                                  <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                                <option value="ALL">All Vendors</option>
                              </select>
                              <button 
                                onClick={() => {
                                  const selectEl = document.getElementById(`rowOfferVendorSelect_${idx}`) as HTMLSelectElement;
                                  handleDispatchVendorWiseOffer(selectEl ? selectEl.value : undefined);
                                }} 
                                className="px-1.5 py-0.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-[9px] font-bold shadow-xs" 
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

                        const r = lineCounterRates[it.code] !== undefined ? lineCounterRates[it.code] : Math.round(it.benchmark * 1.04);
                        totCounterRateSum += r;
                        totCounterAmtSum += it.qty * r;

                        participatingVendors.forEach(v => {
                          const q = (it.vendorQuotes && it.vendorQuotes[v.id]) ? it.vendorQuotes[v.id] : { initialRate: Math.round(it.benchmark * 1.15), revisedRate: null };
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
                          <td className="p-3 uppercase font-sans text-center font-bold text-slate-700">TOTALS:</td>
                          <td className="p-3 font-sans font-bold text-slate-900">Summary Across {currentPR.items.length} Items</td>
                          <td className="p-3 text-right font-mono font-bold">{totalQty} Units</td>
                          <td className="p-3 text-center bg-purple-100 text-purple-950 font-bold border-l border-r border-purple-200">
                            <div className="text-xs">₹ {Math.round(totShouldCostRate).toLocaleString()}</div>
                            <div className="text-[10px] font-normal text-purple-800">Tot: ₹ {Math.round(totShouldCostAmt).toLocaleString()}</div>
                          </td>
                          {participatingVendors.map(v => {
                            const tot1 = vTotals1st[v.id];
                            const tot2 = vTotals2nd[v.id];
                            return (
                              <React.Fragment key={v.id}>
                                <td className="p-3 text-right bg-rose-100 text-rose-950 font-bold border-r border-rose-200">
                                  <div className="text-xs">₹ {Math.round(tot1?.rate || 0).toLocaleString()}</div>
                                  <div className="text-[10px] text-rose-800 font-semibold">Tot: ₹ {Math.round(tot1?.amt || 0).toLocaleString()}</div>
                                </td>
                                <td className="p-3 text-right bg-emerald-100 text-emerald-950 font-bold border-r border-emerald-200">
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
                          <td className="p-3 text-right bg-sky-100 text-sky-950 font-black border-l border-sky-200">
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

        {/* Tab 6: PPO Proposal & Routing */}
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
                    <p className="text-amber-900 pl-5"><strong>Category:</strong> {awardedPPO.justification.category} • <strong>Justification:</strong> "{awardedPPO.justification.text}"</p>
                  </div>
                )}

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 font-bold border-b text-slate-800">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Item Code & Specification</th>
                        <th className="p-3 text-right">Qty & UOM</th>
                        <th className="p-3 text-right font-mono">Awarded Rate (₹)</th>
                        <th className="p-3 text-right font-mono">Total Net Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {currentPR.items.map((it, idx) => {
                        let rate = 0;
                        if (isMethod2) {
                          rate = it.vendorRateCards ? it.vendorRateCards[awardedPPO.vendorId] || 65000 : 65000;
                        } else {
                          const q = it.vendorQuotes && it.vendorQuotes[awardedPPO.vendorId] ? (it.vendorQuotes[awardedPPO.vendorId].revisedRate || it.vendorQuotes[awardedPPO.vendorId].initialRate) : (it.benchmark * 1.15);
                          rate = q;
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
                    ← Back to Commercial Matrix
                  </button>
                  <button onClick={onRouteToPPO} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5">
                    <span>Route PPO to Tier 1 Approval Workflow →</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No Vendor Finalized Yet for PPO Drafting</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">Please go to Sub-Tab 3 (4-Way Commercial Matrix) and click "Award & Generate PPO" on your preferred vendor to initialize the PPO proposal.</p>
                <button onClick={() => setActiveTab('commercial')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow">
                  Open 4-Way Commercial Matrix →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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
              <button onClick={() => setIsNonL1ModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">✕</button>
            </div>

            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-600 font-sans">Requisition:</span>
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
                    Confidence: {selectedMLEOItem.mleo?.conf || '98%'} (High Precision)
                  </span>
                  <div className="text-base font-mono font-black text-purple-950 mt-0.5">
                    ₹ {selectedMLEOItem.benchmark.toLocaleString()} / {selectedMLEOItem.uom}
                  </div>
                </div>
              </div>
            </div>

            {/* 4 MLEO Cards Grid */}
            {(() => {
              const m = selectedMLEOItem.mleo?.m || Math.round(selectedMLEOItem.benchmark * 0.56);
              const l = selectedMLEOItem.mleo?.l || Math.round(selectedMLEOItem.benchmark * 0.18);
              const e = selectedMLEOItem.mleo?.e || Math.round(selectedMLEOItem.benchmark * 0.15);
              const o = selectedMLEOItem.mleo?.o || Math.round(selectedMLEOItem.benchmark * 0.11);
              const sum = m + l + e + o;
              const mPct = ((m / sum) * 100).toFixed(1);
              const lPct = ((l / sum) * 100).toFixed(1);
              const ePct = ((e / sum) * 100).toFixed(1);
              const oPct = ((o / sum) * 100).toFixed(1);

              const quotedRate = (selectedMLEOItem.vendorQuotes && selectedMLEOItem.vendorQuotes[l1VendorId]) 
                ? selectedMLEOItem.vendorQuotes[l1VendorId].initialRate 
                : Math.round(selectedMLEOItem.benchmark * 1.20);
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
    </div>
  );
};
