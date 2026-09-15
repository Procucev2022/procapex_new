import {
  mergeCategoryCollections,
  getStoredCategories,
  getStoredBudget,
  persistCategoriesToStorageAndApi,
  STORAGE_KEY_CATEGORIES,
  STORAGE_KEY_BUDGET,
} from '@/context/useBudgetManager';
import { INITIAL_PROJECT_CATEGORIES, INITIAL_PROJECT_BUDGET } from '@/constants';
import { generateStandardBOQTemplateCSV } from '@/lib/budget-utils';
import type { BudgetCategory, SubCategory, StandardBOQItem } from '@/types';

describe('Category & Standard BOQ Dual Persistence Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  describe('getStoredCategories & getStoredBudget', () => {
    it('returns INITIAL_PROJECT_CATEGORIES when localStorage is empty', () => {
      const result = getStoredCategories();
      expect(result).toHaveLength(INITIAL_PROJECT_CATEGORIES.length);
      expect(result[0].id).toBe(INITIAL_PROJECT_CATEGORIES[0].id);
    });

    it('returns INITIAL_PROJECT_BUDGET when localStorage is empty', () => {
      const budget = getStoredBudget();
      expect(budget.grandTotalBudgeted).toBe(INITIAL_PROJECT_BUDGET.grandTotalBudgeted);
    });

    it('retrieves saved categories from localStorage on subsequent reloads', () => {
      const customCategory: BudgetCategory = {
        id: 'CAT-CUSTOM',
        name: 'Solar Energy Systems',
        shortCode: 'SOLAR',
        costCenter: 'CC-SOLAR',
        description: 'Solar panels and inverters',
        subtotalCost: 500000,
        baselineBudget: 600000,
        committedCost: 0,
        status: 'DRAFT',
        subCategories: [
          {
            id: 'SUB-SOLAR-01',
            categoryId: 'CAT-CUSTOM',
            name: 'PV Panels',
            shortCode: 'PVP',
          },
        ],
        items: [
          {
            id: 'ITM-SOLAR-001',
            code: 'SOLAR-PVP-001',
            categoryId: 'CAT-CUSTOM',
            subCategoryId: 'SUB-SOLAR-01',
            desc: '540W Monocrystalline PV Module',
            uom: 'Nos',
            benchmarkRate: 15000,
            defaultQty: 100,
            qty: 100,
            calculatedCost: 1500000,
            status: 'ACTIVE',
            isImmutable: true,
            benchmarkDetails: {
              benchmarkRate: 15000,
              masterRateCardRate: 15000,
              historicalLowestRate: 15000,
              aiConfidence: '98%',
              varianceVsRateCardPercent: 0,
            },
          },
        ],
      };

      const categoriesToSave = [...INITIAL_PROJECT_CATEGORIES, customCategory];
      persistCategoriesToStorageAndApi(categoriesToSave);

      // Verify it was stored in localStorage
      const cached = window.localStorage.getItem(STORAGE_KEY_CATEGORIES);
      expect(cached).toBeTruthy();

      // Read back as if the page just refreshed
      const loaded = getStoredCategories();
      expect(loaded).toHaveLength(INITIAL_PROJECT_CATEGORIES.length + 1);
      const found = loaded.find((c) => c.id === 'CAT-CUSTOM');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Solar Energy Systems');
      expect(found?.subCategories).toHaveLength(1);
      expect(found?.items).toHaveLength(1);
      expect(found?.items[0].code).toBe('SOLAR-PVP-001');
    });
  });

  describe('mergeCategoryCollections', () => {
    it('seamlessly merges server categories with newly added local categories and items', () => {
      const serverCategories: BudgetCategory[] = [
        {
          id: 'CAT-CIVIL',
          name: 'Civil Works',
          shortCode: 'CIVIL',
          costCenter: 'CC-CIV',
          description: 'Desc',
          subtotalCost: 1000,
          baselineBudget: 2000,
          committedCost: 0,
          status: 'DRAFT',
          subCategories: [
            { id: 'SUB-FOUND', categoryId: 'CAT-CIVIL', name: 'Foundation', shortCode: 'FOUND' },
          ],
          items: [
            {
              id: 'ITM-1',
              code: 'CIV-001',
              categoryId: 'CAT-CIVIL',
              desc: 'PCC 1:4:8',
              uom: 'Cum',
              benchmarkRate: 4500,
              defaultQty: 10,
              qty: 10,
              calculatedCost: 45000,
              status: 'ACTIVE',
              isImmutable: true,
              benchmarkDetails: {
                benchmarkRate: 4500,
                masterRateCardRate: 4500,
                historicalLowestRate: 4500,
                aiConfidence: '95%',
                varianceVsRateCardPercent: 0,
              },
            },
          ],
        },
      ];

      const localAdditions: BudgetCategory[] = [
        {
          id: 'CAT-CIVIL',
          name: 'Civil Works',
          shortCode: 'CIVIL',
          costCenter: 'CC-CIV',
          description: 'Desc',
          subtotalCost: 1000,
          baselineBudget: 2000,
          committedCost: 0,
          status: 'DRAFT',
          subCategories: [
            { id: 'SUB-SUPER', categoryId: 'CAT-CIVIL', name: 'Superstructure', shortCode: 'SUPER' },
          ],
          items: [
            {
              id: 'ITM-2',
              code: 'CIV-002',
              categoryId: 'CAT-CIVIL',
              desc: 'RCC M25 Column',
              uom: 'Cum',
              benchmarkRate: 7500,
              defaultQty: 20,
              qty: 20,
              calculatedCost: 150000,
              status: 'ACTIVE',
              isImmutable: true,
              benchmarkDetails: {
                benchmarkRate: 7500,
                masterRateCardRate: 7500,
                historicalLowestRate: 7500,
                aiConfidence: '95%',
                varianceVsRateCardPercent: 0,
              },
            },
          ],
        },
        {
          id: 'CAT-NEW',
          name: 'Waterproofing',
          shortCode: 'WP',
          costCenter: 'CC-WP',
          description: 'Membrane and coating',
          subtotalCost: 50000,
          baselineBudget: 60000,
          committedCost: 0,
          status: 'DRAFT',
          subCategories: [],
          items: [],
        },
      ];

      const merged = mergeCategoryCollections(serverCategories, localAdditions);

      // Should have 2 categories (Civil Works + Waterproofing)
      expect(merged).toHaveLength(2);

      const civil = merged.find((c) => c.id === 'CAT-CIVIL');
      expect(civil).toBeDefined();
      // Should have both subcategories Foundation and Superstructure
      expect(civil?.subCategories).toHaveLength(2);
      expect(civil?.subCategories?.map((s) => s.name)).toEqual(['Foundation', 'Superstructure']);
      // Should have both standard BOQ items CIV-001 and CIV-002
      expect(civil?.items).toHaveLength(2);
      expect(civil?.items.map((i) => i.code)).toEqual(['CIV-001', 'CIV-002']);

      const wp = merged.find((c) => c.id === 'CAT-NEW');
      expect(wp).toBeDefined();
      expect(wp?.name).toBe('Waterproofing');
    });
  });

  describe('persistCategoriesToStorageAndApi', () => {
    it('dispatches background fetch to /api/categories when window.fetch is available', () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      window.fetch = mockFetch;

      persistCategoriesToStorageAndApi(INITIAL_PROJECT_CATEGORIES, INITIAL_PROJECT_BUDGET);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/categories',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories: INITIAL_PROJECT_CATEGORIES }),
        }),
      );

      expect(window.localStorage.getItem(STORAGE_KEY_CATEGORIES)).toBeTruthy();
      expect(window.localStorage.getItem(STORAGE_KEY_BUDGET)).toBeTruthy();
    });
  });

  describe('generateStandardBOQTemplateCSV reflection tests', () => {
    it('reflects all newly added line items in the downloaded template without quantities', () => {
      const categoryWithCustomItems: BudgetCategory = {
        id: 'CAT-ELEC',
        name: 'Electrical & Automation',
        shortCode: 'ELEC',
        costCenter: 'CC-ELEC',
        description: 'Electrical and automation line items',
        subtotalCost: 125000,
        baselineBudget: 200000,
        committedCost: 0,
        status: 'DRAFT',
        subCategories: [
          { id: 'SUB-ELEC-01', categoryId: 'CAT-ELEC', name: 'Lighting', shortCode: 'LGT' },
        ],
        items: [
          {
            id: 'ITM-ELEC-001',
            code: 'ELEC-LGT-001',
            categoryId: 'CAT-ELEC',
            subCategoryId: 'SUB-ELEC-01',
            desc: 'Recessed LED Downlight 15W 4000K',
            uom: 'Nos',
            benchmarkRate: 1250,
            defaultQty: 100,
            qty: 100,
            calculatedCost: 125000,
            status: 'ACTIVE',
            isImmutable: true,
            benchmarkDetails: {
              benchmarkRate: 1250,
              masterRateCardRate: 1250,
              historicalLowestRate: 1250,
              aiConfidence: '95%',
              varianceVsRateCardPercent: 0,
            },
          },
          {
            id: 'ITM-ELEC-002',
            code: 'ELEC-LGT-002',
            categoryId: 'CAT-ELEC',
            subCategoryId: 'SUB-ELEC-01',
            desc: 'DALI Dimming Control Ballast',
            uom: 'Nos',
            benchmarkRate: 3500,
            defaultQty: 25,
            qty: 25,
            calculatedCost: 87500,
            status: 'ACTIVE',
            isImmutable: true,
            benchmarkDetails: {
              benchmarkRate: 3500,
              masterRateCardRate: 3500,
              historicalLowestRate: 3500,
              aiConfidence: '95%',
              varianceVsRateCardPercent: 0,
            },
          },
        ],
      };

      const csv = generateStandardBOQTemplateCSV(categoryWithCustomItems, true);
      const lines = csv.split('\n');

      // Headers: 4 required columns
      expect(lines[0]).toBe('Item Code,Item Description / Specs,Unit (UOM),Required Quantity');

      // Line 1: ELEC-LGT-001 with blank quantity
      expect(lines[1]).toBe('"ELEC-LGT-001","Recessed LED Downlight 15W 4000K","Nos",');

      // Line 2: ELEC-LGT-002 with blank quantity
      expect(lines[2]).toBe('"ELEC-LGT-002","DALI Dimming Control Ballast","Nos",');

      // Total rows = 1 header + 2 item rows
      expect(lines).toHaveLength(3);
    });

    it('generates a starter placeholder row for categories with zero items', () => {
      const emptyCat: BudgetCategory = {
        id: 'CAT-EMPTY',
        name: 'Landscaping Works',
        shortCode: 'LAND',
        costCenter: 'CC-LAND',
        description: 'Landscaping',
        subtotalCost: 0,
        baselineBudget: 50000,
        committedCost: 0,
        status: 'DRAFT',
        subCategories: [],
        items: [],
      };

      const csv = generateStandardBOQTemplateCSV(emptyCat, true);
      const lines = csv.split('\n');
      expect(lines[0]).toBe('Item Code,Item Description / Specs,Unit (UOM),Required Quantity');
      expect(lines[1]).toContain('LAND-001');
      expect(lines[1]).toContain('Landscaping Works');
    });
  });
});
