import type { ComponentType } from 'react';
import type { BOQItem, MLEOBreakdown, VendorQuoteDetail } from './procurement';

// --- Header ---
export interface NavItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  highlight?: boolean;
}

export interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenNewPR: () => void;
}

// --- Dashboard ---
export interface DashboardProps {
  onNavigate: (tab: string) => void;
}

// --- PR Module ---
export interface PRModuleProps {
  onSelectPRForBOQ?: (prId: string) => void;
  onNavigateToBOQ?: (prId: string) => void;
  onOpenNewPRModal?: () => void;
}

export interface RequesterBOQItem {
  code: string;
  desc: string;
  uom: string;
  qty: number;
}

export interface AttachedDoc {
  name: string;
  type: string;
  size: string;
  date: string;
  status: string;
}

export interface VendorItem {
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

// --- PR Approval Queue ---
export interface PRApprovalQueueProps {
  onRouteToCategoryManager?: () => void;
}

// --- Category Manager Hub ---
export interface CategoryManagerHubProps {
  onRouteToPPO: () => void;
}

export interface BOQItemWithMLEO {
  code: string;
  desc: string;
  uom: string;
  qty: number;
  rateCard: number;
  benchmark: number;
  bestHistoricalPrice: number;
  prevPo: string;
  mleo: MLEOBreakdown;
  vendorRateCards?: Record<string, number>;
  vendorQuotes?: Record<string, VendorQuoteDetail>;
}

export interface PRData {
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

// --- BOQ Studio ---
export interface DrawingScope {
  title: string;
  scopeName: string;
  scopeDesc: string;
  items: BOQItem[];
}

export interface BOQStudioProps {
  selectedPRId: string;
  onNavigateToCommercial: () => void;
}

// --- Commercial Evaluation ---
export interface CommercialCounterItem {
  code: string;
  desc: string;
  uom: string;
  qty: number;
  rateCard: number;
  quotedRate: number;
  benchmark: number;
  mleo: { m: number; l: number; e: number; o: number; conf: string };
  std: number;
}

export interface CommercialEvalProps {
  onNavigateToAICost: () => void;
  onNavigateToPPO: () => void;
}

// --- AICostStudio ---
export interface AICostStudioProps {
  onNavigateToNegotiation: () => void;
}

export interface MLEOPillars {
  material: { percentage: number; cost: number; description: string };
  labour: { percentage: number; cost: number; description: string };
  equipment: { percentage: number; cost: number; description: string };
  overheads: { percentage: number; cost: number; description: string };
}

export interface CostInflator {
  title: string;
  description: string;
}

export interface NegotiationScript {
  title: string;
  argument: string;
}

export interface PresetItem {
  name: string;
  qty: number;
  uom: string;
  quote: number;
}

// --- PPO Module ---
export interface PPOModuleProps {
  onOpenCreatePPO?: () => void;
}

// --- Vendor Portal ---
export interface VendorQuoteItem {
  code: string;
  desc: string;
  uom: string;
  qty: number;
  rate1: number;
  targetRate: number;
  rate2: number;
}

// --- Masters & Audit ---
export interface MastersItem {
  code: string;
  cat: string;
  rate: string;
  uom: string;
  region: string;
}

export interface VendorCommercialTerms {
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
}

