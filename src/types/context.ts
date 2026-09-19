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
  BOQItem,
} from './procurement';
import type {
  RateCardAgreement,
  CreateRateCardProposalInput,
  PRRateCardCoverage,
  AddItemToRateCardInput,
  VendorRateCardCategoryCoverage,
} from './rate-cards';
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
  VendorCatalogueItemPrice,
  SendCatalogueIntimationInput,
} from './vendor-management';
import type {
  EAuctionSession,
  SubmitBidInput,
  SetProxyFloorInput,
  BidValidationResult,
} from './eauction';

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
  updateVendorCataloguePrices: (
    vendorId: string,
    prices: Record<string, VendorCatalogueItemPrice>
  ) => void;
  sendVendorCatalogueIntimation: (
    input: SendCatalogueIntimationInput
  ) => void;
  updateVendorCategories: (
    vendorId: string,
    categories: string[]
  ) => void;
  // Rate Card Management (Module 4)
  rateCards: RateCardAgreement[];
  createRateCardProposal: (input: CreateRateCardProposalInput) => RateCardAgreement;
  sellerRespondRateCardProposal: (
    id: string,
    action: 'ACCEPT' | 'COUNTER',
    counterRates?: Record<string, number>
  ) => void;
  finalizeRateCard: (id: string) => void;
  addItemToRateCard: (input: AddItemToRateCardInput) => void;
  checkPRRateCardCoverage: (prItems: BOQItem[], vendorId: string) => PRRateCardCoverage;
  getVendorCategoryRateCardCoverage: (vendorId: string, categoryCodeOrName?: string) => VendorRateCardCategoryCoverage;
  getLinePricingReferences: (itemCode: string) => {
    aiCost: number;
    recentBestRate?: number;
    lastPpoRate?: number;
    aiConfidence?: string;
  };
  // E-Auction Management (Module 5)
  eauctions: EAuctionSession[];
  activeEAuctionId: string | null;
  setActiveEAuctionId: (id: string | null) => void;
  getEAuctionByPRId: (prId: string) => EAuctionSession | undefined;
  startEAuction: (auctionId: string) => void;
  pauseEAuction: (auctionId: string) => void;
  resumeEAuction: (auctionId: string) => void;
  extendEAuction: (auctionId: string, extensionSeconds?: number) => void;
  concludeEAuction: (auctionId: string) => void;
  submitEAuctionBid: (input: SubmitBidInput) => BidValidationResult;
  setEAuctionProxyFloor: (input: SetProxyFloorInput) => void;
  simulateNextCompetitiveBid: (auctionId: string) => boolean;
  awardEAuctionToL1: (
    auctionId: string
  ) => { winnerVendorId: string; winningPrice: number } | null;
}

