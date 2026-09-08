/**
 * Internationalization (i18n) & UI Strings Type Definitions
 *
 * Strongly-typed data contracts for user-facing strings,
 * template substitution parameters, and localization dictionaries.
 */

export type StringTemplateValues = Record<string, string | number | boolean | null | undefined>;

export type SupportedLocale = 'en-US' | 'es' | 'de' | 'fr' | 'hi';

export interface UIStringsCommon {
  appName: string;
  appSubtitle: string;
  appTagline: string;
  loading: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  confirm: string;
  submit: string;
  back: string;
  close: string;
  export: string;
  download: string;
  viewDetails: string;
  search: string;
  filter: string;
  status: string;
  actions: string;
  category: string;
  project: string;
  vendor: string;
  amount: string;
  quantity: string;
  rate: string;
  date: string;
  all: string;
  na: string;
  notAvailable: string;
  active: string;
  inactive: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  selectOption: string;
  showingResultsTemplate: string;
}

export interface UIStringsHeader {
  brandName: string;
  brandBadge: string;
  brandDescription: string;
  clientLabel: string;
  roleLabel: string;
  raisePRButton: string;
  directPPOButton: string;
  switchRoleAria: string;
  switchClientAria: string;
}

export interface UIStringsDashboard {
  sourcingCommandTemplate: string;
  defaultTitle: string;
  activePRs: string;
  workOrdersIssued: string;
  stage1: string;
  stage2: string;
  stage3: string;
  stage4: string;
  resetToSample: string;
  sourceToAwardPipeline: string;
  quickActions: string;
  spendAnalytics: string;
  totalSpend: string;
  projectedSavings: string;
  negotiationYield: string;
}

export interface UIStringsTenantOverview {
  title: string;
  subtitle: string;
  gridTitle: string;
  gridSubtitle: string;
  activeProject: string;
  assignedCostCentres: string;
  governancePersonnel: string;
  currentActiveClient: string;
  switchToClient: string;
  activeBadge: string;
}

export interface UIStringsPRApprovalQueue {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptySubtitle: string;
  approveButton: string;
  rejectButton: string;
  approvedBadge: string;
  pendingBadge: string;
  rejectedBadge: string;
  viewBOQ: string;
  routeToCM: string;
  clearanceRemarks: string;
}

export interface UIStringsMastersAudit {
  title: string;
  subtitle: string;
  tableItem: string;
  tableCategory: string;
  tableBenchmark: string;
  tableRateCard: string;
  tableVariance: string;
  tableUOM: string;
  tableStatus: string;
  auditTrailTitle: string;
  auditTrailSubtitle: string;
}

export interface UIStringsCommercialEval {
  title: string;
  subtitle: string;
  l1Vendor: string;
  potentialSavings: string;
  lowestQuoted: string;
  targetBenchmark: string;
  initiateNegotiation: string;
  comparativeSummary: string;
  card1: string;
  card2: string;
  card3: string;
  card4: string;
  proceedToPPO: string;
  invokeAICosting: string;
  detailedAnalysis: string;
}

export interface UIStringsNegotiationHub {
  title: string;
  subtitle: string;
  vendorRate: string;
  targetRate: string;
  currentRoundTemplate: string;
  roundTemplate: string;
  generateCounterOffer: string;
  recommendedRate: string;
  strategyAdvice: string;
  counterRemarks: string;
  acceptOffer: string;
  submitCounter: string;
  timelineTitle: string;
}

export interface UIStringsAICostStudio {
  badge: string;
  title: string;
  subtitle: string;
  modelLabel: string;
  modelEnvNote: string;
  analyzeItemTitle: string;
  quickPresetsHint: string;
  itemDescriptionLabel: string;
  itemDescriptionPlaceholder: string;
  quantityUomLabel: string;
  quotedRateLabel: string;
  analyzing: string;
  runAnalysis: string;
  activeAiEngine: string;
  liveCostComplete: string;
  costBreakdown: string;
  targetFairRate: string;
  materials: string;
  labour: string;
  equipment: string;
  overhead: string;
  materialsTemplate: string;
  labourTemplate: string;
  equipmentTemplate: string;
  overheadTemplate: string;
  aiConfidence: string;
  costInflatorsTitle: string;
  buyerOverrideTitle: string;
  auditableDecision: string;
  recommendedTargetRate: string;
  maxWalkAwayLimit: string;
  sendToNegotiationHub: string;
  negotiationScriptTitle: string;
  negotiationScriptSubtitle: string;
  indicesVerified: string;
  geminiIntelligence: string;
}

export interface UIStringsBOQStudio {
  scopeBadge: string;
  title: string;
  subtitle: string;
  drawingNameLabel: string;
  drawingNamePlaceholder: string;
  extractButton: string;
  quickPresets: string;
  scopedBoundary: string;
  addItem: string;
  importDrawing: string;
  itemCode: string;
  itemDescription: string;
  quantity: string;
  uom: string;
  rateCardRate: string;
  totalAmount: string;
  specsSheet: string;
  action: string;
  packageTotalLabel: string;
  specsModalTitleTemplate: string;
  close: string;
  specsButton: string;
  commercialCheckButton: string;
  specsCountTemplate: string;
}

export interface UIStringsPPOModule {
  title: string;
  subtitle: string;
  tabWorkflow: string;
  tabAllPPOsTemplate: string;
  tabIssuedPOsTemplate: string;
  badgePoReleased: string;
  badgeTier3InProgress: string;
  badgeTier2InProgress: string;
  badgeTier1InProgress: string;
  tier1Title: string;
  tier1Desc: string;
  tier1SignOff: string;
  tier1SignedTemplate: string;
  tier2Title: string;
  tier2Desc: string;
  tier2SignOff: string;
  tier2SignedTemplate: string;
  tier3Title: string;
  tier3Desc: string;
  tier3SignOff: string;
  tier3SignedTemplate: string;
  badgeApproved: string;
  badgePending: string;
  badgeAwaitingTier1: string;
  badgeAwaitingTier2: string;
  badgeApprovedIssued: string;
  badgePendingSignOff: string;
  badgePendingFinalAudit: string;
  poReleasedBannerTitleTemplate: string;
  poReleasedBannerDesc: string;
  downloadOfficialPdfTemplate: string;
  allPPOsTitle: string;
  createPPO: string;
  releasePO: string;
  commercialTerms: string;
  deliverySchedule: string;
  taxRate: string;
  totalCommitment: string;
  poNumberTemplate: string;
  ppoNumberTemplate: string;
  issuedPOsTitle: string;
  downloadPdfButton: string;
  approvePPOButton: string;
}

export interface UIStringsVendorPortal {
  title: string;
  subtitle: string;
  rfqList: string;
  submitQuote: string;
  quoteStatus: string;
  counterOffers: string;
  awardedPOs: string;
  roleBadge: string;
  activeRfqLabel: string;
  vendorLabel: string;
  rfqLabel: string;
  tabQuote1: string;
  tabQuote2: string;
  tabFinal: string;
  tabPPO: string;
  acceptRfq: string;
  rfqAccepted: string;
  pendingAcceptance: string;
  activeBidder: string;
  reviewOffer: string;
  viewPO: string;
  submitQuote1: string;
  submitQuote2: string;
  quote1Submitted: string;
  quote2Submitted: string;
  acceptPPO: string;
  downloadPO: string;
  orderAcknowledged: string;
  historyTitle: string;
  round1SubmittedNotice: string;
  round2SubmittedNotice: string;
}

export interface UIStringsPRModule {
  title: string;
  subtitle: string;
  newPR: string;
  prNumber: string;
  project: string;
  costCentre: string;
  requester: string;
  status: string;
  itemsCountTemplate: string;
  roleBadge: string;
  draftIdTemplate: string;
  stepGeneral: string;
  stepCategory: string;
  stepBOQ: string;
  stepSuppliers: string;
  stepDelivery: string;
  stepTerms: string;
  stepDocuments: string;
  submitToProjectHead: string;
  cancelPR: string;
  nextStep: string;
  prevStep: string;
}

export interface UIStringsCategoryManagerHub {
  title: string;
  subtitle: string;
  vendorAllocation: string;
  sourcingStrategy: string;
  spendOverview: string;
  roleBadge: string;
  tabRFQ: string;
  tabRateCard: string;
  tabCommercial: string;
  tabAICost: string;
  tabNegotiation: string;
  tabPPO: string;
  raiseRFQ: string;
  cbaMatrix: string;
  awardPPO: string;
  awardL1: string;
  awardNonL1: string;
  mleoBreakdown: string;
  backToCommercial: string;
  routePPOToWorkflow: string;
}

export interface UIStringsModals {
  newPRTitle: string;
  newPRSubtitle: string;
  targetProject: string;
  prPackageTitle: string;
  estimatedDate: string;
  costCentre: string;
  category: string;
  itemScope: string;
  remarks: string;
  submitPR: string;
  newPPOTitle: string;
  newPPOSubtitle: string;
  targetPR: string;
  selectedVendor: string;
  agreedUnitRate: string;
  taxRate: string;
  paymentTerms: string;
  leadTime: string;
  createPPOButton: string;
}

export interface UIStringsDictionary {
  common: UIStringsCommon;
  header: UIStringsHeader;
  dashboard: UIStringsDashboard;
  tenantOverview: UIStringsTenantOverview;
  prApprovalQueue: UIStringsPRApprovalQueue;
  mastersAudit: UIStringsMastersAudit;
  commercialEval: UIStringsCommercialEval;
  negotiationHub: UIStringsNegotiationHub;
  aiCostStudio: UIStringsAICostStudio;
  boqStudio: UIStringsBOQStudio;
  ppoModule: UIStringsPPOModule;
  vendorPortal: UIStringsVendorPortal;
  prModule: UIStringsPRModule;
  categoryManagerHub: UIStringsCategoryManagerHub;
  modals: UIStringsModals;
}
