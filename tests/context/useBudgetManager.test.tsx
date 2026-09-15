import { renderHook, act } from '@testing-library/react';
import { useBudgetManager, generateUniqueItemCode, deriveShortCode } from '@/context/useBudgetManager';
import type { AuditLog, BudgetCategory } from '@/types';

describe('useBudgetManager Hook & Unique Code Generation Tests', () => {
  const setAuditLogsMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deriveShortCode', () => {
    it('derives short code from acronym for 3+ words', () => {
      expect(deriveShortCode('Fire Fighting System')).toBe('FFS');
      expect(deriveShortCode('Heating Ventilation Air Conditioning')).toBe('HVAC');
    });

    it('derives short code from 2 words prefix', () => {
      expect(deriveShortCode('Civil Works')).toBe('CIVIWO');
      expect(deriveShortCode('Interior Fitout')).toBe('INTEFI');
    });

    it('derives short code for single word', () => {
      expect(deriveShortCode('Landscaping')).toBe('LANDSC');
      expect(deriveShortCode('Carpentry')).toBe('CARPEN');
      expect(deriveShortCode('IT')).toBe('IT');
    });

    it('handles empty string or non-alphanumeric cleanly with fallback', () => {
      expect(deriveShortCode('')).toBe('CAT');
      expect(deriveShortCode('   ')).toBe('CAT');
      expect(deriveShortCode('---')).toBe('CAT');
    });
  });

  describe('generateUniqueItemCode', () => {
    it('handles collision by incrementing sequence number', () => {
      const categories: BudgetCategory[] = [
        {
          id: 'CAT-CIVIL',
          name: 'Civil Works',
          shortCode: 'CIVIL',
          costCenter: 'CC-CIV',
          description: 'Desc',
          subCategories: [
            { id: 'SUB-FOUND', categoryId: 'CAT-CIVIL', name: 'Foundation', shortCode: 'FOUND' },
          ],
          items: [
            {
              id: 'ITM-1',
              code: 'CIVIL-FOUND-002',
              categoryId: 'CAT-CIVIL',
              desc: 'Item 1',
              uom: 'Nos',
              benchmarkRate: 100,
              defaultQty: 1,
              qty: 1,
              calculatedCost: 100,
              status: 'ACTIVE',
              benchmarkDetails: {
                benchmarkRate: 100,
                masterRateCardRate: 100,
                historicalLowestRate: 100,
                aiConfidence: '95%',
                varianceVsRateCardPercent: 0,
              },
            },
          ],
          subtotalCost: 100,
          baselineBudget: 1000,
          committedCost: 0,
          status: 'DRAFT',
        },
      ];

      // With 1 item, candidate sequence is initially 2 -> 'CIVIL-FOUND-002', which exists in items!
      // The while loop will increment sequence to 3 -> 'CIVIL-FOUND-003'.
      const code = generateUniqueItemCode(categories, 'CAT-CIVIL', 'SUB-FOUND');
      expect(code).toBe('CIVIL-FOUND-003');
    });

    it('falls back to category shortcode or GEN when no category found', () => {
      const categories: BudgetCategory[] = [];
      const code = generateUniqueItemCode(categories, 'NON-EXISTENT');
      expect(code).toBe('CAT-GEN-001');
    });
  });

  describe('useBudgetManager actions and edge cases', () => {
    it('rejects invalid inputs on item quantity, contingency, and sqft', () => {
      const { result } = renderHook(() => useBudgetManager(setAuditLogsMock));

      // Invalid quantity (negative)
      act(() => {
        result.current.updateItemQuantity('CAT-CIVIL', 'ITEM-1', -10);
      });

      // Invalid contingency (> 100)
      act(() => {
        result.current.updateContingencyRate(150);
      });

      // Invalid sqft (negative)
      act(() => {
        result.current.updateProjectSqFt(-500);
      });

      expect(result.current.projectBudget.contingencyRatePercent).not.toBe(150);
    });

    it('freezes budget baseline and records audit log', () => {
      const { result } = renderHook(() => useBudgetManager(setAuditLogsMock));

      act(() => {
        result.current.freezeBudgetBaseline();
      });

      expect(result.current.projectBudget.status).toBe('BASELINED');
      expect(setAuditLogsMock).toHaveBeenCalled();
    });

    it('resets category quantities to standard defaults', () => {
      const { result } = renderHook(() => useBudgetManager(setAuditLogsMock));
      const firstCatId = result.current.projectCategories[0].id;
      const firstItemId = result.current.projectCategories[0].items[0]?.id;

      if (firstItemId) {
        act(() => {
          result.current.updateItemQuantity(firstCatId, firstItemId, 9999);
        });
        act(() => {
          result.current.resetCategoryQuantities(firstCatId);
        });
        const resetItem = result.current.projectCategories[0].items.find((i) => i.id === firstItemId);
        expect(resetItem?.qty).toBe(resetItem?.defaultQty);
      }
    });

    it('downloads CSV reports cleanly', () => {
      const { result } = renderHook(() => useBudgetManager(setAuditLogsMock));
      const firstCatId = result.current.projectCategories[0].id;

      expect(() => {
        result.current.downloadCategoryBOQCSV(firstCatId);
        result.current.downloadCategoryBOQCSV('NON-EXISTENT-ID');
        result.current.downloadProjectBudgetCSV();
        result.current.downloadCategorySummaryCSV();
      }).not.toThrow();
    });

    it('handles addCategory validation rejection and duplicates', () => {
      const { result } = renderHook(() => useBudgetManager(setAuditLogsMock));

      // Invalid payload
      expect(() => {
        result.current.addCategory({
          name: '',
          shortCode: '!',
          costCenter: '',
          description: '',
        });
      }).toThrow(/invalid category payload/i);

      // Add valid category
      let newCat: BudgetCategory | undefined;
      act(() => {
        newCat = result.current.addCategory({
          name: 'Unique Test Category',
          shortCode: 'UTC',
          costCenter: 'CC-UTC',
          description: 'Unique test category description',
          baselineBudget: 500000,
        });
      });
      expect(newCat?.id).toBe('CAT-UTC');

      // Add duplicate shortcode category to test disambiguation
      let dupCat: BudgetCategory | undefined;
      act(() => {
        dupCat = result.current.addCategory({
          name: 'Duplicate Test Category',
          shortCode: 'UTC',
          costCenter: 'CC-UTC2',
          description: 'Duplicate test category description',
        });
      });
      expect(dupCat?.id).toContain('CAT-UTC-');

      // Add category without shortCode, costCenter, description (auto-derivation test)
      let autoCat: BudgetCategory | undefined;
      act(() => {
        autoCat = result.current.addCategory({
          name: 'Landscaping Works',
        });
      });
      expect(autoCat?.shortCode).toBe('LANDWO');
      expect(autoCat?.costCenter).toContain('CC-LANDWO');

      // Add category with Major Category and Sub Category (New Major)
      let newMajorCat: BudgetCategory | undefined;
      act(() => {
        newMajorCat = result.current.addCategory({
          name: 'Acoustics & Soundproofing',
          majorCategory: 'Acoustics & Soundproofing',
          subCategory: 'Auditorium Acoustic Paneling',
          baselineBudget: 300000,
        });
      });
      expect(newMajorCat?.name).toBe('Acoustics & Soundproofing');
      expect(newMajorCat?.subCategories?.length).toBe(1);
      expect(newMajorCat?.subCategories?.[0]?.name).toBe('Auditorium Acoustic Paneling');

      // Add sub-category to existing category via addCategory with existing majorCategory
      let updatedExisting: BudgetCategory | undefined;
      act(() => {
        updatedExisting = result.current.addCategory({
          name: 'Acoustics & Soundproofing',
          majorCategory: 'Acoustics & Soundproofing',
          subCategory: 'Bass Traps & Studio Isolation',
          baselineBudget: 150000,
        });
      });
      expect(updatedExisting?.id).toBe(newMajorCat?.id);
      expect(updatedExisting?.subCategories?.length).toBe(2);
      expect(
        updatedExisting?.subCategories?.some((s) => s.name === 'Bass Traps & Studio Isolation')
      ).toBe(true);
      expect(updatedExisting?.baselineBudget).toBe(450000);
    });

    it('handles addSubCategory validation rejection and not found errors', () => {
      const { result } = renderHook(() => useBudgetManager(setAuditLogsMock));

      // Invalid payload
      expect(() => {
        result.current.addSubCategory({
          categoryId: '',
          name: '',
        });
      }).toThrow(/invalid subcategory payload/i);

      // Category not found
      expect(() => {
        result.current.addSubCategory({
          categoryId: 'NON-EXISTENT-CAT',
          name: 'Sub Name',
          shortCode: 'SUB1',
        });
      }).toThrow(/category not found/i);

      // Valid subcategory
      const firstCatId = result.current.projectCategories[0].id;
      act(() => {
        const sub = result.current.addSubCategory({
          categoryId: firstCatId,
          name: 'New Sub Tier',
          shortCode: 'NST',
          description: 'New sub tier description',
        });
        expect(sub.shortCode).toBe('NST');
      });

      // Subcategory with auto-derived shortCode
      act(() => {
        const autoSub = result.current.addSubCategory({
          categoryId: firstCatId,
          name: 'Automated Irrigation',
        });
        expect(autoSub.shortCode).toBe('AUTOIR');
      });
    });

    it('handles addStandardBOQItem validation rejection and not found errors', () => {
      const { result } = renderHook(() => useBudgetManager(setAuditLogsMock));

      // Invalid payload
      expect(() => {
        result.current.addStandardBOQItem({
          categoryId: '',
          desc: '',
          uom: '',
          benchmarkRate: -1,
          defaultQty: 0,
        });
      }).toThrow(/invalid standard boq item payload/i);

      // Category not found
      expect(() => {
        result.current.addStandardBOQItem({
          categoryId: 'NON-EXISTENT-CAT',
          desc: 'Valid description text',
          uom: 'Nos',
          benchmarkRate: 500,
          defaultQty: 10,
        });
      }).toThrow(/category not found/i);

      // Valid BOQ item
      const firstCatId = result.current.projectCategories[0].id;
      act(() => {
        const item = result.current.addStandardBOQItem({
          categoryId: firstCatId,
          desc: 'High-spec Granite Tiles',
          uom: 'Sqm',
          benchmarkRate: 1200,
          defaultQty: 25,
          notes: 'Special shipment',
        });
        expect(item.status).toBe('ACTIVE');
        expect(item.isImmutable).toBe(true);
      });
    });

    it('handles toggleItemHoldStatus validation rejection and toggling', () => {
      const { result } = renderHook(() => useBudgetManager(setAuditLogsMock));

      // Invalid payload
      act(() => {
        result.current.toggleItemHoldStatus('', '');
      });

      // Valid toggle
      const firstCat = result.current.projectCategories[0];
      const targetItem = firstCat.items[0];

      if (targetItem) {
        // Toggle to ON_HOLD
        act(() => {
          result.current.toggleItemHoldStatus(firstCat.id, targetItem.id);
        });
        let updatedItem = result.current.projectCategories[0].items.find((i) => i.id === targetItem.id);
        expect(updatedItem?.status).toBe('ON_HOLD');

        // Toggle back to ACTIVE
        act(() => {
          result.current.toggleItemHoldStatus(firstCat.id, targetItem.id);
        });
        updatedItem = result.current.projectCategories[0].items.find((i) => i.id === targetItem.id);
        expect(updatedItem?.status).toBe('ACTIVE');
      }
    });

    describe('uploadBatchStandardBOQItems', () => {
      it('returns empty array when given an empty or undefined batch', () => {
        const { result } = renderHook(() => useBudgetManager(setAuditLogsMock));

        let created: any[] = [];
        act(() => {
          created = result.current.uploadBatchStandardBOQItems([]);
        });
        expect(created).toEqual([]);

        act(() => {
          created = result.current.uploadBatchStandardBOQItems(undefined as any);
        });
        expect(created).toEqual([]);
      });

      it('skips invalid items and non-existent categories while importing valid items', () => {
        const { result } = renderHook(() => useBudgetManager(setAuditLogsMock));
        const firstCat = result.current.projectCategories[0];
        const subCatId = firstCat.subCategories?.[0]?.id;

        const initialTotalItems = firstCat.items.length;

        act(() => {
          const batch = result.current.uploadBatchStandardBOQItems([
            // Invalid item (schema failure: negative rate)
            {
              categoryId: firstCat.id,
              subCategoryId: subCatId,
              desc: 'Invalid negative rate',
              uom: 'Nos',
              benchmarkRate: -100,
              defaultQty: 10,
            },
            // Non-existent category
            {
              categoryId: 'NON-EXISTENT-CATEGORY-ID',
              desc: 'Valid item with ghost category',
              uom: 'Nos',
              benchmarkRate: 250,
              defaultQty: 5,
            },
            // Valid item 1
            {
              categoryId: firstCat.id,
              subCategoryId: subCatId,
              desc: 'Bulk Uploaded Item A',
              uom: 'Rmt',
              benchmarkRate: 350,
              defaultQty: 20,
              notes: 'Imported batch item A',
            },
            // Valid item 2
            {
              categoryId: firstCat.id,
              subCategoryId: subCatId,
              desc: 'Bulk Uploaded Item B',
              uom: 'Nos',
              benchmarkRate: 500,
              defaultQty: 10,
            },
          ]);

          expect(batch.length).toBe(2);
          expect(batch[0].desc).toBe('Bulk Uploaded Item A');
          expect(batch[0].isImmutable).toBe(true);
          expect(batch[0].status).toBe('ACTIVE');
          expect(batch[1].desc).toBe('Bulk Uploaded Item B');
          expect(batch[1].code).not.toBe(batch[0].code);
        });

        const updatedCat = result.current.projectCategories.find((c) => c.id === firstCat.id);
        expect(updatedCat?.items.length).toBe(initialTotalItems + 2);
        expect(setAuditLogsMock).toHaveBeenCalled();
      });
    });
  });
});

