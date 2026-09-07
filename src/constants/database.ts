import { DatabaseOptimizationConfig } from '@/types';

export const DEFAULT_DB_OPTIMIZATION_CONFIG: DatabaseOptimizationConfig = {
  defaultTtlMs: 60 * 1000, // 60 seconds TTL for read queries
  maxEntries: 500, // Maximum cache capacity before LRU eviction
  slowQueryThresholdMs: 100, // Queries taking > 100ms are audited as slow
  computeCostPerQueryMs: 12, // Estimated baseline DB server execution overhead (ms)
  enableAuditLogging: true,
};

export const CACHE_TAGS = {
  TENANTS: 'tenant',
  PURCHASE_REQUESTS: 'pr',
  VENDORS: 'vendor',
  BOQ_ITEMS: 'boq',
  MASTERS: 'masters',
  PPOS: 'ppo',
  POS: 'po',
  AUDIT_LOGS: 'audit',
} as const;

export const DB_COMPUTE_METRICS = {
  MS_PER_HOUR: 3600 * 1000,
  BASELINE_VCPU_UNITS: 2,
  MAX_SLOW_QUERIES_RETAINED: 50,
} as const;
