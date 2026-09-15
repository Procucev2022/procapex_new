import type { PricingTierId } from './pricing';

export type TenantKey = 'TNT_LNT' | 'TNT_TATA' | 'TNT_GODREJ' | 'TNT_SHAPOORJI';

export interface TenantUser {
  name: string;
  title: string;
}

export interface TenantConfig {
  id: string;
  name: string;
  short: string;
  project: string;
  tier: PricingTierId;
  vendor?: string;
  team: Record<string, TenantUser>;
}

export type UserRole = 
  | 'BOQ_RFQ_MANAGER'       // 1. BOQ & RFQ Management (Project Team & Category Manager)
  | 'VENDOR_NEGOTIATION_HUB' // 2. Vendor Negotiation Hub
  | 'CATEGORY_MANAGER_2'    // 3. Category Manager 2 (Procurement Head Approver / PPO Approver)
  | 'PROJECT_HEAD_PPO'      // 4. Project Head (PPO Approver)
  | 'FINANCE_HEAD'          // 5. Finance Head (Budget Planning)
  | 'VENDOR'                // 6. Vendor (Supplier Portal)
  | 'PROJECT_TEAM'          // Project Team (Legacy / Sub-role)
  | 'PROJECT_HEAD_PR'       // Legacy Project Head (PR Approver)
  | 'CATEGORY_MANAGER'      // Category Manager (Legacy / Sub-role)
  | 'BUYER'
  | 'REQUESTER'
  | 'ESTIMATOR'
  | 'APPROVER'
  | 'ADMIN';

export type PRStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED_BY_PROJECT_HEAD' | 'ACCEPTED_BY_CATEGORY_MGR' | 'CANCELLED';

export type PPOApprovalStage = 
  | 'RAISED_BY_CATEGORY_MGR'
  | 'TIER_1_PENDING_CAT_MGR_2'
  | 'TIER_2_PENDING_PROJECT_HEAD'
  | 'TIER_3_PENDING_FINANCE_HEAD'
  | 'APPROVED_PO_ISSUED'
  | 'REJECTED';

export interface MLEOBreakdown {
  m: number;
  l: number;
  e: number;
  o: number;
  conf?: string;
}

export interface VendorQuoteDetail {
  initialRate: number;
  revisedRate?: number | null;
  finalRate?: number | null;
  buyerOffer1?: number | null;
  buyerOffer2?: number | null;
}

export interface BOQItem {
  code: string;
  desc: string;
  uom: string;
  qty: number;
  rateCard?: number;
  quotedRate?: number;
  benchmark?: number;
  std?: number;
  aiConf?: string;
  mleo?: MLEOBreakdown;
  vendorQuotes?: Record<string, VendorQuoteDetail>;
  vendorRateCards?: Record<string, number>;
  specs?: Record<string, string>;
}

export interface PurchaseRequest {
  id: string;
  tenantId?: string;
  title: string;
  projectName: string;
  costCentre: string;
  category: string;
  requester: string;
  createdDate?: string;
  reqDate?: string;
  requiredDate?: string;
  status: PRStatus | string;
  buyer?: string;
  remarks?: string;
  nominatedVendors?: string[];
  deliveryAddress?: string;
  items: BOQItem[];
}

export interface VendorMaster {
  id: string;
  name: string;
  category: string;
  rating: number;
  isRateCard: boolean;
  city: string;
  leadTime: string;
}

export interface VendorQuote {
  vendor: string;
  rate: number;
  gst: number;
  leadTime: string;
  validTill: string;
  isL1: boolean;
}

export interface NegotiationEvent {
  round: number;
  user: string;
  type: string;
  rate: number;
  remarks: string;
  timestamp: string;
}

export interface NonL1Justification {
  category: string;
  text: string;
}

export interface PPOProposal {
  id: string;
  tenantId: string;
  prId: string;
  title: string;
  vendorName: string;
  vendorId?: string;
  negotiatedTotal: number;
  initialTotal: number;
  savingsTotal: number;
  savingsPct: number;
  approvalStage: PPOApprovalStage;
  tier1Approved: boolean;
  tier2Approved: boolean;
  tier3Approved: boolean;
  poNumber?: string;
  isNonL1?: boolean;
  nonL1Justification?: NonL1Justification;
}

export interface PPOItem {
  id: string;
  prId: string;
  vendor: string;
  itemDesc: string;
  unitRate: number;
  qty: number;
  totalVal: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  status: string;
  createdDate?: string;
  paymentTerms?: string;
  leadTime?: string;
  isNonL1?: boolean;
  nonL1Justification?: NonL1Justification;
}

export interface PurchaseOrder {
  id: string;
  ppoId?: string;
  ppoRef?: string;
  prId?: string;
  prRef?: string;
  vendor: string;
  issuedDate?: string;
  issueDate?: string;
  deliveryDate?: string;
  grandTotal?: number;
  amount?: number;
  status: 'ISSUED' | 'DISPATCHED' | 'DELIVERED';
}

export interface AuditLog {
  id?: string;
  timestamp?: string;
  time?: string;
  user: string;
  role?: string;
  action: string;
  targetId?: string;
  details?: string;
  detail?: string;
}

export interface VendorRFQItem {
  id: string;
  prId: string;
  title: string;
  projectName: string;
  category: string;
  closureDate: string;
  site?: string;
  contact?: string;
  invitedVendors: string[];
  status: 'PENDING' | 'ACCEPTED' | 'QUOTED' | 'CLOSED';
  itemsCount: number;
  items: BOQItem[];
}

