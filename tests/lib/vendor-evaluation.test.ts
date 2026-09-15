import {
  calculateVendorEvaluationScore,
  calculateCompositeRating,
} from '@/lib/vendor-evaluation';
import type { VendorEvaluationSubmission } from '@/types';

describe('vendor-evaluation engine', () => {
  const highTierSubmission: VendorEvaluationSubmission = {
    turnoverCr: 60,
    solvencyBankName: 'State Bank of India',
    auditedBalanceSheet: true,
    factoryCapacityUnitsPerMonth: 6000,
    machineryCount: 25,
    workforceCount: 80,
    isoCertified: true,
    qcLabInHouse: true,
    pastProjectsCompleted: 30,
    gstinFilingCompliant: true,
    safetyPolicyCompliant: true,
  };

  const lowTierSubmission: VendorEvaluationSubmission = {
    turnoverCr: 2,
    solvencyBankName: '',
    auditedBalanceSheet: false,
    factoryCapacityUnitsPerMonth: 200,
    machineryCount: 2,
    workforceCount: 8,
    isoCertified: false,
    qcLabInHouse: false,
    pastProjectsCompleted: 1,
    gstinFilingCompliant: false,
    safetyPolicyCompliant: false,
  };

  it('should score a high-tier vendor with grade A+ and verified status', () => {
    const result = calculateVendorEvaluationScore(highTierSubmission);
    expect(result.totalScore).toBe(100);
    expect(result.grade).toBe('A+');
    expect(result.calculatedRating).toBe(4.9);
    expect(result.status).toBe('VERIFIED');
  });

  it('should reject a vendor failing minimum thresholds (< 60 points)', () => {
    const result = calculateVendorEvaluationScore(lowTierSubmission);
    expect(result.totalScore).toBeLessThan(60);
    expect(result.grade).toBe('D');
    expect(result.status).toBe('REJECTED');
  });

  it('should calculate composite rating without PPOs based purely on evaluation', () => {
    const rating = calculateCompositeRating(4.5, undefined, []);
    expect(rating).toBe(4.5);
  });

  it('should calculate weighted composite rating (40% eval + 60% PPO)', () => {
    const evalResult = calculateVendorEvaluationScore(highTierSubmission); // rating 4.9
    const ppoRatings = [
      {
        id: 'P1',
        ppoId: 'PPO-1',
        vendorId: 'V1',
        qualityRating: 5,
        timelinessRating: 5,
        commercialRating: 5,
        overallScore: 5.0,
        comments: 'Perfect delivery',
        ratedBy: 'Site Head',
        ratedAt: '2026-09-01',
      },
    ];

    // 0.40 * 4.9 + 0.60 * 5.0 = 1.96 + 3.0 = 4.96 -> round to 5.0
    const composite = calculateCompositeRating(4.0, evalResult, ppoRatings);
    expect(composite).toBe(5.0);
  });

  it('should score an Interior Fitout vendor with full category credibility (20 pts)', () => {
    const interiorSubmission: VendorEvaluationSubmission = {
      ...highTierSubmission,
      categorySpecificData: {
        interiorFitout: {
          carpentersCount: 55,
          brandsWorkedWith: ['Zara', 'Apple Store', 'Starbucks', 'Titan Eyeplus'],
          ongoingProjects: [
            {
              projectName: 'Phoenix Palladium Retail Fitout',
              clientName: 'Zara Apparel Ltd',
              locationCity: 'Mumbai',
              valueInLakhs: 240,
              completionPercent: 75,
            },
          ],
          clientReferences: [
            {
              clientName: 'Inditex Retail India',
              projectName: 'Zara Mall of India',
              contactPerson: 'Gautam Singhal',
              designation: 'Director Store Development',
              contactNumber: '+91 99100 88776',
              email: 'gautam@example.com',
              scopeDelivered: 'Turnkey Millwork',
              valueInCr: 4.2,
            },
            {
              clientName: 'Tata Starbucks',
              projectName: 'CyberCity Store',
              contactPerson: 'Rohit Kulkarni',
              designation: 'Head Project Delivery',
              contactNumber: '+91 98201 99887',
              email: 'rohit@example.com',
              scopeDelivered: 'Counters & Acoustics',
              valueInCr: 2.6,
            },
          ],
          workshopSqFt: 18000,
          hasCncMachine: true,
          hasAutoEdgeBander: true,
        },
      },
    };

    const result = calculateVendorEvaluationScore(interiorSubmission);
    expect(result.categoryCredibilityScore).toBe(20);
    expect(result.totalScore).toBe(100);
    expect(result.grade).toBe('A+');
    expect(result.status).toBe('VERIFIED');
  });

  it('should score a Boughtout/MEP vendor with Tier-1 dealership and Pan-India coverage (20 pts)', () => {
    const boughtoutSubmission: VendorEvaluationSubmission = {
      ...highTierSubmission,
      categorySpecificData: {
        boughtoutMEP: {
          dealerships: [
            {
              brandName: 'Honeywell',
              productCategory: 'Building Management & CCTV',
              dealershipTier: 'TIER_1_AUTHORIZED',
              validTill: '2027-12-31',
              territoryCovered: ['WEST', 'NORTH'],
            },
            {
              brandName: 'Daikin',
              productCategory: 'VRV & Chillers',
              dealershipTier: 'TIER_1_AUTHORIZED',
              validTill: '2028-06-30',
              territoryCovered: ['WEST', 'SOUTH'],
            },
          ],
          regionsCovered: ['West', 'North', 'South', 'Pan-India'],
          serviceCentersCount: 4,
          certifiedEngineersCount: 18,
          oemWarrantySupportAvailable: true,
          annualAmcCapability: true,
          slaResponseTimeHours: 4,
          clientReferences: [
            {
              clientName: 'Tata Consultancy Services',
              projectName: 'Banyan Park Campus MEP',
              contactPerson: 'Vikram Joshi',
              designation: 'VP Infrastructure',
              contactNumber: '+91 98200 45678',
              email: 'v.joshi@example.com',
              scopeDelivered: 'Honeywell IBMS',
              valueInCr: 6.8,
            },
            {
              clientName: 'L&T Realty',
              projectName: 'Seawoods Grand Central',
              contactPerson: 'Pooja Iyer',
              designation: 'GM Procurement',
              contactNumber: '+91 98450 12345',
              email: 'p.iyer@example.com',
              scopeDelivered: 'Daikin VRV',
              valueInCr: 9.4,
            },
          ],
        },
      },
    };

    const result = calculateVendorEvaluationScore(boughtoutSubmission);
    expect(result.categoryCredibilityScore).toBe(20);
    expect(result.totalScore).toBe(100);
    expect(result.grade).toBe('A+');
  });
});
