import type { ComponentType } from 'react';
import type { BOQItem, MLEOBreakdown, VendorQuoteDetail, VendorRFQItem } from './procurement';

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
  onOpenNewPR?: () => void;
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
  onViewPRSummary?: (prId?: string) => void;
}

export interface RequesterBOQItem {
  code: string;
  desc: string;
  uom: string;
  qty: number;
  rateCard?: number;
  benchmark?: number;
  std?: number;
  aiConf?: string;
  drawingElevation?: string;
  status?: string;
  isRefined?: boolean;
  aiRationale?: string;
  refinedSpecs?: string;
}

export interface AmendCategoryOption {
  id: string;
  name: string;
  subCategories?: Array<{ id: string; name: string }>;
}

export interface AmendBOQModalProps {
  isOpen: boolean;
  item: RequesterBOQItem | null;
  index: number;
  onClose: () => void;
  onSave: (
    amendedItem: RequesterBOQItem,
    index: number,
    addToStandardBOQ: boolean,
    categoryId?: string,
    subCategoryId?: string,
  ) => void;
  availableCategories?: AmendCategoryOption[];
  currentCategoryName?: string;
  subCategoryHint?: string;
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
  source?: 'PROCAPX_PLATFORM' | 'CLIENT_ONBOARDED';
  categories?: string[];
}

// --- PR Approval Queue ---
export interface PRApprovalQueueProps {
  onRouteToCategoryManager?: () => void;
}

// --- Category Manager Hub ---
export interface CategoryManagerHubProps {
  initialPRId?: string;
  onRouteToPPO?: () => void;
  onRouteToNegotiation?: () => void;
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
  buyerOffer1: number;
  targetRate: number;
  rate2: number;
  buyerOffer2: number;
  rate3: number;
}

export interface VendorQuotedTerms {
  paymentStructure: string;
  creditDays: string;
  advPct: string;
  retPct: string;
  abg: string;
  leadTime: string;
  deliveryDate: string;
  incoterms: string;
  warranty: string;
  deviations: string;
}

export interface VendorRFQSummaryTabProps {
  rfqId: string;
  rfqAccepted: boolean;
  onAcceptRfq: (rfqId?: string) => void;
  onProceedToQuotation: () => void;
  items: VendorQuoteItem[];
  activeVendorName: string;
  activeVendorId?: string;
  allVendorRFQs?: VendorRFQItem[];
  onSelectRFQ?: (rfqId: string) => void;
  activeRFQItem?: VendorRFQItem;
}

export interface VendorQuotationSummaryTabProps {
  items: VendorQuoteItem[];
  rfqAccepted: boolean;
  onRate1Change: (idx: number, val: string) => void;
  onRate2Change: (idx: number, val: string) => void;
  onRate3Change: (idx: number, val: string) => void;
  quote1Submitted: boolean;
  quote2Submitted: boolean;
  quote3Submitted: boolean;
  onSubmitQuote1: () => void;
  onSubmitQuote2: () => void;
  onSubmitQuote3: () => void;
  terms: VendorQuotedTerms;
  onUpdateTerms: (terms: VendorQuotedTerms) => void;
  onProceedToPPO: () => void;
  activeRound?: 1 | 2 | 3 | 'all';
  onSelectRound?: (round: 1 | 2 | 3 | 'all') => void;
}

export interface VendorPPOAwardTabProps {
  ppoAccepted: boolean;
  onAcceptPPO: () => void;
  items: VendorQuoteItem[];
  activeVendorName: string;
  terms: VendorQuotedTerms;
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

// --- BOQ and RFQ Management Module ---
export interface BOQAndRFQManagementModuleProps {
  initialSubTab?: 'boq_studio' | 'prs_summary' | 'rfq_hub';
  selectedPRId?: string;
  onOpenNewPRModal?: () => void;
  onRouteToPPO?: () => void;
  onRouteToNegotiation?: () => void;
}

// --- Vendor Portal & Login ---
export interface VendorPortalProps {
  initialAuthenticated?: boolean;
}

export interface VendorLoginViewProps {
  vendors: VendorItem[];
  selectedVendorId: string;
  onSelectVendor: (vendorId: string) => void;
  onLoginSuccess: (vendorId: string) => void;
}

export interface VendorManagementModuleProps {
  onRouteToVendorPortal?: () => void;
}
