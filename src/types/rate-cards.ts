import type { BOQItem } from './procurement';

export type RateCardStatus =
  | 'DRAFT'
  | 'PROPOSAL_SENT'
  | 'COUNTER_OFFERED'
  | 'ACCEPTED'
  | 'FINALISED'
  | 'EXPIRED';

export interface RateCardLineItem {
  itemCode: string;
  desc: string;
  uom: string;
  aiShouldCost: number;
  recentBestRate?: number;
  lastPpoRate?: number;
  proposedRate: number;
  sellerCounterRate?: number;
  finalAgreedRate: number;
  notes?: string;
}

export interface RateCardAgreement {
  id: string;
  vendorId: string;
  vendorName: string;
  categoryCode: string;
  categoryName: string;
  status: RateCardStatus;
  version: number;
  effectiveDate: string;
  expiryDate: string;
  items: RateCardLineItem[];
  totalItemsCount: number;
  averageDiscountPct?: number;
  lastUpdated: string;
  updatedBy: string;
  paymentTerms?: string;
  leadTimeDays?: number;
}

export interface CreateRateCardProposalInput {
  vendorId: string;
  vendorName: string;
  categoryCode: string;
  categoryName: string;
  items: Array<{
    itemCode: string;
    desc: string;
    uom: string;
    aiShouldCost: number;
    recentBestRate?: number;
    lastPpoRate?: number;
    proposedRate: number;
    notes?: string;
  }>;
  paymentTerms?: string;
  leadTimeDays?: number;
}

export interface PRRateCardCoverage {
  vendorId: string;
  vendorName: string;
  isFullyCovered: boolean;
  coveragePct: number;
  totalPrItemsCount: number;
  coveredItemsCount: number;
  deltaItemsCount: number;
  coveredItems: Array<{
    prItemCode: string;
    desc: string;
    qty: number;
    rateCardRate: number;
    totalVal: number;
  }>;
  deltaItems: BOQItem[];
}

export interface AddItemToRateCardInput {
  vendorId: string;
  categoryCode: string;
  itemCode: string;
  desc: string;
  uom: string;
  agreedRate: number;
  notes?: string;
}

export interface RateCardModuleProps {
  initialSubTab?: 'active' | 'create_proposal' | 'negotiations';
  selectedVendorId?: string;
  onRouteToRFQ?: () => void;
  onRouteToPPO?: () => void;
}

export interface CreateRateCardProposalViewProps {
  onProposalCreated?: (createdId: string) => void;
  onCancel?: () => void;
}

export interface RateCardAgreementCardProps {
  agreement: RateCardAgreement;
  onSelectAgreement: (agreement: RateCardAgreement) => void;
  onFinalize?: (id: string) => void;
  isSelected?: boolean;
}

export interface RateCardLineItemsTableProps {
  items: RateCardLineItem[];
  status: RateCardStatus;
}

export interface RateCardNegotiationViewProps {
  agreements: RateCardAgreement[];
  onAcceptProposal?: (id: string) => void;
  onCounterOffer?: (id: string, counterRates: Record<string, number>) => void;
  onFinalize?: (id: string) => void;
}

export interface VendorRateCardCategoryCoverage {
  vendorId: string;
  vendorName: string;
  categoryCode: string;
  categoryName: string;
  totalStandardBOQItems: number;
  coveredItemsCount: number;
  coveragePct: number;
  isFullyCovered: boolean;
  rateCardId?: string;
  rateCardStatus?: RateCardStatus;
  coveredItems: RateCardLineItem[];
  missingStandardBOQItems: Array<{
    code: string;
    desc: string;
    uom: string;
    benchmarkRate: number;
  }>;
}

export interface VendorProfileRateCardTabProps {
  vendorId: string;
  vendorName: string;
  vendorCategory: string;
  vendorCategories?: string[];
  isVendorPortal?: boolean;
  onConfirmRateCard?: (agreementId: string) => void;
  onCounterOffer?: (agreementId: string, counterRates: Record<string, number>) => void;
  onFinalizeRateCard?: (agreementId: string) => void;
  onAddStandardBOQItemToRateCard?: (input: AddItemToRateCardInput) => void;
}

