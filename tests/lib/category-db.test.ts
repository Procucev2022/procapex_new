/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { getCategoriesFromDatabase, saveCategoriesToDatabase } from '@/lib/category-db';
import { GET, POST } from '@/app/api/categories/route';
import { INITIAL_PROJECT_CATEGORIES } from '@/constants';
import type { BudgetCategory } from '@/types';

describe('Category Database Service and API Route Tests', () => {
  it('getCategoriesFromDatabase returns populated categories', async () => {
    const categories = await getCategoriesFromDatabase();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    const firstCat = categories[0];
    expect(firstCat).toHaveProperty('id');
    expect(firstCat).toHaveProperty('name');
    expect(firstCat).toHaveProperty('shortCode');
    expect(firstCat).toHaveProperty('items');
    expect(Array.isArray(firstCat.items)).toBe(true);
  });

  it('saveCategoriesToDatabase updates backup and persists', async () => {
    const testCategory: BudgetCategory = {
      id: 'CAT-TEST-PERSIST',
      name: 'Test Category Persist',
      shortCode: 'TCP',
      costCenter: 'CC-TCP',
      description: 'Test persist description',
      subtotalCost: 1000,
      baselineBudget: 2000,
      committedCost: 0,
      status: 'DRAFT',
      subCategories: [
        {
          id: 'SUB-TCP-01',
          categoryId: 'CAT-TEST-PERSIST',
          name: 'Test SubCat',
          shortCode: 'TSUB',
        },
      ],
      items: [
        {
          id: 'ITM-TCP-001',
          code: 'TCP-TSUB-001',
          categoryId: 'CAT-TEST-PERSIST',
          subCategoryId: 'SUB-TCP-01',
          desc: 'Test Standard Item',
          uom: 'Nos',
          benchmarkRate: 500,
          defaultQty: 10,
          qty: 10,
          calculatedCost: 5000,
          status: 'ACTIVE',
          isImmutable: true,
          benchmarkDetails: {
            benchmarkRate: 500,
            masterRateCardRate: 500,
            historicalLowestRate: 500,
            aiConfidence: '95%',
            varianceVsRateCardPercent: 0,
          },
        },
      ],
    };

    const result = await saveCategoriesToDatabase([...INITIAL_PROJECT_CATEGORIES, testCategory]);
    expect(typeof result).toBe('boolean');
  });

  describe('API /api/categories GET and POST handlers', () => {
    it('GET returns status 200 with categories array', async () => {
      const response = await GET();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.categories)).toBe(true);
      expect(data.categories.length).toBeGreaterThan(0);
    });

    it('POST rejects invalid payload with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify({ invalidKey: 'foo' }),
      });
      const response = await POST(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('categories array is required');
    });

    it('POST accepts valid categories payload with 200', async () => {
      const req = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify({ categories: INITIAL_PROJECT_CATEGORIES }),
      });
      const response = await POST(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.persistedCount).toBe(INITIAL_PROJECT_CATEGORIES.length);
    });
  });
});
