import {
  PRICING_TIERS,
  COMMON_VENDOR_MODULE,
  COMMON_VENDOR_ROLE,
  TENANT_TIER_UPDATE_SCHEMA,
} from '@/constants';
import { validateSchema } from '@/lib/validator';
import type { PricingTierId } from '@/types';

describe('Pricing Tiers Architecture & Constants', () => {
  it('defines all 3 standard pricing tiers with correct prices and metadata', () => {
    expect(PRICING_TIERS.MODULE_1).toBeDefined();
    expect(PRICING_TIERS.MODULE_2).toBeDefined();
    expect(PRICING_TIERS.MODULE_3).toBeDefined();

    // Module 1: $2,000
    expect(PRICING_TIERS.MODULE_1.priceUSD).toBe(2000);
    expect(PRICING_TIERS.MODULE_1.priceFormatted).toBe('$2,000');
    expect(PRICING_TIERS.MODULE_1.allowedRoles).toContain('FINANCE_HEAD');
    expect(PRICING_TIERS.MODULE_1.allowedModules).toContain('budget_planning');
    expect(PRICING_TIERS.MODULE_1.allowedModules).not.toContain('category_standard_boq_master');

    // Module 2: $4,000
    expect(PRICING_TIERS.MODULE_2.priceUSD).toBe(4000);
    expect(PRICING_TIERS.MODULE_2.priceFormatted).toBe('$4,000');
    expect(PRICING_TIERS.MODULE_2.allowedRoles).toContain('FINANCE_HEAD');
    expect(PRICING_TIERS.MODULE_2.allowedRoles).toContain('BOQ_RFQ_MANAGER');
    expect(PRICING_TIERS.MODULE_2.allowedModules).toContain('budget_planning');
    expect(PRICING_TIERS.MODULE_2.allowedModules).toContain('boq_rfq_management');
    expect(PRICING_TIERS.MODULE_2.allowedModules).toContain('category_standard_boq_master');

    // Module 3: $6,000
    expect(PRICING_TIERS.MODULE_3.priceUSD).toBe(6000);
    expect(PRICING_TIERS.MODULE_3.priceFormatted).toBe('$6,000');
    expect(PRICING_TIERS.MODULE_3.allowedRoles).toContain('FINANCE_HEAD');
    expect(PRICING_TIERS.MODULE_3.allowedRoles).toContain('BOQ_RFQ_MANAGER');
    expect(PRICING_TIERS.MODULE_3.allowedRoles).toContain('VENDOR_NEGOTIATION_HUB');
    expect(PRICING_TIERS.MODULE_3.allowedRoles).toContain('PROJECT_HEAD_PPO');
    expect(PRICING_TIERS.MODULE_3.allowedModules).toContain('vendor_negotiation_hub');
    expect(PRICING_TIERS.MODULE_3.allowedModules).toContain('ppo_workorders');
    expect(PRICING_TIERS.MODULE_3.allowedModules).toContain('category_standard_boq_master');
  });

  it('guarantees common Vendor Portal and Quotation bidding access across all 3 tiers', () => {
    const tierKeys: PricingTierId[] = ['MODULE_1', 'MODULE_2', 'MODULE_3'];

    tierKeys.forEach((key) => {
      const tier = PRICING_TIERS[key];
      expect(tier.allowedModules).toContain(COMMON_VENDOR_MODULE);
      expect(tier.allowedRoles).toContain(COMMON_VENDOR_ROLE);
    });
  });

  it('validates tenant tier update payload against schema', () => {
    const validPayload = {
      tenantKey: 'TNT_GODREJ',
      newTier: 'MODULE_2',
    };
    const validResult = validateSchema(validPayload, TENANT_TIER_UPDATE_SCHEMA);
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toHaveLength(0);

    const invalidTier = {
      tenantKey: 'TNT_GODREJ',
      newTier: 'MODULE_INVALID',
    };
    const invalidTierResult = validateSchema(invalidTier, TENANT_TIER_UPDATE_SCHEMA);
    expect(invalidTierResult.isValid).toBe(false);
    expect(invalidTierResult.errors.length).toBeGreaterThanOrEqual(1);

    const invalidTenant = {
      tenantKey: 'TNT_UNKNOWN',
      newTier: 'MODULE_1',
    };
    const invalidTenantResult = validateSchema(invalidTenant, TENANT_TIER_UPDATE_SCHEMA);
    expect(invalidTenantResult.isValid).toBe(false);
    expect(invalidTenantResult.errors.length).toBeGreaterThanOrEqual(1);
  });
});
