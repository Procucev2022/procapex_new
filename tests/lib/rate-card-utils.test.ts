import {
  findMatchingStandardBOQCategory,
  calculateVendorCategoryRateCardCoverage,
} from '@/lib/rate-card-utils';
import { INITIAL_PROJECT_CATEGORIES } from '@/constants/budget';
import { SEED_RATE_CARD_AGREEMENTS } from '@/constants/rate-cards';

describe('rate-card-utils: Standard BOQ Coverage Calculation', () => {
  it('matches category codes to the appropriate BudgetCategory', () => {
    const intCat = findMatchingStandardBOQCategory('INTERIOR', INITIAL_PROJECT_CATEGORIES);
    expect(intCat).toBeDefined();
    expect(intCat?.id).toBe('CAT-INTERIOR');

    const civCat = findMatchingStandardBOQCategory('CIVIL', INITIAL_PROJECT_CATEGORIES);
    expect(civCat).toBeDefined();
    expect(civCat?.id).toBe('CAT-CIVIL');

    const mepCat = findMatchingStandardBOQCategory('MEP', INITIAL_PROJECT_CATEGORIES);
    expect(mepCat).toBeDefined();
    expect(mepCat?.id).toBe('CAT-MEP');
  });

  it('calculates 100% coverage out of Standard BOQ for fully empanelled Interior vendor', () => {
    // VND-001 has RC-2026-INT-001 covering all 6 counter/joinery specifications
    const result = calculateVendorCategoryRateCardCoverage(
      'VND-001',
      'INTERIOR',
      INITIAL_PROJECT_CATEGORIES,
      SEED_RATE_CARD_AGREEMENTS
    );

    expect(result.vendorId).toBe('VND-001');
    expect(result.totalStandardBOQItems).toBe(6);
    expect(result.coveredItemsCount).toBe(6);
    expect(result.coveragePct).toBe(100);
    expect(result.isFullyCovered).toBe(true);
    expect(result.missingStandardBOQItems.length).toBe(0);
  });

  it('calculates partial coverage out of Standard BOQ for partially empanelled vendor', () => {
    // VND-002 has RC-2026-PROP-002 with 3 items out of 6
    const result = calculateVendorCategoryRateCardCoverage(
      'VND-002',
      'INTERIOR',
      INITIAL_PROJECT_CATEGORIES,
      SEED_RATE_CARD_AGREEMENTS
    );

    expect(result.totalStandardBOQItems).toBe(6);
    expect(result.coveredItemsCount).toBe(3);
    expect(result.coveragePct).toBe(50);
    expect(result.isFullyCovered).toBe(false);
    expect(result.missingStandardBOQItems.length).toBe(3);
  });

  it('calculates 75% coverage for Civil vendor with 3 of 4 items empanelled', () => {
    // VND-011 has RC-2026-CIV-001 with 3 items out of 4 in CAT-CIVIL
    const result = calculateVendorCategoryRateCardCoverage(
      'VND-011',
      'CIVIL',
      INITIAL_PROJECT_CATEGORIES,
      SEED_RATE_CARD_AGREEMENTS
    );

    expect(result.totalStandardBOQItems).toBe(4);
    expect(result.coveredItemsCount).toBe(3);
    expect(result.coveragePct).toBe(75);
    expect(result.isFullyCovered).toBe(false);
    expect(result.missingStandardBOQItems.length).toBe(1);
  });

  it('returns 0% coverage and all standard BOQ items as missing when no agreement exists', () => {
    const result = calculateVendorCategoryRateCardCoverage(
      'VND-NON-EXISTENT',
      'CIVIL',
      INITIAL_PROJECT_CATEGORIES,
      []
    );

    expect(result.totalStandardBOQItems).toBe(4);
    expect(result.coveredItemsCount).toBe(0);
    expect(result.coveragePct).toBe(0);
    expect(result.isFullyCovered).toBe(false);
    expect(result.missingStandardBOQItems.length).toBe(4);
  });
});
