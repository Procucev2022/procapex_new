import type { UserRole } from './procurement';

export type PricingTierId = 'MODULE_1' | 'MODULE_2' | 'MODULE_3';

export interface PricingTierConfig {
  id: PricingTierId;
  code: string;
  name: string;
  priceUSD: number;
  priceFormatted: string;
  billingPeriod: string;
  badge: string;
  targetPersona: string;
  summary: string;
  allowedModules: string[];
  allowedRoles: UserRole[];
  features: string[];
}

export interface ModuleAccessGateProps {
  moduleId: string;
  children: React.ReactNode;
}

export interface TierUpgradeCardProps {
  requiredTier: PricingTierId;
  featureTitle: string;
  featureDescription?: string;
  onUpgrade?: (tier: PricingTierId) => void;
}
