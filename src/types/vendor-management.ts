import type { TenantKey } from './procurement';
import type { VendorItem } from './components';

export type VendorSource = 'PROCAPX_PLATFORM' | 'CLIENT_ONBOARDED';

export type EvaluationStatus =
  | 'NOT_STARTED'
  | 'PENDING_VENDOR_INPUT'
  | 'UNDER_EVALUATION'
  | 'VERIFIED'
  | 'REJECTED';

export type EvaluationGrade = 'A+' | 'A' | 'B' | 'C' | 'D';

export type DealershipTier =
  | 'TIER_1_AUTHORIZED'
  | 'SYSTEM_INTEGRATOR'
  | 'DISTRIBUTOR'
  | 'DIRECT_OEM';

export interface ClientReference {
  clientName: string;
  projectName: string;
  contactPerson: string;
  designation: string;
  contactNumber: string;
  email: string;
  scopeDelivered: string;
  valueInCr: number;
}

export interface OEMBrandDealership {
  brandName: string;
  productCategory: string;
  dealershipTier: DealershipTier;
  validTill: string;
  territoryCovered: string[];
}

export interface OngoingProject {
  projectName: string;
  clientName: string;
  locationCity: string;
  valueInLakhs: number;
  completionPercent: number;
}

export interface InteriorFitoutEvaluationData {
  carpentersCount: number;
  brandsWorkedWith: string[];
  ongoingProjects: OngoingProject[];
  clientReferences: ClientReference[];
  workshopSqFt: number;
  hasCncMachine: boolean;
  hasAutoEdgeBander: boolean;
}

export interface BoughtoutMEPEvaluationData {
  dealerships: OEMBrandDealership[];
  regionsCovered: string[];
  serviceCentersCount: number;
  certifiedEngineersCount: number;
  oemWarrantySupportAvailable: boolean;
  annualAmcCapability: boolean;
  slaResponseTimeHours: number;
  clientReferences: ClientReference[];
}

export interface CivilStructuralEvaluationData {
  batchingPlantsCount: number;
  transitMixersCount: number;
  towerCranesCount: number;
  steelFabricationCapacityMonthlyMT: number;
  safetyLostTimeAccidentsPast3Yrs: number;
  clientReferences: ClientReference[];
}

export interface FacadeExternalEvaluationData {
  glazingSystemsFabricated: string[];
  windTunnelTestingCertified: boolean;
  spiderCranesAndCradlesCount: number;
  clientReferences: ClientReference[];
}

export interface CategorySpecificEvaluationData {
  interiorFitout?: InteriorFitoutEvaluationData;
  boughtoutMEP?: BoughtoutMEPEvaluationData;
  civilStructural?: CivilStructuralEvaluationData;
  facadeExternal?: FacadeExternalEvaluationData;
}

export interface VendorEvaluationSubmission {
  turnoverCr: number;
  solvencyBankName: string;
  auditedBalanceSheet: boolean;
  factoryCapacityUnitsPerMonth: number;
  machineryCount: number;
  workforceCount: number;
  isoCertified: boolean;
  qcLabInHouse: boolean;
  pastProjectsCompleted: number;
  gstinFilingCompliant: boolean;
  safetyPolicyCompliant: boolean;
  submissionNotes?: string;
  categorySpecificData?: CategorySpecificEvaluationData;
}

export type BaselineEvaluationData = Omit<
  VendorEvaluationSubmission,
  'submissionNotes' | 'categorySpecificData'
>;

export interface VendorEvaluationScoreResult {
  financialScore: number;
  operationalScore: number;
  qualityScore: number;
  complianceScore: number;
  categoryCredibilityScore: number;
  totalScore: number;
  calculatedRating: number;
  grade: EvaluationGrade;
  status: EvaluationStatus;
  evaluatedAt: string;
}

export interface VendorPPORating {
  id: string;
  ppoId: string;
  vendorId: string;
  qualityRating: number;
  timelinessRating: number;
  commercialRating: number;
  overallScore: number;
  comments: string;
  ratedBy: string;
  ratedAt: string;
}

export interface VendorCatalogueItemPrice {
  itemCode: string;
  itemDesc: string;
  category: string;
  subCategory?: string;
  uom: string;
  masterBenchmarkRate: number;
  vendorPrice: number;
  variancePercent: number;
  submittedAt?: string;
  updatedBy?: string;
  notes?: string;
}

export interface VendorCatalogueStatus {
  hasSubmittedPrices: boolean;
  lastSubmittedAt?: string;
  intimationSent: boolean;
  intimationSentAt?: string;
  intimationDeadline?: string;
  intimationDaysAllowed?: number;
  intimationNotes?: string;
}

export interface SendCatalogueIntimationInput {
  vendorId: string;
  deadlineDays: number;
  customDeadline?: string;
  notes?: string;
}

export interface ManagedVendor extends VendorItem {
  source: VendorSource;
  tenantKey?: TenantKey;
  tenantName?: string;
  email?: string;
  phone?: string;
  evaluationStatus: EvaluationStatus;
  evaluationScore?: VendorEvaluationScoreResult;
  categorySpecificProfile?: CategorySpecificEvaluationData;
  ppoRatings: VendorPPORating[];
  compositeRating: number;
  totalPPOsCompleted: number;
  categories?: string[];
  cataloguePrices?: Record<string, VendorCatalogueItemPrice>;
  catalogueStatus?: VendorCatalogueStatus;
}

export interface VendorCSVRow {
  name: string;
  category: string;
  categories?: string[];
  subCategory: string;
  gstin: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  capacity: string;
  leadTime: string;
}

export type VendorFilterSource = 'ALL' | 'CLIENT_ONBOARDED' | 'PROCAPX_PLATFORM';

export interface VendorDirectoryFilterState {
  searchQuery: string;
  sourceFilter: VendorFilterSource;
  categoryFilter: string;
}

export interface VendorManagementKPIs {
  totalVendors: number;
  clientOnboardedCount: number;
  procapxNetworkCount: number;
  pendingEvaluationsCount: number;
  ppoRatedVendorsCount: number;
  averageRating: number;
}
