import type {
  TenantConfig,
  TenantKey,
  UserRole,
  PurchaseRequest,
  VendorQuote,
  NegotiationEvent,
  PPOItem,
  PurchaseOrder,
  AuditLog,
  VendorRFQItem,
} from './procurement';
import type {
  BudgetCategory,
  ProjectBudgetState,
  AddCategoryInput,
  AddSubCategoryInput,
  AddStandardBOQItemInput,
  SubCategory,
  StandardBOQItem,
} from './budget';
import type { PricingTierId } from './pricing';
import type {
  ManagedVendor,
  VendorCSVRow,
  VendorEvaluationSubmission,
  VendorEvaluationScoreResult,
  VendorPPORating,
} from './vendor-management';

export interface ProcurementContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeTenantKey: TenantKey;
  activeTenant: TenantConfig;
  changeTenant: (key: TenantKey) => void;
  tenants: Record<TenantKey, TenantConfig>;
  // Multi-Tenant Pricing & Feature Gating
  activeTenantTier: PricingTierId;
  tenantTiers: Record<TenantKey, PricingTierId>;
  changeTenantTier: (tenantKey: TenantKey, newTier: PricingTierId) => void;
  isModuleAllowed: (moduleId: string) => boolean;
  isRoleAllowed: (role: UserRole) => boolean;
  prs: PurchaseRequest[];
  quotes: Record<string, VendorQuote[]>;
  negotiations: Record<string, NegotiationEvent[]>;
  ppos: PPOItem[];
  pos: PurchaseOrder[];
  auditLogs: AuditLog[];
  circulatedRFQs: Record<string, VendorRFQItem>;
  circulateRFQ: (prId: string, invitedVendors: string[], closureDate?: string) => void;
  submitVendorQuote?: (
    prId: string,
    vendorId: string,
    round: number,
    totalAmount: number,
    remarks?: string,
    lineRates?: Record<string, number>
  ) => void;
  submitBuyerCounterOffer?: (
    prId: string,
    vendorId: string,
    round: number,
    totalAmount: number,
    remarks?: string,
    lineRates?: Record<string, number>
  ) => void;
  // Budget Planning (Finance Manager)
  projectCategories: BudgetCategory[];
  projectBudget: ProjectBudgetState;
  updateItemQuantity: (categoryId: string, itemId: string, newQty: number) => void;
  updateContingencyRate: (newRatePercent: number) => void;
  updateProjectSqFt: (newSqFt: number) => void;
  freezeBudgetBaseline: () => void;
  resetCategoryQuantities: (categoryId: string) => void;
  downloadCategoryBOQCSV: (categoryId: string) => void;
  downloadProjectBudgetCSV: () => void;
  downloadCategorySummaryCSV: () => void;
  // Master Standard BOQ & Category Governance (Module 2 & 3)
  addCategory: (input: AddCategoryInput) => BudgetCategory;
  addSubCategory: (input: AddSubCategoryInput) => SubCategory;
  addStandardBOQItem: (input: AddStandardBOQItemInput) => StandardBOQItem;
  uploadBatchStandardBOQItems: (items: AddStandardBOQItemInput[]) => StandardBOQItem[];
  toggleItemHoldStatus: (categoryId: string, itemId: string) => void;
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
  createPR: (pr: Omit<PurchaseRequest, 'id' | 'status' | 'buyer'> & { id?: string }) => PurchaseRequest | null;
  updatePRStatus: (id: string, status: PurchaseRequest['status'], comments?: string) => void;
  approvePRByProjectHead: (id: string) => void;
  updateBOQItems: (prId: string, items: PurchaseRequest['items']) => void;
  addNegotiationRound: (prId: string, rate: number, remarks: string, actionType: string) => void;
  createPPO: (ppo: Omit<PPOItem, 'id' | 'status' | 'createdDate'>) => void;
  approvePPO: (ppoId: string) => void;
  resetToSampleData: () => void;
  // Vendor Management & Evaluation (Module 2 & 3)
  managedVendors: ManagedVendor[];
  addClientVendors: (newVendors: VendorCSVRow[]) => void;
  addSingleClientVendor: (
    vendor: Omit<
      ManagedVendor,
      'id' | 'source' | 'evaluationStatus' | 'ppoRatings' | 'compositeRating' | 'totalPPOsCompleted'
    >
  ) => void;
  submitVendorEvaluation: (
    vendorId: string,
    submission: VendorEvaluationSubmission
  ) => VendorEvaluationScoreResult;
  submitPPORating: (
    vendorId: string,
    rating: Omit<VendorPPORating, 'id' | 'ratedAt'>
  ) => void;
  sendEvaluationInvite: (vendorId: string, email: string) => void;
}

