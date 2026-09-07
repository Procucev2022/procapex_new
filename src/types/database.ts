export interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  createdAt: number;
  expiresAt: number;
  tags: string[];
  hitCount: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRatio: number;
  activeEntries: number;
  totalComputeSavedMs: number;
  estimatedComputeHoursSaved: number;
}

export interface QueryAuditEntry {
  id: string;
  querySignature: string;
  model: string;
  operation:
    | 'FIND_UNIQUE'
    | 'FIND_FIRST'
    | 'FIND_MANY'
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'RAW'
    | 'GRAPHQL_QUERY'
    | 'ENCRYPT'
    | 'DECRYPT';
  durationMs: number;
  timestamp: string;
  isSlowQuery: boolean;
  isCached: boolean;
  computeCostUnits: number;
}

export interface DatabaseAuditMetrics {
  totalQueries: number;
  slowQueriesCount: number;
  avgDurationMs: number;
  cacheStats: CacheStats;
  recentSlowQueries: QueryAuditEntry[];
  estimatedComputeHoursTotal: number;
  estimatedComputeHoursSaved: number;
  efficiencyScore: number;
}

export interface DatabaseOptimizationConfig {
  defaultTtlMs: number;
  maxEntries: number;
  slowQueryThresholdMs: number;
  computeCostPerQueryMs: number;
  enableAuditLogging: boolean;
}
