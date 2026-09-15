import {
  EVALUATION_GRADE_THRESHOLDS,
} from '@/constants/vendor-management';
import { logger } from '@/lib/logger';
import type {
  VendorEvaluationSubmission,
  VendorEvaluationScoreResult,
  VendorPPORating,
  EvaluationGrade,
  EvaluationStatus,
  InteriorFitoutEvaluationData,
  BoughtoutMEPEvaluationData,
  CivilStructuralEvaluationData,
  FacadeExternalEvaluationData,
  CategorySpecificEvaluationData,
} from '@/types/vendor-management';

/**
 * Calculates credibility score for Interior & Retail Fitout contractors (Max 20 pts).
 */
export function calculateInteriorFitoutCredibility(
  data: InteriorFitoutEvaluationData
): number {
  let score = 0;
  if (data.carpentersCount >= 40) {
    score += 6;
  } else if (data.carpentersCount >= 20) {
    score += 4;
  } else if (data.carpentersCount >= 10) {
    score += 2;
  } else {
    score += 1;
  }

  const brandsCount = data.brandsWorkedWith?.length ?? 0;
  if (brandsCount >= 4) {
    score += 5;
  } else if (brandsCount >= 2) {
    score += 3;
  } else if (brandsCount >= 1) {
    score += 1;
  }

  const refCount = data.clientReferences?.length ?? 0;
  if (refCount >= 2) {
    score += 5;
  } else if (refCount >= 1) {
    score += 3;
  }

  if (data.hasCncMachine) {
    score += 2;
  }
  if (data.hasAutoEdgeBander) {
    score += 2;
  }

  return Math.min(20, score);
}

/**
 * Calculates credibility score for Bought-outs & MEP Equipment suppliers (Max 20 pts).
 */
export function calculateBoughtoutMEPCredibility(
  data: BoughtoutMEPEvaluationData
): number {
  let score = 0;
  const hasTier1 = data.dealerships?.some(
    (d) => d.dealershipTier === 'TIER_1_AUTHORIZED' || d.dealershipTier === 'DIRECT_OEM'
  );
  const hasIntegrator = data.dealerships?.some(
    (d) => d.dealershipTier === 'SYSTEM_INTEGRATOR' || d.dealershipTier === 'DISTRIBUTOR'
  );

  if (hasTier1) {
    score += 7;
  } else if (hasIntegrator) {
    score += 4;
  } else if ((data.dealerships?.length ?? 0) > 0) {
    score += 2;
  }

  const isPanIndia = data.regionsCovered?.some((r) => r.toUpperCase().includes('PAN'));
  const regionsCount = data.regionsCovered?.length ?? 0;
  if (isPanIndia || regionsCount >= 3) {
    score += 5;
  } else if (regionsCount === 2) {
    score += 3;
  } else if (regionsCount === 1) {
    score += 1;
  }

  if (data.certifiedEngineersCount >= 10) {
    score += 4;
  } else if (data.certifiedEngineersCount >= 4) {
    score += 2;
  } else {
    score += 1;
  }

  const refCount = data.clientReferences?.length ?? 0;
  if (refCount >= 2) {
    score += 4;
  } else if (refCount >= 1) {
    score += 2;
  }

  return Math.min(20, score);
}

/**
 * Calculates credibility score for Civil & Structural Contractors (Max 20 pts).
 */
export function calculateCivilStructuralCredibility(
  data: CivilStructuralEvaluationData
): number {
  let score = 0;
  if (data.batchingPlantsCount >= 1 && data.transitMixersCount >= 2) {
    score += 6;
  } else if (data.batchingPlantsCount >= 1 || data.transitMixersCount >= 2) {
    score += 3;
  }

  if (data.towerCranesCount >= 2) {
    score += 4;
  } else if (data.towerCranesCount >= 1) {
    score += 2;
  }

  if (data.safetyLostTimeAccidentsPast3Yrs === 0) {
    score += 5;
  } else if (data.safetyLostTimeAccidentsPast3Yrs === 1) {
    score += 2;
  }

  const refCount = data.clientReferences?.length ?? 0;
  if (refCount >= 2) {
    score += 5;
  } else if (refCount >= 1) {
    score += 3;
  }

  return Math.min(20, score);
}

/**
 * Calculates credibility score for Facade & External Works (Max 20 pts).
 */
export function calculateFacadeCredibility(
  data: FacadeExternalEvaluationData
): number {
  let score = 0;
  const glazingCount = data.glazingSystemsFabricated?.length ?? 0;
  if (glazingCount >= 2) {
    score += 6;
  } else if (glazingCount >= 1) {
    score += 3;
  }

  if (data.windTunnelTestingCertified) {
    score += 5;
  }

  if (data.spiderCranesAndCradlesCount >= 2) {
    score += 4;
  } else if (data.spiderCranesAndCradlesCount >= 1) {
    score += 2;
  }

  const refCount = data.clientReferences?.length ?? 0;
  if (refCount >= 2) {
    score += 5;
  } else if (refCount >= 1) {
    score += 3;
  }

  return Math.min(20, score);
}

/**
 * Evaluates category-specific credibility data or computes proportional fallback.
 */
function resolveCategoryCredibilityScore(
  categoryData?: CategorySpecificEvaluationData,
  baselineSum: number = 0
): number {
  if (categoryData?.interiorFitout) {
    return calculateInteriorFitoutCredibility(categoryData.interiorFitout);
  }
  if (categoryData?.boughtoutMEP) {
    return calculateBoughtoutMEPCredibility(categoryData.boughtoutMEP);
  }
  if (categoryData?.civilStructural) {
    return calculateCivilStructuralCredibility(categoryData.civilStructural);
  }
  if (categoryData?.facadeExternal) {
    return calculateFacadeCredibility(categoryData.facadeExternal);
  }
  return Math.min(20, Math.round(baselineSum * 0.25));
}

/**
 * Computes pillar-based evaluation scores from vendor questionnaire submission.
 */
export function calculateVendorEvaluationScore(
  submission: VendorEvaluationSubmission
): VendorEvaluationScoreResult {
  // 1. Financial Stability (Max 20 pts)
  let financialScore = 0;
  if (submission.turnoverCr >= 50) {
    financialScore += 12;
  } else if (submission.turnoverCr >= 20) {
    financialScore += 9;
  } else if (submission.turnoverCr >= 5) {
    financialScore += 6;
  } else {
    financialScore += 3;
  }
  if (submission.solvencyBankName && submission.solvencyBankName.trim().length > 1) {
    financialScore += 4;
  }
  if (submission.auditedBalanceSheet) {
    financialScore += 4;
  }

  // 2. Operational & Plant Capacity (Max 25 pts)
  let operationalScore = 0;
  if (submission.factoryCapacityUnitsPerMonth >= 5000) {
    operationalScore += 10;
  } else if (submission.factoryCapacityUnitsPerMonth >= 1000) {
    operationalScore += 7;
  } else {
    operationalScore += 4;
  }
  if (submission.machineryCount >= 20) {
    operationalScore += 8;
  } else if (submission.machineryCount >= 5) {
    operationalScore += 5;
  } else {
    operationalScore += 2;
  }
  if (submission.workforceCount >= 50) {
    operationalScore += 7;
  } else if (submission.workforceCount >= 15) {
    operationalScore += 4;
  } else {
    operationalScore += 2;
  }

  // 3. Quality & Certifications (Max 20 pts)
  let qualityScore = 0;
  if (submission.isoCertified) {
    qualityScore += 8;
  }
  if (submission.qcLabInHouse) {
    qualityScore += 6;
  }
  if (submission.pastProjectsCompleted >= 20) {
    qualityScore += 6;
  } else if (submission.pastProjectsCompleted >= 5) {
    qualityScore += 4;
  } else {
    qualityScore += 2;
  }

  // 4. Statutory & ESG Compliance (Max 15 pts)
  let complianceScore = 0;
  if (submission.gstinFilingCompliant) {
    complianceScore += 8;
  }
  if (submission.safetyPolicyCompliant) {
    complianceScore += 7;
  }

  // 5. Category-Specific Credibility (Max 20 pts)
  const baselineSum = financialScore + operationalScore + qualityScore + complianceScore;
  const categoryCredibilityScore = resolveCategoryCredibilityScore(
    submission.categorySpecificData,
    baselineSum
  );

  const totalScore = Math.min(
    100,
    financialScore + operationalScore + qualityScore + complianceScore + categoryCredibilityScore
  );

  let matchedGrade: EvaluationGrade = 'D';
  let calculatedRating = 2.0;

  for (const tier of EVALUATION_GRADE_THRESHOLDS) {
    if (totalScore >= tier.minScore) {
      matchedGrade = tier.grade;
      calculatedRating = tier.rating;
      break;
    }
  }

  const status: EvaluationStatus = totalScore >= 60 ? 'VERIFIED' : 'REJECTED';

  const result: VendorEvaluationScoreResult = {
    financialScore,
    operationalScore,
    qualityScore,
    complianceScore,
    categoryCredibilityScore,
    totalScore,
    calculatedRating,
    grade: matchedGrade,
    status,
    evaluatedAt: new Date().toISOString().split('T')[0],
  };

  logger.info('lib/vendor-evaluation', 'Computed vendor evaluation score', {
    totalScore,
    grade: matchedGrade,
    calculatedRating,
    status,
    categoryCredibilityScore,
  });

  return result;
}

/**
 * Recalculates dynamic composite rating:
 * - When PPOs have been rated: 40% Onboarding Evaluation + 60% PPO Delivery Track Record.
 * - When no PPOs have been rated: 100% Evaluation / Baseline rating.
 */
export function calculateCompositeRating(
  baselineRating: number,
  evaluationScore?: VendorEvaluationScoreResult,
  ppoRatings?: VendorPPORating[]
): number {
  const evalRating = evaluationScore?.calculatedRating ?? baselineRating;

  if (!ppoRatings || ppoRatings.length === 0) {
    return Math.round(evalRating * 10) / 10;
  }

  const ppoAverage =
    ppoRatings.reduce((acc, ppo) => acc + ppo.overallScore, 0) / ppoRatings.length;

  const composite = 0.4 * evalRating + 0.6 * ppoAverage;
  return Math.round(composite * 10) / 10;
}
