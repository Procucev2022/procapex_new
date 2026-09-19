import type {
  BudgetCategory,
  RateCardAgreement,
  VendorRateCardCategoryCoverage,
} from '@/types';
import { INITIAL_PROJECT_CATEGORIES } from '@/constants/budget';

/**
 * Matches a category code or name to the appropriate BudgetCategory containing Standard BOQ items.
 */
export function findMatchingStandardBOQCategory(
  categoryCodeOrName: string | undefined,
  projectCategories: BudgetCategory[] = INITIAL_PROJECT_CATEGORIES
): BudgetCategory | undefined {
  if (!categoryCodeOrName) {
    return projectCategories[0];
  }

  const query = categoryCodeOrName.toUpperCase().trim();

  // 1. Exact ID or shortCode match
  const exact = projectCategories.find(
    (c) => c.id.toUpperCase() === query || c.shortCode.toUpperCase() === query
  );
  if (exact) return exact;

  // 2. Canonical category aliases
  if (query.includes('INT') || query.includes('MILLWORK') || query.includes('JOINERY')) {
    const intCat = projectCategories.find((c) => c.id === 'CAT-INTERIOR' || c.shortCode === 'INTERIOR');
    if (intCat) return intCat;
  }

  if (query.includes('CIVIL') || query.includes('CONCRETE') || query.includes('STRUCT')) {
    const civCat = projectCategories.find((c) => c.id === 'CAT-CIVIL' || c.shortCode === 'CIVIL');
    if (civCat) return civCat;
  }

  if (query.includes('MEP') || query.includes('ELECT') || query.includes('PLUMB')) {
    const mepCat = projectCategories.find((c) => c.id === 'CAT-MEP' || c.shortCode === 'MEP');
    if (mepCat) return mepCat;
  }

  if (query.includes('FACADE') || query.includes('GLAZ')) {
    const facCat = projectCategories.find((c) => c.id === 'CAT-FACADE' || c.shortCode === 'FACADE');
    if (facCat) return facCat;
  }

  // 3. Substring match on category name
  const nameMatch = projectCategories.find((c) => c.name.toUpperCase().includes(query));
  if (nameMatch) return nameMatch;

  return projectCategories[0];
}

/**
 * Normalizes item code prefixes to detect equivalencies between Rate Card lines and Standard BOQ lines.
 */
function isCodeEquivalent(rcCode: string, stdCode: string): boolean {
  if (rcCode === stdCode) return true;
  const rcUpper = rcCode.toUpperCase();
  const stdUpper = stdCode.toUpperCase();

  // Common cross-reference mappings between catalog variations
  const mappings: Array<[string, string]> = [
    ['CNT-LAM-HPL01', 'CNT-LAM-1MM'],
    ['CNT-HRD-SFT01', 'CNT-HDW-SOFT'],
    ['CNT-ELE-LED12', 'CNT-LED-PROF'],
    ['CNT-MSF-SS304', 'CNT-SKT-SS304'],
    ['CIV-EXC-SOIL', 'CIV-EXC-MECH'],
  ];

  return mappings.some(
    ([a, b]) => (rcUpper === a && stdUpper === b) || (rcUpper === b && stdUpper === a)
  );
}

/**
 * Calculates Rate Card coverage percentage specifically out of the Standard BOQ of that particular category.
 */
export function calculateVendorCategoryRateCardCoverage(
  vendorId: string,
  categoryCodeOrName: string | undefined,
  projectCategories: BudgetCategory[] = INITIAL_PROJECT_CATEGORIES,
  rateCards: RateCardAgreement[] = [],
  vendorNameFallback?: string
): VendorRateCardCategoryCoverage {
  const targetCategory = findMatchingStandardBOQCategory(categoryCodeOrName, projectCategories);
  const totalStandardBOQItems = targetCategory?.items?.length || 0;

  // Find vendor's agreements matching this category or vendor's primary agreement
  const vendorAgreements = rateCards.filter((rc) => rc.vendorId === vendorId);
  const matchingAgreement =
    vendorAgreements.find((rc) => {
      const matchCat = findMatchingStandardBOQCategory(rc.categoryCode, projectCategories);
      return matchCat?.id === targetCategory?.id;
    }) || vendorAgreements[0];

  const vendorName = matchingAgreement?.vendorName || vendorNameFallback || vendorId;
  const categoryCode = targetCategory?.id || categoryCodeOrName || 'CAT-GENERAL';
  const categoryName = targetCategory?.name || categoryCodeOrName || 'General Category';

  if (!matchingAgreement) {
    return {
      vendorId,
      vendorName,
      categoryCode,
      categoryName,
      totalStandardBOQItems,
      coveredItemsCount: 0,
      coveragePct: 0,
      isFullyCovered: false,
      rateCardStatus: undefined,
      coveredItems: [],
      missingStandardBOQItems: (targetCategory?.items || []).map((i) => ({
        code: i.code,
        desc: i.desc,
        uom: i.uom,
        benchmarkRate: i.benchmarkRate,
      })),
    };
  }

  // Match items in the agreement against standard BOQ items
  const coveredStdCodes = new Set<string>();
  const agreementItemCodes = new Set(matchingAgreement.items.map((it) => it.itemCode));

  (targetCategory?.items || []).forEach((stdItem) => {
    if (agreementItemCodes.has(stdItem.code)) {
      coveredStdCodes.add(stdItem.code);
      return;
    }
    const hasEquivalent = matchingAgreement.items.some((rcItem) =>
      isCodeEquivalent(rcItem.itemCode, stdItem.code)
    );
    if (hasEquivalent) {
      coveredStdCodes.add(stdItem.code);
    }
  });

  // Calculate counts
  const coveredCount = Math.min(
    Math.max(coveredStdCodes.size, matchingAgreement.items.length),
    totalStandardBOQItems
  );
  const coveragePct = totalStandardBOQItems > 0 ? Math.round((coveredCount / totalStandardBOQItems) * 100) : 0;
  const isFullyCovered = coveragePct >= 100;

  const missingStandardBOQItems = (targetCategory?.items || [])
    .filter((std) => !coveredStdCodes.has(std.code))
    .map((i) => ({
      code: i.code,
      desc: i.desc,
      uom: i.uom,
      benchmarkRate: i.benchmarkRate,
    }));

  return {
    vendorId,
    vendorName,
    categoryCode,
    categoryName,
    totalStandardBOQItems,
    coveredItemsCount: coveredCount,
    coveragePct,
    isFullyCovered,
    rateCardId: matchingAgreement.id,
    rateCardStatus: matchingAgreement.status,
    coveredItems: matchingAgreement.items,
    missingStandardBOQItems,
  };
}
