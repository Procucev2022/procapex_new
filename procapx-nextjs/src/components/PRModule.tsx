'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusCircle, 
  UploadCloud, 
  Download, 
  Sparkles, 
  Edit3, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle2, 
  FileSpreadsheet, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  Paperclip, 
  FileText, 
  Building2, 
  MapPin, 
  Layers,
  FileUp,
  Star,
  CreditCard,
  Store,
  Users,
  Truck,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';

interface PRModuleProps {
  onSelectPRForBOQ?: (prId: string) => void;
  onNavigateToBOQ?: (prId: string) => void;
  onOpenNewPRModal?: () => void;
}

interface RequesterBOQItem {
  code: string;
  desc: string;
  uom: string;
  qty: number;
}

interface AttachedDoc {
  name: string;
  type: string;
  size: string;
  date: string;
  status: string;
}

interface VendorItem {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  region: string;
  regionLabel: string;
  rating: number;
  reviewsCount: number;
  isRateCard: boolean;
  rateCardCode: string | null;
  rateCardStatus: string;
  contactPerson: string;
  gstin: string;
  city: string;
  leadTime: string;
  badgeText: string;
  capacity: string;
}

const DEFAULT_COUNTER_ITEMS: RequesterBOQItem[] = [
  { code: 'CNT-TOP-GRN20', desc: '20mm thick Polished Jet Black Granite / Solid Surface Countertop with full bullnose edge profiling, sink/cable cutouts & waterproof ply underlay', uom: 'Sqm', qty: 12.5 },
  { code: 'CNT-PLY-BWP18', desc: 'Marine Grade Boiling Water Proof (BWP) Plywood 18mm thick (IS 710) with anti-termite and borer treatment for counter internal carcass & framing', uom: 'Sqm', qty: 38.0 },
  { code: 'CNT-LAM-1MM', desc: '1.0mm thick High Pressure Textured / Suede Finish Decorative Laminate on visible external fascias and drawers of Counter Elevation D', uom: 'Sqm', qty: 24.0 },
  { code: 'CNT-HDW-SOFT', desc: 'Joinery & Hardware Package: Soft-close 3D adjustable concealed hinges, 45kg telescopic slides, and SS 304 profile handles', uom: 'Set', qty: 14.0 },
  { code: 'CNT-LED-PROF', desc: '12V DC Warm White (3000K) High-CRI LED Strip Light in recessed slim aluminium channel with frosted diffuser under counter apron', uom: 'Rmt', qty: 16.0 },
  { code: 'CNT-SKT-SS304', desc: '100mm high Stainless Steel Grade 304 Brushed Finish Toe-Kick Skirting / Plinth Protection with waterproof silicone sealing', uom: 'Rmt', qty: 14.0 }
];

const INITIAL_DOCS: AttachedDoc[] = [
  { name: 'Counter_Elevation_D_Approved_Drawing.pdf', type: 'Architectural Drawing (.pdf)', size: '2.4 MB', date: '2026-09-06', status: 'Attached' },
  { name: 'IS_710_BWP_Plywood_Tech_Specs.pdf', type: 'Technical Specification (.pdf)', size: '1.1 MB', date: '2026-09-06', status: 'Attached' },
  { name: 'Site_Dimension_Survey_Report.docx', type: 'Site Survey Report (.docx)', size: '850 KB', date: '2026-09-05', status: 'Attached' },
  { name: 'Site_Readiness_Photo.jpg', type: 'Site Readiness Photo (.jpg)', size: '3.2 MB', date: '2026-09-05', status: 'Attached' }
];

const VENDOR_DATABASE: VendorItem[] = [
  // INTERIOR & FITOUTS - WEST
  {
    id: 'VND-001',
    name: 'Vendor 1',
    category: 'Interior & Fitouts',
    subCategory: 'Millwork, Joinery & Counter Fabrication',
    region: 'WEST',
    regionLabel: 'West (Mumbai / Pune / Gujarat)',
    rating: 4.9,
    reviewsCount: 48,
    isRateCard: true,
    rateCardCode: 'RC-2026-INT-01',
    rateCardStatus: 'Active (Valid till Dec 2026)',
    contactPerson: 'Vendor 1 Key Contact',
    gstin: '27AAACD4567M1Z4',
    city: 'Mumbai, Maharashtra',
    leadTime: '7-10 Days',
    badgeText: 'Rate Card Vendor (Contracted)',
    capacity: 'High'
  },
  {
    id: 'VND-002',
    name: 'Vendor 2',
    category: 'Interior & Fitouts',
    subCategory: 'Millwork, Joinery & Counter Fabrication',
    region: 'WEST',
    regionLabel: 'West (Mumbai / Pune / Gujarat)',
    rating: 4.8,
    reviewsCount: 72,
    isRateCard: true,
    rateCardCode: 'RC-2026-INT-02',
    rateCardStatus: 'Active (Valid till Mar 2027)',
    contactPerson: 'Vendor 2 Key Contact',
    gstin: '27AAACG1234L1Z8',
    city: 'Pune, Maharashtra',
    leadTime: '10-14 Days',
    badgeText: 'Rate Card Vendor (Contracted)',
    capacity: 'Enterprise'
  },
  {
    id: 'VND-003',
    name: 'Vendor 3',
    category: 'Interior & Fitouts',
    subCategory: 'Millwork, Joinery & Counter Fabrication',
    region: 'WEST',
    regionLabel: 'West (Mumbai / Pune / Gujarat)',
    rating: 4.3,
    reviewsCount: 29,
    isRateCard: false,
    rateCardCode: null,
    rateCardStatus: 'Empanelled',
    contactPerson: 'Vendor 3 Key Contact',
    gstin: '24AAACP9988K1ZW',
    city: 'Ahmedabad, Gujarat',
    leadTime: '12-15 Days',
    badgeText: 'Non-Rate Card Vendor (Empanelled)',
    capacity: 'Medium'
  },
  {
    id: 'VND-004',
    name: 'Vendor 4',
    category: 'Interior & Fitouts',
    subCategory: 'Millwork, Joinery & Counter Fabrication',
    region: 'WEST',
    regionLabel: 'West (Mumbai / Pune / Gujarat)',
    rating: 4.1,
    reviewsCount: 18,
    isRateCard: false,
    rateCardCode: null,
    rateCardStatus: 'Open Market',
    contactPerson: 'Vendor 4 Key Contact',
    gstin: '27AAACS1122J1Z1',
    city: 'Thane, Maharashtra',
    leadTime: '14-18 Days',
    badgeText: 'Non-Rate Card Vendor (Open Market)',
    capacity: 'Small-Medium'
  },
  // INTERIOR & FITOUTS - NORTH
  {
    id: 'VND-005',
    name: 'Vendor 5',
    category: 'Interior & Fitouts',
    subCategory: 'Millwork, Joinery & Counter Fabrication',
    region: 'NORTH',
    regionLabel: 'North (Delhi-NCR / Haryana / UP)',
    rating: 4.7,
    reviewsCount: 38,
    isRateCard: true,
    rateCardCode: 'RC-2026-INT-03',
    rateCardStatus: 'Active (Valid till Nov 2026)',
    contactPerson: 'Vendor 5 Key Contact',
    gstin: '07AAACD9911P1ZK',
    city: 'New Delhi, NCR',
    leadTime: '8-12 Days',
    badgeText: 'Rate Card Vendor (Contracted)',
    capacity: 'High'
  },
  {
    id: 'VND-006',
    name: 'Vendor 6',
    category: 'Interior & Fitouts',
    subCategory: 'Millwork, Joinery & Counter Fabrication',
    region: 'NORTH',
    regionLabel: 'North (Delhi-NCR / Haryana / UP)',
    rating: 4.2,
    reviewsCount: 22,
    isRateCard: false,
    rateCardCode: null,
    rateCardStatus: 'Empanelled',
    contactPerson: 'Vendor 6 Key Contact',
    gstin: '09AAACN5544H1ZX',
    city: 'Noida, Uttar Pradesh',
    leadTime: '12-16 Days',
    badgeText: 'Non-Rate Card Vendor (Empanelled)',
    capacity: 'Medium'
  },
  // INTERIOR & FITOUTS - SOUTH
  {
    id: 'VND-007',
    name: 'Vendor 7',
    category: 'Interior & Fitouts',
    subCategory: 'Millwork, Joinery & Counter Fabrication',
    region: 'SOUTH',
    regionLabel: 'South (Bengaluru / Chennai / Hyderabad)',
    rating: 4.9,
    reviewsCount: 54,
    isRateCard: true,
    rateCardCode: 'RC-2026-INT-04',
    rateCardStatus: 'Active (Valid till Jan 2027)',
    contactPerson: 'Vendor 7 Key Contact',
    gstin: '29AAACS8810K1ZD',
    city: 'Bengaluru, Karnataka',
    leadTime: '10-12 Days',
    badgeText: 'Rate Card Vendor (Contracted)',
    capacity: 'High'
  },
  {
    id: 'VND-008',
    name: 'Vendor 8',
    category: 'Interior & Fitouts',
    subCategory: 'Millwork, Joinery & Counter Fabrication',
    region: 'SOUTH',
    regionLabel: 'South (Bengaluru / Chennai / Hyderabad)',
    rating: 4.2,
    reviewsCount: 19,
    isRateCard: false,
    rateCardCode: null,
    rateCardStatus: 'Empanelled',
    contactPerson: 'Vendor 8 Key Contact',
    gstin: '33AAACT7721N1ZM',
    city: 'Chennai, Tamil Nadu',
    leadTime: '15-18 Days',
    badgeText: 'Non-Rate Card Vendor (Empanelled)',
    capacity: 'Medium'
  },
  // INTERIOR & FITOUTS - EAST
  {
    id: 'VND-009',
    name: 'Vendor 9',
    category: 'Interior & Fitouts',
    subCategory: 'Millwork, Joinery & Counter Fabrication',
    region: 'EAST',
    regionLabel: 'East (Kolkata / Odisha / North-East)',
    rating: 4.6,
    reviewsCount: 34,
    isRateCard: true,
    rateCardCode: 'RC-2026-INT-05',
    rateCardStatus: 'Active (Valid till Dec 2026)',
    contactPerson: 'Vendor 9 Key Contact',
    gstin: '19AAACB6621R1ZW',
    city: 'Kolkata, West Bengal',
    leadTime: '14-16 Days',
    badgeText: 'Rate Card Vendor (Contracted)',
    capacity: 'High'
  },
  {
    id: 'VND-010',
    name: 'Vendor 10',
    category: 'Interior & Fitouts',
    subCategory: 'Millwork, Joinery & Counter Fabrication',
    region: 'EAST',
    regionLabel: 'East (Kolkata / Odisha / North-East)',
    rating: 4.0,
    reviewsCount: 15,
    isRateCard: false,
    rateCardCode: null,
    rateCardStatus: 'Open Market',
    contactPerson: 'Vendor 10 Key Contact',
    gstin: '19AAECB1123Q1ZR',
    city: 'Bhubaneswar, Odisha',
    leadTime: '20-22 Days',
    badgeText: 'Non-Rate Card Vendor (Open Market)',
    capacity: 'Small-Medium'
  },
  // CIVIL - WEST
  {
    id: 'VND-011',
    name: 'Vendor 11',
    category: 'Civil Infrastructure',
    subCategory: 'Concrete Foundations & Substructure',
    region: 'WEST',
    regionLabel: 'West (Mumbai / Pune / Gujarat)',
    rating: 4.9,
    reviewsCount: 110,
    isRateCard: true,
    rateCardCode: 'RC-2026-CIV-01',
    rateCardStatus: 'Active (Valid till Mar 2027)',
    contactPerson: 'Vendor 11 Key Contact',
    gstin: '27AAACU1234N1ZT',
    city: 'Navi Mumbai, Maharashtra',
    leadTime: '3-5 Days',
    badgeText: 'Rate Card Vendor (Contracted)',
    capacity: 'Mega Enterprise'
  },
  {
    id: 'VND-012',
    name: 'Vendor 12',
    category: 'Civil Infrastructure',
    subCategory: 'Concrete Foundations & Substructure',
    region: 'WEST',
    regionLabel: 'West (Mumbai / Pune / Gujarat)',
    rating: 4.7,
    reviewsCount: 84,
    isRateCard: true,
    rateCardCode: 'RC-2026-CIV-02',
    rateCardStatus: 'Active (Valid till Dec 2026)',
    contactPerson: 'Vendor 12 Key Contact',
    gstin: '27AAACA9921B1ZU',
    city: 'Thane, Maharashtra',
    leadTime: '4-6 Days',
    badgeText: 'Rate Card Vendor (Contracted)',
    capacity: 'Enterprise'
  },
  {
    id: 'VND-013',
    name: 'Vendor 13',
    category: 'Civil Infrastructure',
    subCategory: 'Concrete Foundations & Substructure',
    region: 'WEST',
    regionLabel: 'West (Mumbai / Pune / Gujarat)',
    rating: 4.1,
    reviewsCount: 31,
    isRateCard: false,
    rateCardCode: null,
    rateCardStatus: 'Empanelled',
    contactPerson: 'Vendor 13 Key Contact',
    gstin: '27AAHCS4412K1ZW',
    city: 'Panvel, Maharashtra',
    leadTime: '7-10 Days',
    badgeText: 'Non-Rate Card Vendor (Empanelled)',
    capacity: 'Medium'
  },
  // MEP - WEST
  {
    id: 'VND-014',
    name: 'Vendor 14',
    category: 'MEP & HVAC',
    subCategory: 'HVAC Chillers & Ducting',
    region: 'WEST',
    regionLabel: 'West (Mumbai / Pune / Gujarat)',
    rating: 4.9,
    reviewsCount: 95,
    isRateCard: true,
    rateCardCode: 'RC-2026-MEP-01',
    rateCardStatus: 'Active (Valid till Dec 2026)',
    contactPerson: 'Vendor 14 Key Contact',
    gstin: '27AAACB1100C1ZY',
    city: 'Mumbai, Maharashtra',
    leadTime: '15-20 Days',
    badgeText: 'Rate Card Vendor (Contracted)',
    capacity: 'Enterprise OEM'
  },
  {
    id: 'VND-015',
    name: 'Vendor 15',
    category: 'MEP & HVAC',
    subCategory: 'HVAC Chillers & Ducting',
    region: 'WEST',
    regionLabel: 'West (Mumbai / Pune / Gujarat)',
    rating: 4.8,
    reviewsCount: 88,
    isRateCard: true,
    rateCardCode: 'RC-2026-MEP-02',
    rateCardStatus: 'Active (Valid till Jan 2027)',
    contactPerson: 'Vendor 15 Key Contact',
    gstin: '27AAACV2231E1ZZ',
    city: 'Mumbai, Maharashtra',
    leadTime: '14-18 Days',
    badgeText: 'Rate Card Vendor (Contracted)',
    capacity: 'Enterprise OEM'
  },
  {
    id: 'VND-016',
    name: 'Vendor 16',
    category: 'MEP & HVAC',
    subCategory: 'HVAC Chillers & Ducting',
    region: 'WEST',
    regionLabel: 'West (Mumbai / Pune / Gujarat)',
    rating: 4.2,
    reviewsCount: 26,
    isRateCard: false,
    rateCardCode: null,
    rateCardStatus: 'Empanelled',
    contactPerson: 'Vendor 16 Key Contact',
    gstin: '27AAHCC8812D1ZR',
    city: 'Pune, Maharashtra',
    leadTime: '20-25 Days',
    badgeText: 'Non-Rate Card Vendor (Empanelled)',
    capacity: 'Medium'
  }
];

export const PRModule: React.FC<PRModuleProps> = ({ onSelectPRForBOQ, onNavigateToBOQ, onOpenNewPRModal }) => {
  const { prs, createPR } = useProcurement();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeMethod, setActiveMethod] = useState<number>(3);
  
  // Step 1: General Form State
  const [prCorresponds, setPrCorresponds] = useState<string>('Product');
  const [departmentName, setDepartmentName] = useState<string>('Architecture & Interior Finishing');
  const [prDescription, setPrDescription] = useState<string>('Fabrication & Installation of Reception Counter (Drawing: Counter Elevation D)');
  const [priority, setPriority] = useState<string>('High');
  const [expectedDate, setExpectedDate] = useState<string>('2026-09-25');
  const [costCentre, setCostCentre] = useState<string>('CC-104');
  const [squareFeet, setSquareFeet] = useState<string>('4,500');

  // Step 2: Category State
  const [majorCategory, setMajorCategory] = useState<string>('Interior & Fitouts');
  const [subCategory, setSubCategory] = useState<string>('Millwork, Joinery & Counter Fabrication');
  const [packageCode, setPackageCode] = useState<string>('PKG-2026-INT-001 (Reception Counter & Lobby Joinery Package)');

  // Step 3: BOQ Items State
  const [items, setItems] = useState<RequesterBOQItem[]>(DEFAULT_COUNTER_ITEMS);
  const [drawingInput, setDrawingInput] = useState<string>('Counter Elevation D');

  // Step 4: Supplier Selection State
  const [selectedRegion, setSelectedRegion] = useState<string>('WEST');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>(['VND-001', 'VND-002']);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Step 5: Delivery Locations State
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Metro Line 4 Underground Station Yard - Depot 3, Mumbai Central (Entry Gate 2B)');
  const [siteContact, setSiteContact] = useState<string>('Rahul Verma (Site Lead Engineer) • Ph: +91 98201 44520');
  const [stagingPlan, setStagingPlan] = useState<string>('Phase 1: Internal Carcass & Framing (50%) by Sept 18; Phase 2: Countertops & Facings (50%) by Sept 25.');
  const [unloadingReq, setUnloadingReq] = useState<string>('Covered waterproof storage required on-site. Forklift required for 20mm granite crate offloading.');

  // Step 6: Terms & Conditions State
  const [tcPaymentStructure, setTcPaymentStructure] = useState<string>('MILESTONE_10_70_10_10');
  const [tcAdvancePct, setTcAdvancePct] = useState<string>('10%');
  const [tcRetentionPct, setTcRetentionPct] = useState<string>('10%');
  const [tcCreditDays, setTcCreditDays] = useState<string>('30 Calendar Days');
  const [tcAbgRequired, setTcAbgRequired] = useState<string>('YES');
  const [tcTaxTerms, setTcTaxTerms] = useState<string>('GST 18% Extra as Applicable; Statutory TDS under Section 194C / 194J deducted at source; Valid GST E-Invoice with IRN Mandatory.');
  const [tcLeadTime, setTcLeadTime] = useState<string>('12 - 15 Calendar Days');
  const [tcCompletionDate, setTcCompletionDate] = useState<string>('2026-09-25 (Strict Handover)');
  const [tcPhasedDeliveryPlan, setTcPhasedDeliveryPlan] = useState<string>('Phase 1 (Day 10): Internal carcass, BWP ply & structural framing (50%); Phase 2 (Day 18): Granite slab, laminates, hardware & LED profile (50%).');
  const [tcLdClause, setTcLdClause] = useState<string>('0.5% of total order value per week of delay or part thereof, subject to a maximum ceiling of 5.0% of the total PO contract value.');
  const [tcDlp, setTcDlp] = useState<string>('12_MONTHS');
  const [tcWarranty, setTcWarranty] = useState<string>('5 Years for Core Marine Ply & Granite');
  const [tcIncoterms, setTcIncoterms] = useState<string>('FOR_SITE');
  const [tcPriceFirmness, setTcPriceFirmness] = useState<string>('Firm & Fixed (No escalation allowed)');
  const [tcSpecialConditions, setTcSpecialConditions] = useState<string>('1. Mockup sample of granite beveling and laminate edge finish must be approved by Architect prior to batch cutting.\n2. All transit insurance and octroi/entry tolls under Supplier scope till safe offloading at site.');

  const loadTermsPreset = (presetType: string) => {
    if (presetType === 'standard_construction') {
      setTcPaymentStructure('MILESTONE_10_70_10_10');
      setTcAdvancePct('10%');
      setTcRetentionPct('10%');
      setTcCreditDays('30 Calendar Days');
      setTcAbgRequired('YES');
      setTcTaxTerms('GST 18% Extra as Applicable; Statutory TDS under Section 194C / 194J deducted at source; Valid GST E-Invoice with IRN Mandatory.');
      setTcLeadTime('12 - 15 Calendar Days');
      setTcCompletionDate('2026-09-25 (Strict Handover)');
      setTcPhasedDeliveryPlan('Phase 1 (Day 10): Internal carcass, BWP ply & structural framing (50%); Phase 2 (Day 18): Granite slab, laminates, hardware & LED profile (50%).');
      setTcLdClause('0.5% of total order value per week of delay or part thereof, subject to a maximum ceiling of 5.0% of the total PO contract value.');
      setTcDlp('12_MONTHS');
      setTcWarranty('5 Years for Core Marine Ply & Granite');
      setTcIncoterms('FOR_SITE');
      setTcPriceFirmness('Firm & Fixed (No escalation allowed)');
    } else if (presetType === 'direct_supply') {
      setTcPaymentStructure('CREDIT_30_DAYS');
      setTcAdvancePct('0%');
      setTcRetentionPct('5%');
      setTcCreditDays('30 Calendar Days from GRN');
      setTcAbgRequired('NO');
      setTcTaxTerms('GST 18% Extra as Applicable; Statutory TDS deducted at source; Valid GST E-Invoice with IRN Mandatory.');
      setTcLeadTime('7 - 10 Calendar Days');
      setTcCompletionDate('2026-09-20 (Direct Site Supply)');
      setTcPhasedDeliveryPlan('Single Lot Delivery within 10 Calendar Days from Purchase Order acceptance.');
      setTcLdClause('0.5% per week of delay subject to a maximum of 5% of order value.');
      setTcDlp('12_MONTHS');
      setTcWarranty('1 Year OEM Standard Replacement Warranty');
      setTcIncoterms('FOR_SITE');
      setTcPriceFirmness('Firm & Fixed during delivery period');
    } else if (presetType === 'progressive_ra') {
      setTcPaymentStructure('PROGRESSIVE_RA');
      setTcAdvancePct('5%');
      setTcRetentionPct('10%');
      setTcCreditDays('30 Calendar Days from RA Bill certification');
      setTcAbgRequired('YES');
      setTcTaxTerms('GST 18% Extra as Applicable; Statutory TDS deducted at source; Valid GST E-Invoice with IRN Mandatory.');
      setTcLeadTime('20 - 30 Calendar Days');
      setTcCompletionDate('2026-10-15 (Progressive Handover)');
      setTcPhasedDeliveryPlan('Monthly progress billing based on joint site measurement verified by Client Project Engineer.');
      setTcLdClause('0.5% per week of delay subject to a maximum of 10% of total contract value.');
      setTcDlp('24_MONTHS');
      setTcWarranty('5 Years Structural & Performance Warranty');
      setTcIncoterms('FOR_SITE');
      setTcPriceFirmness('Firm & Fixed for the entire contract duration');
    }
  };

  const handlePaymentStructureChange = (val: string) => {
    setTcPaymentStructure(val);
    if (val === 'MILESTONE_10_70_10_10') {
      setTcAdvancePct('10%');
      setTcRetentionPct('10%');
      setTcCreditDays('30 Calendar Days');
    } else if (val === 'CREDIT_30_DAYS') {
      setTcAdvancePct('0%');
      setTcRetentionPct('0%');
      setTcCreditDays('30 Days from GRN');
    } else if (val === 'CREDIT_45_DAYS') {
      setTcAdvancePct('0%');
      setTcRetentionPct('0%');
      setTcCreditDays('45 Days from GRN');
    } else if (val === 'PROGRESSIVE_RA') {
      setTcAdvancePct('5%');
      setTcRetentionPct('10%');
      setTcCreditDays('30 Days from RA Certification');
    }
  };

  // Step 7: Documents State
  const [documents, setDocuments] = useState<AttachedDoc[]>(INITIAL_DOCS);

  // Filter vendors based on category, region, and type
  const getFilteredVendors = () => {
    let list = VENDOR_DATABASE.filter(v => v.category === majorCategory);
    if (list.length === 0) list = VENDOR_DATABASE;

    if (selectedRegion !== 'ALL') {
      const regFiltered = list.filter(v => v.region === selectedRegion);
      if (regFiltered.length > 0) list = regFiltered;
    }

    if (selectedTypeFilter === 'RATE_CARD') {
      list = list.filter(v => v.isRateCard);
    } else if (selectedTypeFilter === 'NON_RATE_CARD') {
      list = list.filter(v => !v.isRateCard);
    }

    return list;
  };

  const filteredVendors = getFilteredVendors();

  const toggleSupplierSelection = (id: string) => {
    if (selectedSupplierIds.includes(id)) {
      setSelectedSupplierIds(selectedSupplierIds.filter(item => item !== id));
    } else {
      setSelectedSupplierIds([...selectedSupplierIds, id]);
    }
  };

  const removeSupplierSelection = (id: string) => {
    setSelectedSupplierIds(selectedSupplierIds.filter(item => item !== id));
  };

  const selectAllRateCardSuppliers = () => {
    const list = getFilteredVendors().filter(v => v.isRateCard);
    const idsToAdd = list.map(v => v.id).filter(id => !selectedSupplierIds.includes(id));
    setSelectedSupplierIds([...selectedSupplierIds, ...idsToAdd]);
  };

  const selectAllSuppliers = () => {
    const list = getFilteredVendors();
    const idsToAdd = list.map(v => v.id).filter(id => !selectedSupplierIds.includes(id));
    setSelectedSupplierIds([...selectedSupplierIds, ...idsToAdd]);
  };

  const clearAllSuppliers = () => {
    setSelectedSupplierIds([]);
  };

  const handleQtyChange = (idx: number, val: string) => {
    const updated = [...items];
    updated[idx].qty = parseFloat(val) || 0;
    setItems(updated);
  };

  const handleAddLine = () => {
    setItems([...items, { code: `ITEM-${items.length + 1}`, desc: 'Custom Site Requisition Line Item', uom: 'Nos', qty: 1 }]);
  };

  const handleRemoveLine = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: AttachedDoc[] = Array.from(e.target.files).map(f => ({
        name: f.name,
        type: 'Uploaded Document',
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toISOString().slice(0, 10),
        status: 'Attached'
      }));
      setDocuments([...documents, ...newFiles]);
    }
  };

  const handleSubmitPR = () => {
    const selectedVendorObjs = VENDOR_DATABASE.filter(v => selectedSupplierIds.includes(v.id));
    const vendorSummary = selectedVendorObjs.map(v => `${v.name} (${v.isRateCard ? 'Rate Card' : 'Non-Rate Card'})`).join(', ');
    const newPR = {
      title: prDescription,
      projectName: 'Metro Line 4 Underground',
      costCentre: costCentre === 'CC-104' ? 'CC-104 (Finishing & Interior)' : costCentre,
      category: majorCategory,
      requester: 'Rahul Verma (PR Raiser)',
      reqDate: expectedDate,
      remarks: `Preferred Vendors: ${vendorSummary || 'None Selected'} | Delivery: ${deliveryAddress}`,
      items: items.map(it => ({
        ...it,
        rateCard: 0,
        benchmark: 0,
        std: 0,
        aiConf: '98%'
      }))
    };
    createPR(newPR);
    if (onSelectPRForBOQ) {
      onSelectPRForBOQ('PR-2026-0005');
    } else if (onNavigateToBOQ) {
      onNavigateToBOQ('PR-2026-0005');
    }
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <div className="inline-flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-sm ${star <= full || (star === full + 1 && hasHalf) ? 'text-amber-400' : 'text-slate-300'}`}>
            ★
          </span>
        ))}
        <span className="font-bold font-mono text-slate-800 text-xs ml-1.5">{rating.toFixed(1)}/5</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Main Multi-Step Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        
        {/* Header: Create New Procurement Request CAPEX */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-brand-950 to-brand-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                PR Raiser Scope (Role 1)
              </span>
              <span className="text-xs text-slate-300 font-mono">
                L&T Infra • Metro Line 4 Underground
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Create New Procurement Request CAPEX
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-sky-500/30 text-xs font-mono text-emerald-300 font-bold">
              Draft ID: PR-2026-0005
            </span>
          </div>
        </div>

        {/* 7 Process Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6">
          <nav className="flex space-x-3 sm:space-x-6 overflow-x-auto text-xs sm:text-sm font-semibold scrollbar-none py-1">
            
            <button 
              onClick={() => setCurrentStep(1)} 
              className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 transition-all ${currentStep === 1 ? 'font-bold text-sky-600 border-sky-600' : 'text-slate-500 border-transparent hover:text-slate-900'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${currentStep === 1 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>1</span>
              <span>General</span>
            </button>

            <button 
              onClick={() => setCurrentStep(2)} 
              className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 transition-all ${currentStep === 2 ? 'font-bold text-sky-600 border-sky-600' : 'text-slate-500 border-transparent hover:text-slate-900'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${currentStep === 2 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>2</span>
              <span>Category Selection</span>
            </button>

            <button 
              onClick={() => setCurrentStep(3)} 
              className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 transition-all ${currentStep === 3 ? 'font-bold text-sky-600 border-sky-600' : 'text-slate-500 border-transparent hover:text-slate-900'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${currentStep === 3 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>3</span>
              <span>BOQ Studio (PR Items)</span>
            </button>

            <button 
              onClick={() => setCurrentStep(4)} 
              className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 transition-all ${currentStep === 4 ? 'font-bold text-sky-600 border-sky-600' : 'text-slate-500 border-transparent hover:text-slate-900'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${currentStep === 4 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>4</span>
              <span>Supplier Selection</span>
            </button>

            <button 
              onClick={() => setCurrentStep(5)} 
              className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 transition-all ${currentStep === 5 ? 'font-bold text-sky-600 border-sky-600' : 'text-slate-500 border-transparent hover:text-slate-900'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${currentStep === 5 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>5</span>
              <span>Delivery Locations</span>
            </button>

            <button 
              onClick={() => setCurrentStep(6)} 
              className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 transition-all ${currentStep === 6 ? 'font-bold text-sky-600 border-sky-600' : 'text-slate-500 border-transparent hover:text-slate-900'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${currentStep === 6 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>6</span>
              <span>Terms & Conditions</span>
            </button>

            <button 
              onClick={() => setCurrentStep(7)} 
              className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 transition-all ${currentStep === 7 ? 'font-bold text-sky-600 border-sky-600' : 'text-slate-500 border-transparent hover:text-slate-900'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${currentStep === 7 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>7</span>
              <span>Documents</span>
            </button>

          </nav>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: GENERAL (AS PER USER SCREENSHOT) */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-xs text-slate-700">
              
              {/* PR Corresponds */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-900">
                  PR Corresponds:<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <div className="flex items-center space-x-6 pt-1">
                  {['Product', 'Service', 'TurnKey Projects'].map(opt => (
                    <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="prCorresponds" 
                        value={opt} 
                        checked={prCorresponds === opt} 
                        onChange={(e) => setPrCorresponds(e.target.value)}
                        className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                      />
                      <span className="font-medium text-slate-800">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Department Name */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Department Name:</label>
                <input 
                  type="text" 
                  value={departmentName} 
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full bg-slate-100 text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">
                  Product/Service Description:<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input 
                  type="text" 
                  value={prDescription} 
                  onChange={(e) => setPrDescription(e.target.value)}
                  className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Square Feet */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">
                  Square Feet :<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input 
                  type="text" 
                  value={squareFeet} 
                  onChange={(e) => setSquareFeet(e.target.value)}
                  className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Cost Centre */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">
                  Cost Centre:<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <select 
                  value={costCentre} 
                  onChange={(e) => setCostCentre(e.target.value)}
                  className="w-full bg-white text-slate-900 font-bold border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-sky-500"
                >
                  <option value="CC-101">CC-101 (Civil Substructure & Foundations)</option>
                  <option value="CC-102">CC-102 (RCC Superstructure & Framing)</option>
                  <option value="CC-103">CC-103 (MEP & HVAC Installation)</option>
                  <option value="CC-104">CC-104 (Finishing, Interior & Millwork)</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Priority :</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Normal">Normal</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Critical / Urgent</option>
                </select>
              </div>

              {/* Expected Date (Span 2) */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block font-bold text-slate-900">
                  Expected Date :<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <div className="max-w-md">
                  <input 
                    type="date" 
                    value={expectedDate} 
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: CATEGORY SELECTION */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-xs">
              <span className="font-bold text-sky-950 block text-sm">Enterprise Category & Package Taxonomy:</span>
              <p className="text-sky-800 mt-0.5">Selecting the category will automatically route this PR to the assigned Category Manager (Role 3) upon Project Head sign-off.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Major Category :*</label>
                <select 
                  value={majorCategory} 
                  onChange={(e) => setMajorCategory(e.target.value)}
                  className="w-full bg-white text-slate-900 font-bold border border-slate-300 rounded-lg px-3.5 py-2"
                >
                  <option value="Interior & Fitouts">Interior & Fitouts</option>
                  <option value="Civil Infrastructure">Civil Infrastructure & Concrete</option>
                  <option value="MEP & HVAC">MEP, HVAC & Electrical</option>
                  <option value="Heavy Plant & Equipment">Heavy Plant & Equipment</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Sub-Category :*</label>
                <select 
                  value={subCategory} 
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full bg-white text-slate-900 font-bold border border-slate-300 rounded-lg px-3.5 py-2"
                >
                  <option value="Millwork, Joinery & Counter Fabrication">Millwork, Joinery & Counter Fabrication</option>
                  <option value="False Ceiling & Acoustic Paneling">False Ceiling & Acoustic Paneling</option>
                  <option value="Flooring, Granite & Vitrified Tiles">Flooring, Granite & Vitrified Tiles</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Package Title & Code :*</label>
                <input 
                  type="text" 
                  value={packageCode} 
                  onChange={(e) => setPackageCode(e.target.value)}
                  className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Designated Category Manager (Auto-Routed) :</label>
                <div className="p-2 bg-slate-100 rounded-lg border border-slate-300 text-slate-900 font-bold flex items-center space-x-2">
                  <span className="text-sky-700">Vikram Mehta (Lead Category Manager - Interior & Fitouts)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: BOQ STUDIO (PR ITEMS) */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center">
                  <Layers className="w-4 h-4 text-sky-600 mr-2" />
                  BOQ Studio Preparation Methods (In PR Raiser Scope):
                </h2>
                <p className="text-xs text-slate-500">Choose any of the 4 methods to prepare specifications & site quantities. The BOQ schedule populates in the table below.</p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 border border-sky-200">
                Commercial Rates Hidden
              </span>
            </div>

            {/* 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div onClick={() => setActiveMethod(1)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${activeMethod === 1 ? 'border-purple-500 ring-2 ring-purple-100 shadow-md bg-white' : 'border-slate-200 bg-white hover:border-sky-500'}`}>
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <UploadCloud className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-[10px] font-bold uppercase text-purple-700 block">Method 1</span>
                <h3 className="text-xs font-bold text-slate-900">1. Upload New BOQ</h3>
                <p className="text-[11px] text-slate-500">Download blank format & upload spreadsheet.</p>
              </div>

              <div onClick={() => setActiveMethod(2)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${activeMethod === 2 ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-md bg-white' : 'border-slate-200 bg-white hover:border-sky-500'}`}>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Download className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">Method 2</span>
                <h3 className="text-xs font-bold text-slate-900">2. Standard Template</h3>
                <p className="text-[11px] text-slate-500">Download standard template & upload filled.</p>
              </div>

              <div onClick={() => setActiveMethod(3)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${activeMethod === 3 ? 'border-sky-500 ring-2 ring-sky-100 shadow-md bg-white' : 'border-slate-200 bg-white hover:border-sky-500'}`}>
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                </div>
                <span className="text-[10px] font-bold uppercase text-sky-700 block">Method 3 (Active)</span>
                <h3 className="text-xs font-bold text-slate-900">3. Drawing AI Extractor</h3>
                <p className="text-[11px] text-slate-500">Extracts specs for <em>Counter Elevation D</em>.</p>
              </div>

              <div onClick={() => setActiveMethod(4)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${activeMethod === 4 ? 'border-amber-500 ring-2 ring-amber-100 shadow-md bg-white' : 'border-slate-200 bg-white hover:border-sky-500'}`}>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-[10px] font-bold uppercase text-amber-700 block">Method 4</span>
                <h3 className="text-xs font-bold text-slate-900">4. Manual / Catalog</h3>
                <p className="text-[11px] text-slate-500">Add from corporate master catalog.</p>
              </div>
            </div>

            {/* METHOD 1 WORKBENCH */}
            {activeMethod === 1 && (
              <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-purple-200 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-purple-950 flex items-center">
                      <UploadCloud className="w-4 h-4 text-purple-700 mr-1.5" />
                      Method 1: Upload New BOQ Spreadsheet (Column Headings & Blank Format)
                    </h3>
                    <p className="text-[11px] text-purple-800 mt-0.5">
                      Download the official blank BOQ format, fill item specifications and quantities, and upload. The items will immediately populate in the down screen table below.
                    </p>
                  </div>
                  <button onClick={() => setCurrentStep(4)} className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm whitespace-nowrap flex items-center space-x-1.5 shrink-0">
                    <span>Confirm & Move to Step 4: Supplier Selection →</span>
                  </button>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-purple-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Required Spreadsheet Column Headings:</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">Standard Structure</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                    <div className="p-2 bg-slate-50 rounded border text-slate-800 font-bold text-center">1. Item Code</div>
                    <div className="p-2 bg-slate-50 rounded border text-slate-800 font-bold text-center">2. Item Description / Specs</div>
                    <div className="p-2 bg-slate-50 rounded border text-slate-800 font-bold text-center">3. Unit (UOM)</div>
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-950 font-bold text-center">4. Required Qty</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-purple-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Option A: Download Blank BOQ Format</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Download pre-structured blank CSV template with approved column headers.</p>
                    </div>
                    <button 
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8,Item Code,Item Description / Specs,Unit (UOM),Required Quantity,Remarks\nITEM-001,Granite Countertop 20mm Polished Jet Black,Sqm,12.5,Elevation D\nITEM-002,18mm Marine BWP Plywood IS 710,Sqm,38.0,Carcass\n";
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "Blank_BOQ_Format_Template.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }} 
                      className="w-full bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 border border-purple-300"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Blank BOQ Format (CSV)</span>
                    </button>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-purple-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Option B: Upload Completed BOQ (.xlsx / .csv)</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Upload your site spreadsheet to automatically parse and render line items in the table below.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          setItems([
                            { code: 'UPL-001', desc: '20mm Polished Jet Black Granite Countertop with Bullnose profiling', uom: 'Sqm', qty: 12.5 },
                            { code: 'UPL-002', desc: '18mm Marine BWP Plywood IS 710 Carcass Framework & Partitions', uom: 'Sqm', qty: 38.0 },
                            { code: 'UPL-003', desc: '1.0mm Textured Decorative HPL Laminate Lining', uom: 'Sqm', qty: 24.0 },
                            { code: 'UPL-004', desc: 'Concealed Soft-Close Hinges & Heavy Duty Telescopic Channel Set', uom: 'Set', qty: 14.0 },
                            { code: 'UPL-005', desc: '12V Profile LED Lighting with Aluminium Diffuser Channel', uom: 'Rmt', qty: 16.0 },
                            { code: 'UPL-006', desc: '100mm SS 304 Grade Brushed Skirting Strip with Sealant', uom: 'Rmt', qty: 14.0 }
                          ]);
                        }} 
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 rounded-lg shadow-sm flex items-center justify-center space-x-1.5"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload & Parse BOQ File</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* METHOD 2 WORKBENCH */}
            {activeMethod === 2 && (
              <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-200 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-emerald-950 flex items-center">
                      <Download className="w-4 h-4 text-emerald-700 mr-1.5" />
                      Method 2: Corporate Standard BOQ Template (Download & Upload)
                    </h3>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Select a standard corporate package. Download the template to enter quantities offline, upload the filled template, or edit quantities directly in the down screen table.
                    </p>
                  </div>
                  <button onClick={() => setCurrentStep(4)} className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm whitespace-nowrap flex items-center space-x-1.5 shrink-0">
                    <span>Confirm & Move to Step 4: Supplier Selection →</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-emerald-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">1. Download Selected Template</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Download pre-filled standard package items in CSV format to enter quantities.</p>
                    </div>
                    <button 
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8,Item Code,Item Description / Specs,Unit (UOM),Required Quantity\nCNT-TOP-GRN20,20mm Granite Countertop,Sqm,12.5\nCNT-PLY-BWP18,18mm Marine Plywood IS 710,Sqm,38.0\nCNT-LAM-1MM,1.0mm Textured Laminate,Sqm,24.0\nCNT-HDW-SOFT,Soft-Close Hinges Set,Set,14.0\n";
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "Interior_Standard_Package.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 border border-emerald-300"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Standard Template (CSV)</span>
                    </button>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-emerald-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">2. Upload Filled Standard Template</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Upload completed CSV with your required site quantities to populate the down screen table.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setItems(DEFAULT_COUNTER_ITEMS);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg shadow-sm flex items-center justify-center space-x-1.5"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Filled Template (CSV)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* METHOD 3 WORKBENCH */}
            {activeMethod === 3 && (
              <div className="p-5 bg-sky-50/60 rounded-2xl border border-sky-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-sky-200 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-sky-950 flex items-center">
                      <Sparkles className="w-4 h-4 text-sky-600 mr-1.5" />
                      Method 3: Drawing AI Extractor (Without Commercial Rates)
                    </h3>
                    <p className="text-[11px] text-sky-800 mt-0.5">
                      AI ingests technical drawing (e.g. <em>Counter Elevation D</em>) and extracts itemized specifications and quantities directly into the schedule below.
                    </p>
                  </div>
                  <button onClick={() => setCurrentStep(4)} className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm whitespace-nowrap flex items-center space-x-1.5 shrink-0">
                    <span>Confirm & Move to Step 4: Supplier Selection →</span>
                  </button>
                </div>

                <div className="p-4 bg-white rounded-xl border border-sky-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                  <div className="flex-1">
                    <label className="block font-bold text-slate-900 mb-1">Enter Drawing Title or Upload Drawing Sheet:</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="text" 
                        value={drawingInput} 
                        onChange={(e) => setDrawingInput(e.target.value)}
                        className="flex-1 bg-white font-bold text-slate-900 border border-sky-300 rounded-lg px-3 py-2 text-xs" 
                      />
                      <button 
                        onClick={() => setItems(DEFAULT_COUNTER_ITEMS)}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 rounded-lg whitespace-nowrap flex items-center space-x-1 shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Extract Specs & Quantities</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 text-[11px] sm:w-72">
                    <span className="font-bold text-sky-900 block">Drawing Scope Protection:</span>
                    <span>Strictly extracts Elevation D specs. Rates hidden for PR Raiser.</span>
                  </div>
                </div>
              </div>
            )}

            {/* METHOD 4 WORKBENCH */}
            {activeMethod === 4 && (
              <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-amber-200 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-amber-950 flex items-center">
                      <Edit3 className="w-4 h-4 text-amber-700 mr-1.5" />
                      Method 4: Master Catalog Selection & Manual Line Entry
                    </h3>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Select pre-approved items from the corporate master catalog or add custom line items directly into the schedule below.
                    </p>
                  </div>
                  <button onClick={() => setCurrentStep(4)} className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm whitespace-nowrap flex items-center space-x-1.5 shrink-0">
                    <span>Confirm & Move to Step 4: Supplier Selection →</span>
                  </button>
                </div>

                <div className="p-4 bg-white rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                  <div className="flex-1">
                    <label className="block font-bold text-slate-900 mb-1">Search Approved Corporate Catalog:</label>
                    <select id="nextCatalogPicker" className="w-full text-xs font-semibold bg-white border border-amber-300 rounded-lg px-3 py-2">
                      <option value="20mm Granite Countertop">20mm Polished Jet Black Granite Top</option>
                      <option value="18mm BWP Marine Plywood">18mm Marine Grade BWP Plywood (IS 710)</option>
                      <option value="1.0mm Textured Laminate">1.0mm High Pressure Suede Finish Laminate</option>
                      <option value="Soft-Close Telescopic Hardware">Soft-Close Concealed Hinges & Slides</option>
                      <option value="100mm SS 304 Skirting">100mm SS 304 Plinth Skirting</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => {
                      const sel = (document.getElementById('nextCatalogPicker') as HTMLSelectElement)?.value || 'Catalog Item';
                      setItems([...items, { code: `CAT-${Math.floor(100 + Math.random() * 900)}`, desc: `${sel} as per standard`, uom: 'Sqm', qty: 10 }]);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg shadow-sm flex items-center space-x-1 mt-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add from Catalog</span>
                  </button>
                </div>
              </div>
            )}

            {/* DOWN SCREEN BOQ SCHEDULE TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 mr-1.5" />
                    Requisition Scope & Quantities Schedule (Down Screen)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Showing <strong>{items.length} items</strong> extracted for drawing: <strong>{drawingInput}</strong>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={handleAddLine} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 border">
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Custom Item</span>
                  </button>
                  <button onClick={() => setCurrentStep(4)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1.5">
                    <span>Move to Step 4: Supplier Selection →</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 font-bold border-b text-slate-800">
                    <tr>
                      <th className="p-2.5 w-8">#</th>
                      <th className="p-2.5 w-28">Item Code</th>
                      <th className="p-2.5">Specification / Scope Description</th>
                      <th className="p-2.5 w-16">UOM</th>
                      <th className="p-2.5 w-28 text-right bg-emerald-50 text-emerald-950 font-bold border-l border-r border-emerald-200">Required Quantity</th>
                      <th className="p-2.5 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-2.5 font-mono font-bold text-sky-800">{it.code}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{it.desc}</td>
                        <td className="p-2.5 font-bold text-slate-700">{it.uom}</td>
                        <td className="p-2.5 text-right bg-emerald-50/50 border-l border-r border-emerald-100">
                          <input 
                            type="number" 
                            step="0.1" 
                            value={it.qty} 
                            onChange={(e) => handleQtyChange(idx, e.target.value)} 
                            className="w-20 text-xs font-bold text-emerald-950 font-mono bg-white border border-emerald-300 p-1 rounded text-right shadow-inner"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <button onClick={() => handleRemoveLine(idx)} className="text-rose-500 hover:text-rose-700">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-600 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Technical Quantities Verified for Requisition. Commercial Rates are hidden for PR Raiser.</span>
                </div>
                <button onClick={() => setCurrentStep(4)} className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 whitespace-nowrap">
                  <span>Confirm BOQ & Proceed to Step 4: Supplier Selection →</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: SUPPLIER SELECTION (MULTI-SELECT DROPDOWN WITH STARS & RATE CARD CODING) */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Header Banner */}
            <div className="p-4 bg-gradient-to-r from-emerald-950 via-brand-950 to-slate-900 text-white rounded-2xl shadow-sm border border-emerald-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                    Step 4: Vendor Identification & Sourcing
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    {majorCategory} • Region: {selectedRegion}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  Select Qualified Suppliers (Multi-Select Category & Regional Roster)
                </h3>
                <p className="text-slate-300 mt-0.5">
                  Suppliers carry star performance ratings and color differentiation as <strong className="text-emerald-300">Rate Card Vendors (Pre-negotiated MSAs)</strong> or <strong className="text-sky-300">Non-Rate Card Vendors (Open / RFQ)</strong>.
                </p>
              </div>
              <button 
                onClick={() => {
                  if (selectedSupplierIds.length === 0) {
                    alert('Please select at least one vendor to proceed.');
                    return;
                  }
                  setCurrentStep(5);
                }} 
                className="bg-emerald-500 hover:bg-emerald-400 text-brand-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md whitespace-nowrap flex items-center space-x-1.5 shrink-0"
              >
                <span>Confirm Suppliers & Move to Step 5: Delivery Locations →</span>
              </button>
            </div>

            {/* Filter & Action Toolbar: Region & Rate Card Status */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Regional Filter */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900 flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 mr-1" />
                    <span>Filter by Operating Region :*</span>
                  </label>
                  <select 
                    value={selectedRegion} 
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-300 rounded-lg px-3.5 py-2 text-xs focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="ALL">🌐 All Operating Regions</option>
                    <option value="WEST">📍 West (Mumbai / Pune / Gujarat)</option>
                    <option value="NORTH">📍 North (Delhi-NCR / Haryana / UP)</option>
                    <option value="SOUTH">📍 South (Bengaluru / Chennai / Hyderabad)</option>
                    <option value="EAST">📍 East (Kolkata / Odisha / North-East)</option>
                  </select>
                </div>

                {/* 2. Rate Card Status Filter */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900 flex items-center">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                    <span>Contractual Rate Card Status :</span>
                  </label>
                  <select 
                    value={selectedTypeFilter} 
                    onChange={(e) => setSelectedTypeFilter(e.target.value)}
                    className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-300 rounded-lg px-3.5 py-2 text-xs focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="ALL">All Vendors (Rate Card & Non-Rate Card)</option>
                    <option value="RATE_CARD">🟢 Rate Card Vendors Only (Pre-Agreed Rates)</option>
                    <option value="NON_RATE_CARD">🔵 Non-Rate Card Vendors Only (Empanelled / RFQ)</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Multi-Select Vendor Dropdown Component */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <label className="block font-bold text-slate-900 text-xs flex items-center">
                    <Store className="w-4 h-4 text-purple-600 mr-1.5" />
                    <span>Select Sourcing Vendors (Multi-Select Dropdown) :*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Click the dropdown box below to open options and select multiple vendors
                  </span>
                </div>

                {/* Dropdown Trigger Box */}
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white font-bold text-slate-900 border-2 border-sky-400 hover:border-sky-500 rounded-xl px-4 py-3 text-xs flex items-center justify-between shadow-sm cursor-pointer transition-all select-none"
                >
                  <div className="flex items-center space-x-2 overflow-hidden mr-2">
                    {selectedSupplierIds.length === 0 ? (
                      <span className="text-slate-500 font-normal">Click to select vendors from dropdown...</span>
                    ) : (
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        {selectedSupplierIds.slice(0, 3).map(id => {
                          const v = VENDOR_DATABASE.find(item => item.id === id) || { id, name: id, isRateCard: false };
                          return (
                            <span 
                              key={id} 
                              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${v.isRateCard ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-sky-50 text-sky-900 border-sky-300'}`}
                            >
                              <span>{v.isRateCard ? '🟢' : '🔵'}</span>
                              <span>{v.name}</span>
                            </span>
                          );
                        })}
                        {selectedSupplierIds.length > 3 && (
                          <span className="text-xs font-bold text-slate-600 ml-1">
                            +{selectedSupplierIds.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="bg-sky-100 text-sky-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-sky-300">
                      {selectedSupplierIds.length} selected
                    </span>
                    <ChevronDown className={`w-4 h-4 text-sky-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Collapsible Floating Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border-2 border-sky-400 rounded-2xl shadow-2xl z-40 p-4 space-y-3">
                    
                    {/* Quick Filter & Action Header inside Dropdown */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-slate-700">Quick Select:</span>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAllRateCardSuppliers();
                          }} 
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300 transition-all"
                        >
                          + All Rate Card
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAllSuppliers();
                          }} 
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-[11px] border border-sky-300 transition-all"
                        >
                          + Select All
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            clearAllSuppliers();
                          }} 
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-300 transition-all"
                        >
                          Clear
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">Multi-Select Enabled</span>
                    </div>

                    {/* Scrollable Options List */}
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-64 overflow-y-auto bg-slate-50/50">
                      {filteredVendors.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-xs">
                          No vendors match the selected filters.
                        </div>
                      ) : (
                        filteredVendors.map(v => {
                          const isChecked = selectedSupplierIds.includes(v.id);
                          return (
                            <div 
                              key={v.id}
                              onClick={() => toggleSupplierSelection(v.id)}
                              className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-slate-100/80 ${isChecked ? (v.isRateCard ? 'bg-emerald-50/60' : 'bg-sky-50/60') : 'bg-white'}`}
                            >
                              <div className="flex items-center space-x-3 flex-1">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked} 
                                  onChange={() => {}} 
                                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                                />
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-slate-900 text-xs font-mono">{v.name} ({v.id})</span>
                                  {v.isRateCard ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center space-x-1">
                                      <span>🟢</span>
                                      <span>Rate Card Vendor</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-300 flex items-center space-x-1">
                                      <span>🔵</span>
                                      <span>Non-Rate Card Vendor</span>
                                    </span>
                                  )}
                                  <span className="text-[11px] text-slate-500">📍 {v.city.split(',')[0]}</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3 text-xs shrink-0">
                                {renderStars(v.rating)}
                                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Lead: {v.leadTime}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Done / Apply Button inside Dropdown */}
                    <div className="flex items-center justify-between pt-2 border-t text-xs">
                      <span className="text-[11px] text-slate-600">
                        <strong className="text-sky-600 font-bold font-mono">{selectedSupplierIds.length}</strong> vendors currently checked
                      </span>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDropdownOpen(false);
                        }} 
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-1.5 rounded-lg shadow-sm"
                      >
                        Done / Apply Selection ✓
                      </button>
                    </div>

                  </div>
                )}

              </div>

              {/* Selected Suppliers Chips (Clean visual pills under the dropdown) */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 flex items-center">
                    <Users className="w-4 h-4 text-sky-600 mr-1.5" />
                    <span>Selected Vendors (<span className="text-sky-600 font-black font-mono">{selectedSupplierIds.length}</span> selected):</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Click ✕ to remove any vendor</span>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[36px] p-2 bg-slate-100/70 rounded-xl border border-dashed border-slate-300 items-center">
                  {selectedSupplierIds.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      No vendors selected yet. Click the dropdown above to select.
                    </span>
                  ) : (
                    selectedSupplierIds.map(id => {
                      const v = VENDOR_DATABASE.find(item => item.id === id) || { id, name: id, rating: 4.5, isRateCard: false };
                      return (
                        <div 
                          key={id}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${v.isRateCard ? 'bg-emerald-100 text-emerald-950 border-emerald-300' : 'bg-sky-100 text-sky-950 border-sky-300'}`}
                        >
                          <span>{v.isRateCard ? '🟢' : '🔵'}</span>
                          <span>{v.name} ({v.id})</span>
                          <span className="text-amber-600 font-mono text-[11px]">★ {v.rating.toFixed(1)}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSupplierSelection(id);
                            }} 
                            className="ml-1 text-slate-500 hover:text-rose-600 font-black p-0.5 rounded-full hover:bg-white/80" 
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Confirmation Bar */}
            <div className="p-3.5 bg-slate-50 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span><strong>{selectedSupplierIds.length} vendor(s)</strong> selected for requisition & RFQ quotation.</span>
              </div>
              <button 
                onClick={() => {
                  if (selectedSupplierIds.length === 0) {
                    alert('Please select at least one vendor to proceed.');
                    return;
                  }
                  setCurrentStep(5);
                }} 
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 whitespace-nowrap"
              >
                <span>Confirm Suppliers & Proceed to Step 5: Delivery Locations →</span>
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: DELIVERY LOCATIONS */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-950 block text-sm">Site Delivery Address & Logistics:</span>
              <p className="text-emerald-800 mt-0.5">Specify delivery unloading coordinates, access gates, and designated site contact.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Delivery Site / Location Address :*</label>
                <textarea 
                  rows={2} 
                  value={deliveryAddress} 
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Site In-Charge / Contact Person :*</label>
                <input 
                  type="text" 
                  value={siteContact} 
                  onChange={(e) => setSiteContact(e.target.value)}
                  className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Delivery Staging & Phasing Plan :</label>
                <textarea 
                  rows={2} 
                  value={stagingPlan} 
                  onChange={(e) => setStagingPlan(e.target.value)}
                  className="w-full bg-white text-slate-900 font-normal border border-slate-300 rounded-lg px-3.5 py-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Unloading & Material Handling Requirements :</label>
                <textarea 
                  rows={2} 
                  value={unloadingReq} 
                  onChange={(e) => setUnloadingReq(e.target.value)}
                  className="w-full bg-white text-slate-900 font-normal border border-slate-300 rounded-lg px-3.5 py-2"
                />
              </div>
            </div>

            {/* Bottom Confirmation Bar for Step 5 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Delivery and logistics parameters configured.</span>
              </div>
              <button 
                onClick={() => setCurrentStep(6)} 
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 whitespace-nowrap"
              >
                <span>Confirm Delivery & Proceed to Step 6: Terms & Conditions →</span>
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: TERMS & CONDITIONS (COMMERCIAL, PAYMENT, DELIVERY & STATUTORY) */}
        {/* ========================================================================= */}
        {currentStep === 6 && (
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Context Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-900 via-brand-900 to-indigo-950 text-white rounded-2xl border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-800/80 border border-indigo-400/40 text-indigo-200 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Contractual Terms & Conditions, Payment Milestones & Delivery Schedules</h4>
                  <p className="text-indigo-200/80 text-[11px] mt-0.5">Define requisition-level commercial baseline: payment structure, advance terms, delivery SLA, LD penalty clause, DLP, and warranty conditions.</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-[10px] uppercase font-bold text-indigo-300 mr-1 hidden sm:inline">Templates:</span>
                <button 
                  type="button" 
                  onClick={() => loadTermsPreset('standard_construction')} 
                  className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all border border-indigo-400/40 shadow-xs"
                >
                  🏢 Milestone / CAPEX
                </button>
                <button 
                  type="button" 
                  onClick={() => loadTermsPreset('direct_supply')} 
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700 shadow-xs"
                >
                  📦 Supply / 30-Day Credit
                </button>
                <button 
                  type="button" 
                  onClick={() => loadTermsPreset('progressive_ra')} 
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700 shadow-xs"
                >
                  📊 Monthly RA Bills
                </button>
              </div>
            </div>

            {/* SECTION 1: PAYMENT TERMS & FINANCIAL GOVERNANCE */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                <CreditCard className="w-4 h-4 text-sky-600" />
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">1. Payment Terms & Milestone Structure</h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Payment Milestone Structure :*</label>
                  <select 
                    value={tcPaymentStructure} 
                    onChange={(e) => handlePaymentStructureChange(e.target.value)} 
                    className="w-full bg-slate-50 text-slate-900 font-bold border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="MILESTONE_10_70_10_10">10% Adv + 70% Supply/Progress + 10% Handover + 10% DLP (Standard CAPEX)</option>
                    <option value="CREDIT_30_DAYS">100% Against 30 Days Net Credit post-GRN (Supply Only)</option>
                    <option value="CREDIT_45_DAYS">100% Against 45 Days Net Credit post-GRN (Supply Only)</option>
                    <option value="PROGRESSIVE_RA">Progressive Monthly RA Bills (5% Adv, 85% RA, 10% Retention)</option>
                    <option value="CUSTOM">Custom Structured Milestone Plan (Detailed Below)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Advance Payment (% of Order) :*</label>
                  <input 
                    type="text" 
                    value={tcAdvancePct} 
                    onChange={(e) => setTcAdvancePct(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Retention Money / Security Deposit (%):*</label>
                  <input 
                    type="text" 
                    value={tcRetentionPct} 
                    onChange={(e) => setTcRetentionPct(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Credit Period / Invoice Payment Days :*</label>
                  <input 
                    type="text" 
                    value={tcCreditDays} 
                    onChange={(e) => setTcCreditDays(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Advance Bank Guarantee (ABG) Required? :*</label>
                  <select 
                    value={tcAbgRequired} 
                    onChange={(e) => setTcAbgRequired(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="YES">YES - Mandatory 110% ABG for all Mobilization Advance</option>
                    <option value="NO">NO - Waived for Empanelled Tier-1 Rate Card Vendors</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Statutory TDS & GST Terms :*</label>
                  <input 
                    type="text" 
                    value={tcTaxTerms} 
                    onChange={(e) => setTcTaxTerms(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

              </div>
            </div>

            {/* SECTION 2: DELIVERY TIMELINES, LEAD TIME & LIQUIDATED DAMAGES */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">2. Delivery Timelines, Schedule & Delay Penalties</h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Committed Lead Time / Dispatch SLA :*</label>
                  <input 
                    type="text" 
                    value={tcLeadTime} 
                    onChange={(e) => setTcLeadTime(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Site Handover / Completion Target Date :*</label>
                  <input 
                    type="text" 
                    value={tcCompletionDate} 
                    onChange={(e) => setTcCompletionDate(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block font-bold text-slate-900">Phased Staging & Dispatch Schedule :</label>
                  <textarea 
                    rows={2} 
                    value={tcPhasedDeliveryPlan} 
                    onChange={(e) => setTcPhasedDeliveryPlan(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-normal border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block font-bold text-rose-700">Liquidated Damages (LD) Delay Penalty Clause :*</label>
                  <input 
                    type="text" 
                    value={tcLdClause} 
                    onChange={(e) => setTcLdClause(e.target.value)} 
                    className="w-full bg-rose-50/50 text-rose-950 font-semibold border border-rose-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-400" 
                  />
                </div>

              </div>
            </div>

            {/* SECTION 3: WARRANTY, QUALITY, INCOTERMS & STATUTORY CONDITIONS */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">3. Warranty, Defect Liability, IncoTerms & Special Conditions</h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Defect Liability Period (DLP) :*</label>
                  <select 
                    value={tcDlp} 
                    onChange={(e) => setTcDlp(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="12_MONTHS">12 Months from Final Handover / Completion</option>
                    <option value="24_MONTHS">24 Months from Final Handover / Completion</option>
                    <option value="36_MONTHS">36 Months Comprehensive Warranty</option>
                    <option value="NONE">No DLP (Consumable Direct Supply)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Manufacturer / OEM Warranty Coverage :*</label>
                  <input 
                    type="text" 
                    value={tcWarranty} 
                    onChange={(e) => setTcWarranty(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Price Basis & IncoTerms :*</label>
                  <select 
                    value={tcIncoterms} 
                    onChange={(e) => setTcIncoterms(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="FOR_SITE">FOR Site (Inclusive of Packing, Forwarding, Freight & Transit Insurance)</option>
                    <option value="EX_WORKS">Ex-Works Factory (Client Freight & Transit Scope)</option>
                    <option value="FOB">FOB / Port Delivery</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Price Firmness Clause :*</label>
                  <input 
                    type="text" 
                    value={tcPriceFirmness} 
                    onChange={(e) => setTcPriceFirmness(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block font-bold text-slate-900">Special Project Contractual Conditions / Notes :</label>
                  <textarea 
                    rows={2} 
                    value={tcSpecialConditions} 
                    onChange={(e) => setTcSpecialConditions(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-normal border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

              </div>
            </div>

            {/* Bottom Confirmation Bar for Step 6 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Contractual Payment & Delivery Terms configured and ready for validation.</span>
              </div>
              <button 
                onClick={() => setCurrentStep(7)} 
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 whitespace-nowrap"
              >
                <span>Confirm Terms & Conditions & Proceed to Step 7: Documents →</span>
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 7: DOCUMENTS & ATTACHMENTS */}
        {/* ========================================================================= */}
        {currentStep === 7 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs">
              <span className="font-bold text-purple-950 block text-sm">Engineering Attachments & Reference Documents:</span>
              <p className="text-purple-800 mt-0.5">Attach drawings, specification sheets, and site photos for Project Head & Category Manager review.</p>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-purple-300 bg-purple-50/40 rounded-2xl p-6 text-center space-y-3">
              <FileUp className="w-8 h-8 text-purple-600 mx-auto" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Drag & Drop Documents or Browse</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF, DWG, DOCX, XLSX, PNG, JPG</p>
              </div>
              <input type="file" id="nextPrFileInput" multiple className="hidden" onChange={handleFileUpload} />
              <button 
                onClick={() => document.getElementById('nextPrFileInput')?.click()} 
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm"
              >
                + Choose Document Files
              </button>
            </div>

            {/* Documents List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center">
                  <Paperclip className="w-3.5 h-3.5 text-purple-600 mr-1.5" />
                  Attached Documents ({documents.length} files)
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 font-bold border-b text-slate-800">
                    <tr>
                      <th className="p-2.5">Document Name</th>
                      <th className="p-2.5 w-36">Document Type</th>
                      <th className="p-2.5 w-24">Size</th>
                      <th className="p-2.5 w-28">Date</th>
                      <th className="p-2.5 w-24 text-center">Status</th>
                      <th className="p-2.5 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {documents.map((doc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900 flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span>{doc.name}</span>
                        </td>
                        <td className="p-2.5 text-slate-600">{doc.type}</td>
                        <td className="p-2.5 font-mono text-slate-500">{doc.size}</td>
                        <td className="p-2.5 font-mono text-slate-500">{doc.date}</td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{doc.status}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button onClick={() => setDocuments(documents.filter((_, i) => i !== idx))} className="text-rose-500 hover:text-rose-700">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button 
            onClick={() => setCurrentStep(1)} 
            className="text-rose-600 hover:bg-rose-50 border border-rose-300 font-bold text-xs px-4 py-2 rounded-xl transition-all"
          >
            Cancel PR Creation
          </button>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-slate-500 font-bold">Step {currentStep}/7</span>

            {currentStep > 1 && (
              <button 
                onClick={() => setCurrentStep(currentStep - 1)} 
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}

            {currentStep < 7 ? (
              <button 
                onClick={() => setCurrentStep(currentStep + 1)} 
                className="bg-sky-600 hover:bg-sky-700 text-white font-black text-xs px-6 py-2 rounded-xl shadow-md flex items-center space-x-1.5"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleSubmitPR} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-2 rounded-xl shadow-md flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit PR with BOQ to Project Head (Role 2) →</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
