import {
  generateStandardBOQTemplateCSV,
  generateCategoryCSV,
  generateProjectCSV,
  generateCategorySummaryCSV,
  computeCategorySummaryMetrics,
  recalculateProjectBudget,
  getCSVDataUri,
} from '@/lib/budget-utils';
import type { BudgetCategory, ProjectBudgetState } from '@/types';

describe('budget-utils', () => {
  const sampleCategory: BudgetCategory = {
    id: 'CAT-CIVIL',
    name: 'Civil & Structural Works',
    shortCode: 'CIVIL',
    costCenter: 'CC-101',
    description: 'Civil foundation and RCC superstructure works',
    status: 'BASELINED',
    subtotalCost: 1500000,
    baselineBudget: 2000000,
    committedCost: 500000,
    items: [
      {
        id: 'CIV-001',
        code: 'CIV-CON-M30',
        categoryId: 'CAT-CIVIL',
        desc: 'Ready Mix Concrete M30 Grade',
        uom: 'Cum',
        benchmarkRate: 4800,
        defaultQty: 250,
        qty: 250,
        calculatedCost: 1200000,
        status: 'ACTIVE',
        benchmarkDetails: {
          benchmarkRate: 4800,
          masterRateCardRate: 5000,
          historicalLowestRate: 4700,
          aiConfidence: '98%',
          varianceVsRateCardPercent: -4,
        },
      },
      {
        id: 'CIV-002',
        code: 'CIV-STL-FE500',
        categoryId: 'CAT-CIVIL',
        desc: 'TMT Reinforcement Steel Fe500D',
        uom: 'Ton',
        benchmarkRate: 52000,
        defaultQty: 50,
        qty: 50,
        calculatedCost: 2600000,
        status: 'ON_HOLD',
        benchmarkDetails: {
          benchmarkRate: 52000,
          masterRateCardRate: 54000,
          historicalLowestRate: 51000,
          aiConfidence: '97%',
          varianceVsRateCardPercent: -3.7,
        },
      },
    ],
  };

  const sampleBudgetState: ProjectBudgetState = {
    projectId: 'PROJ-01',
    projectName: 'Metro Line 4 Underground',
    totalBaselineBudget: 10000000,
    totalEstimatedBOQCost: 8000000,
    contingencyRatePercent: 5,
    contingencyAmount: 400000,
    grandTotalBudgeted: 8400000,
    totalCommittedCost: 3000000,
    unallocatedVariance: 1600000,
    totalProjectSqFt: 50000,
    costPerSqFt: 168,
    baselineCostPerSqFt: 200,
    status: 'BASELINED',
    lastUpdated: '2026-09-13',
    updatedBy: 'Finance Controller',
  };

  describe('generateStandardBOQTemplateCSV', () => {
    it('generates the 4-column PR format with blank quantities by default', () => {
      const csv = generateStandardBOQTemplateCSV(sampleCategory);
      const lines = csv.split('\n');

      expect(lines[0]).toBe('Item Code,Item Description / Specs,Unit (UOM),Required Quantity');
      // Only active items should be included
      expect(lines).toHaveLength(2);
      expect(lines[1]).toBe('"CIV-CON-M30","Ready Mix Concrete M30 Grade","Cum",');
    });

    it('can optionally include default quantities if blankQuantity is false', () => {
      const csv = generateStandardBOQTemplateCSV(sampleCategory, false);
      const lines = csv.split('\n');

      expect(lines[0]).toBe('Item Code,Item Description / Specs,Unit (UOM),Required Quantity');
      expect(lines[1]).toBe('"CIV-CON-M30","Ready Mix Concrete M30 Grade","Cum",250');
    });

    it('generates starter template if category is null or undefined', () => {
      const csvNull = generateStandardBOQTemplateCSV(null);
      expect(csvNull).toContain('Item Code,Item Description / Specs,Unit (UOM),Required Quantity');
      expect(csvNull).toContain('"ITEM-001"');

      const csvUndefined = generateStandardBOQTemplateCSV(undefined);
      expect(csvUndefined).toContain('"ITEM-001"');
    });

    it('generates category-coded starter row if category has no active items', () => {
      const emptyWithCode: BudgetCategory = {
        ...sampleCategory,
        shortCode: 'PLUMB',
        items: [],
      };
      const csv = generateStandardBOQTemplateCSV(emptyWithCode);
      expect(csv).toContain('"PLUMB-001"');

      const emptyWithoutCode: BudgetCategory = {
        ...sampleCategory,
        name: 'General',
        shortCode: '',
        items: [],
      };
      const csvNoCode = generateStandardBOQTemplateCSV(emptyWithoutCode);
      expect(csvNoCode).toContain('"ITEM-001"');
    });

    it('handles category with undefined items array or items without defaultQty', () => {
      const catUndefinedItems: BudgetCategory = {
        ...sampleCategory,
        items: undefined as unknown as typeof sampleCategory.items,
      };
      const csvUndefinedItems = generateStandardBOQTemplateCSV(catUndefinedItems);
      expect(csvUndefinedItems).toContain('"CIVIL-001"');

      const catWithFallbackQty: BudgetCategory = {
        ...sampleCategory,
        items: [
          {
            ...sampleCategory.items[0],
            defaultQty: undefined as unknown as number,
            qty: 150,
          },
        ],
      };
      const csvFallback = generateStandardBOQTemplateCSV(catWithFallbackQty, false);
      expect(csvFallback).toContain('150');

      const catWithNoQty: BudgetCategory = {
        ...sampleCategory,
        items: [
          {
            ...sampleCategory.items[0],
            defaultQty: undefined as unknown as number,
            qty: undefined as unknown as number,
          },
        ],
      };
      const csvNoQty = generateStandardBOQTemplateCSV(catWithNoQty, false);
      expect(csvNoQty).toContain('"CIV-CON-M30","Ready Mix Concrete M30 Grade","Cum",');
    });
  });

  describe('generateCategoryCSV', () => {
    it('generates the 9-column Budget Planning CSV with benchmark and cost center', () => {
      const csv = generateCategoryCSV(sampleCategory);
      expect(csv).toContain('CIV-CON-M30');
      expect(csv).toContain('CC-101');
      expect(csv).toContain('4800');
    });
  });

  describe('generateProjectCSV', () => {
    it('generates consolidated project CSV', () => {
      const csv = generateProjectCSV([sampleCategory], sampleBudgetState);
      expect(csv).toContain('Project Name: Metro Line 4 Underground');
      expect(csv).toContain('CIV-CON-M30');
    });
  });

  describe('computeCategorySummaryMetrics and recalculateProjectBudget', () => {
    it('computes summary metrics and updates budget', () => {
      const metrics = computeCategorySummaryMetrics([sampleCategory], sampleBudgetState);
      expect(metrics).toHaveLength(1);
      expect(metrics[0].categoryName).toBe('Civil & Structural Works');
      expect(metrics[0].status).toBe('UNDER_BUDGET');

      const updated = recalculateProjectBudget([sampleCategory], sampleBudgetState, 10, 60000);
      expect(updated.contingencyRatePercent).toBe(10);
      expect(updated.totalProjectSqFt).toBe(60000);

      const defaultUpdated = recalculateProjectBudget([sampleCategory], sampleBudgetState);
      expect(defaultUpdated.contingencyRatePercent).toBe(sampleBudgetState.contingencyRatePercent);
    });

    it('handles edge case branches: OVER_BUDGET, ON_TRACK, zero budgets, and deficits', () => {
      const overBudgetCat: BudgetCategory = {
        ...sampleCategory,
        baselineBudget: 1000000,
        subtotalCost: 1200000, // variance is negative
      };

      const onTrackCat: BudgetCategory = {
        ...sampleCategory,
        baselineBudget: 1000000,
        subtotalCost: 1000000, // variance is 0
      };

      const zeroBudgetCat: BudgetCategory = {
        ...sampleCategory,
        baselineBudget: 0,
        subtotalCost: 100000,
      };

      const deficitBudgetState: ProjectBudgetState = {
        ...sampleBudgetState,
        totalBaselineBudget: 5000000,
        totalEstimatedBOQCost: 0,
        totalProjectSqFt: 0,
        unallocatedVariance: -500000, // DEFICIT
      };

      const metrics = computeCategorySummaryMetrics(
        [overBudgetCat, onTrackCat, zeroBudgetCat],
        deficitBudgetState,
      );

      expect(metrics[0].status).toBe('OVER_BUDGET');
      expect(metrics[1].status).toBe('ON_TRACK');
      expect(metrics[2].variancePercent).toBe(0);

      const csv = generateCategorySummaryCSV(
        [overBudgetCat],
        deficitBudgetState,
      );
      expect(csv).toContain('DEFICIT');

      const updatedWithZeroSqFt = recalculateProjectBudget(
        [sampleCategory],
        { ...sampleBudgetState, totalProjectSqFt: 0 },
        undefined,
        0,
      );
      expect(updatedWithZeroSqFt.costPerSqFt).toBeGreaterThan(0);
    });

    it('generates category summary CSV', () => {
      const csv = generateCategorySummaryCSV([sampleCategory], sampleBudgetState);
      expect(csv).toContain('Civil & Structural Works');
      expect(csv).toContain('TOTAL');
      expect(csv).toContain('SURPLUS');
    });
  });

  describe('getCSVDataUri', () => {
    it('returns a properly encoded data URI for CSV downloads', () => {
      const uri = getCSVDataUri('Item Code,Qty\nITEM-1,10');
      expect(uri.startsWith('data:text/csv;charset=utf-8,')).toBe(true);
      expect(uri).toContain(encodeURIComponent('Item Code,Qty\nITEM-1,10'));
    });
  });
});
