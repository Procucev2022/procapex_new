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
  team: Record<UserRole, TenantUser>;
}

export type UserRole = 
  | 'PROJECT_TEAM'          // 1. Project Team (PR Raiser)
  | 'PROJECT_HEAD_PR'       // 2. Project Head (PR Approver)
  | 'CATEGORY_MANAGER'      // 3. Category Manager (Buyer / Procurement / PPO Raiser)
  | 'CATEGORY_MANAGER_2'    // 4. Category Manager 2 (Procurement Head Approver / PPO Approver)
  | 'PROJECT_HEAD_PPO'      // 5. Project Head (PPO Approver)
  | 'FINANCE_HEAD'          // 6. Finance Head (PPO Approver & PO Release)
  | 'VENDOR';               // 7. Vendor (Supplier Portal)

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
  isNonL1?: boolean;
  nonL1Justification?: NonL1Justification;
}

export interface PurchaseOrder {
  id: string;
  ppoId: string;
  prId: string;
  vendor: string;
  issuedDate: string;
  deliveryDate: string;
  grandTotal: number;
  status: 'ISSUED' | 'DISPATCHED' | 'DELIVERED';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  targetId: string;
  details: string;
}
