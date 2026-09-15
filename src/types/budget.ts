/**
 * Project Budget Planning & Category Standard BOQ Type Definitions
 *
 * Strict TypeScript data contracts for Finance Manager project cost budgeting,
 * standard category BOQ items, price benchmarking, and consolidated financial metrics.
 */

export interface PriceBenchmarkDetails {
  benchmarkRate: number;
  masterRateCardRate: number;
  historicalLowestRate: number;
  aiConfidence: string;
  varianceVsRateCardPercent: number;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  shortCode: string;
  description?: string;
}

export interface StandardBOQItem {
  id: string;
  code: string;
  categoryId: string;
  subCategoryId?: string;
  subCategoryName?: string;
  desc: string;
  uom: string;
  benchmarkRate: number;
  defaultQty: number;
  qty: number;
  calculatedCost: number;
  benchmarkDetails: PriceBenchmarkDetails;
  notes?: string;
  status?: 'ACTIVE' | 'ON_HOLD';
  isImmutable?: boolean;
}

export interface BudgetCategory {
  id: string;
  name: string;
  shortCode: string;
  costCenter: string;
  description: string;
  subCategories?: SubCategory[];
  items: StandardBOQItem[];
  subtotalCost: number;
  baselineBudget: number;
  committedCost: number;
  status: 'DRAFT' | 'BASELINED' | 'APPROVED';
}

export interface AddCategoryInput {
  name: string;
  majorCategory?: string;
  subCategory?: string;
  subCategories?: string[];
  shortCode?: string;
  costCenter?: string;
  description?: string;
  baselineBudget?: number;
}

export interface AddSubCategoryInput {
  categoryId: string;
  name: string;
  shortCode?: string;
  description?: string;
}

export interface AddStandardBOQItemInput {
  categoryId: string;
  subCategoryId?: string;
  desc: string;
  uom: string;
  benchmarkRate: number;
  defaultQty: number;
  notes?: string;
}

export interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (input: AddCategoryInput) => void;
  existingCategories?: BudgetCategory[];
  initialMajorCategory?: string;
}

export interface AddSubCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: BudgetCategory[];
  initialCategoryId?: string;
  onAddSubCategory: (input: AddSubCategoryInput) => void;
}

export interface AddStandardBOQItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: BudgetCategory[];
  initialCategoryId?: string;
  onAddItem: (input: AddStandardBOQItemInput) => void;
  onOpenUpload?: () => void;
  onBatchAddItems?: (inputs: AddStandardBOQItemInput[]) => void;
}

export interface StandardBOQCSVRow {
  category: string;
  subCategory?: string;
  desc: string;
  uom: string;
  benchmarkRate: number;
  defaultQty: number;
  notes?: string;
}

export interface ParsedStandardBOQItem extends AddStandardBOQItemInput {
  categoryName: string;
  subCategoryName?: string;
  previewCode: string;
  rowNumber: number;
}

export interface StandardBOQParseResult {
  validItems: ParsedStandardBOQItem[];
  errors: string[];
  totalRows: number;
}

export interface StandardBOQUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: BudgetCategory[];
  onImportBatch: (items: AddStandardBOQItemInput[]) => void;
}

export interface CategoryStandardBOQMasterProps {
  onRouteToBudget?: () => void;
}

export type CategoryMasterViewMode = 'items' | 'hierarchy';

export interface CategoryCardProps {
  category: BudgetCategory;
  onAddSubCategory: (categoryId: string) => void;
  onAddBOQItem: (categoryId: string) => void;
  onViewCategoryItems: (categoryId: string) => void;
}

export interface ProjectBudgetState {
  projectId: string;
  projectName: string;
  totalBaselineBudget: number;
  totalEstimatedBOQCost: number;
  contingencyRatePercent: number;
  contingencyAmount: number;
  grandTotalBudgeted: number;
  totalCommittedCost: number;
  unallocatedVariance: number;
  totalProjectSqFt: number;
  costPerSqFt: number;
  baselineCostPerSqFt: number;
  status: 'DRAFT' | 'BASELINED';
  lastUpdated: string;
  updatedBy: string;
}

export interface CategorySummaryMetrics {
  categoryId: string;
  categoryName: string;
  shortCode: string;
  costCenter: string;
  itemCount: number;
  baselineBudget: number;
  estimatedCost: number;
  costPerSqFt: number;
  baselineCostPerSqFt: number;
  budgetSharePercent: number;
  varianceAmount: number;
  variancePercent: number;
  status: 'UNDER_BUDGET' | 'ON_TRACK' | 'OVER_BUDGET';
}

export interface CategoryBudgetSummaryProps {
  categories: BudgetCategory[];
  budgetState: ProjectBudgetState;
  onSelectCategory: (categoryId: string) => void;
  onUpdateProjectSqFt: (newSqFt: number) => void;
  onDownloadSummaryCSV: () => void;
  onRouteToMaster?: () => void;
  onOpenAddCategoryModal?: () => void;
}

export interface BudgetOverviewHeaderProps {
  budgetState: ProjectBudgetState;
  onContingencyChange: (newRate: number) => void;
  onFreezeBaseline: () => void;
  onExportProjectSummary: () => void;
  onUpdateProjectSqFt?: (newSqFt: number) => void;
}

export interface CategorySelectorTabsProps {
  categories: BudgetCategory[];
  activeCategoryId: string;
  totalEstimatedCost: number;
  onSelectCategory: (categoryId: string) => void;
  onDownloadCategoryBOQ: (categoryId: string) => void;
  onRouteToMaster?: () => void;
}

export interface CategoryBOQTableProps {
  category: BudgetCategory;
  onUpdateQuantity: (categoryId: string, itemId: string, newQty: number) => void;
  onResetCategoryQuantities: (categoryId: string) => void;
  onDownloadCategoryBOQ: (categoryId: string) => void;
}

export interface BudgetPlanningModuleProps {
  onRouteToPR?: () => void;
  onRouteToMaster?: () => void;
}

export interface BudgetManagerHook {
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
  addCategory: (input: AddCategoryInput) => BudgetCategory;
  addSubCategory: (input: AddSubCategoryInput) => SubCategory;
  addStandardBOQItem: (input: AddStandardBOQItemInput) => StandardBOQItem;
  uploadBatchStandardBOQItems: (items: AddStandardBOQItemInput[]) => StandardBOQItem[];
  toggleItemHoldStatus: (categoryId: string, itemId: string) => void;
}

