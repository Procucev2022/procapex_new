import type { BudgetCategory, ProjectBudgetState } from '@/types';
import { CIVIL_INTERIOR_CATEGORIES } from './budget-civil-interior';
import { MEP_FACADE_CATEGORIES } from './budget-mep-facade';

export const INITIAL_PROJECT_CATEGORIES: BudgetCategory[] = [
  ...CIVIL_INTERIOR_CATEGORIES,
  ...MEP_FACADE_CATEGORIES,
];

// Initialize subtotals for each category
INITIAL_PROJECT_CATEGORIES.forEach((cat) => {
  cat.subtotalCost = cat.items.reduce((sum, item) => sum + item.calculatedCost, 0);
});

const totalEstimatedBOQ = INITIAL_PROJECT_CATEGORIES.reduce((acc, c) => acc + c.subtotalCost, 0);
const defaultContingencyRate = 5.0;
const contingencyAmt = Math.round(totalEstimatedBOQ * (defaultContingencyRate / 100));
const grandTotal = totalEstimatedBOQ + contingencyAmt;
const baselineBudgetTotal = 142000000;
export const DEFAULT_PROJECT_SQFT = 125000;

export const INITIAL_PROJECT_BUDGET: ProjectBudgetState = {
  projectId: 'PRJ-METRO-04',
  projectName: 'Metro Line 4 Underground & Stations',
  totalBaselineBudget: baselineBudgetTotal,
  totalEstimatedBOQCost: totalEstimatedBOQ,
  contingencyRatePercent: defaultContingencyRate,
  contingencyAmount: contingencyAmt,
  grandTotalBudgeted: grandTotal,
  totalCommittedCost: INITIAL_PROJECT_CATEGORIES.reduce((acc, c) => acc + c.committedCost, 0),
  unallocatedVariance: baselineBudgetTotal - grandTotal,
  totalProjectSqFt: DEFAULT_PROJECT_SQFT,
  costPerSqFt: Math.round(grandTotal / DEFAULT_PROJECT_SQFT),
  baselineCostPerSqFt: Math.round(baselineBudgetTotal / DEFAULT_PROJECT_SQFT),
  status: 'DRAFT',
  lastUpdated: '2026-09-11',
  updatedBy: 'Sunil Deshmukh (Chief Financial Officer)',
};

export const STANDARD_BOQ_CSV_HEADERS: string[] = [
  'Category Code / Name',
  'Sub-Category Code / Name',
  'Specification / Description',
  'UOM',
  'Benchmark Rate (INR)',
  'Default Quantity',
  'Notes / Compliance',
];

export const STANDARD_BOQ_CSV_SAMPLE_ROWS = [
  {
    category: 'CIVIL',
    subCategory: 'FOUND',
    desc: 'M35 Grade Ready Mix Concrete for Raft & Retaining Walls as per IS 456',
    uom: 'Cum',
    benchmarkRate: 5400,
    defaultQty: 450,
    notes: 'Requires 28-day cube strength certification & slump test records',
  },
  {
    category: 'INT',
    subCategory: 'FLOOR',
    desc: 'Heavy-duty Vitrified Tiles 800x800mm with epoxy grouting & anti-skid finish',
    uom: 'Sqm',
    benchmarkRate: 1450,
    defaultQty: 1200,
    notes: 'Premium commercial grade, batch uniformity certification mandatory',
  },
  {
    category: 'MEP',
    subCategory: 'HVAC',
    desc: 'VRF Outdoor Multi-V Inverter Heat Recovery Condensing Unit 28 HP',
    uom: 'Nos',
    benchmarkRate: 485000,
    defaultQty: 4,
    notes: 'BEE 5-star energy rating with factory warranty & commissioning support',
  },
  {
    category: 'FAC',
    subCategory: 'GLAZ',
    desc: 'Double Glazed Unit (DGU) 24mm Acoustic Performance Glass with Low-E coating',
    uom: 'Sqm',
    benchmarkRate: 7200,
    defaultQty: 320,
    notes: 'Wind load certified up to 2.5 kPa as per structural engineering drawing',
  },
];
