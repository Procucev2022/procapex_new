import { QueryAuditEntry, DatabaseAuditMetrics, DatabaseOptimizationConfig } from '@/types';
import { DEFAULT_DB_OPTIMIZATION_CONFIG, DB_COMPUTE_METRICS } from '@/constants';
import { dbCache } from './db-cache';
import { logger } from './logger';

export class DatabaseQueryAuditor {
  private totalQueries = 0;
  private totalDurationMs = 0;
  private slowQueries: QueryAuditEntry[] = [];
  private config: DatabaseOptimizationConfig;

  constructor(config: Partial<DatabaseOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_DB_OPTIMIZATION_CONFIG, ...config };
  }

  public recordQuery(
    params: Omit<QueryAuditEntry, 'id' | 'timestamp' | 'isSlowQuery'>
  ): QueryAuditEntry {
    this.totalQueries++;
    this.totalDurationMs += params.durationMs;

    const isSlowQuery = params.durationMs >= this.config.slowQueryThresholdMs;
    const entry: QueryAuditEntry = {
      ...params,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      isSlowQuery,
    };

    if (isSlowQuery) {
      this.slowQueries.unshift(entry);
      if (this.slowQueries.length > DB_COMPUTE_METRICS.MAX_SLOW_QUERIES_RETAINED) {
        this.slowQueries.pop();
      }

      logger.warn('lib/db-auditor', `Slow database query detected: ${params.querySignature} (${params.durationMs}ms)`, {
        model: params.model,
        operation: params.operation,
        durationMs: params.durationMs,
        thresholdMs: this.config.slowQueryThresholdMs,
      });
    } else {
      logger.debug('lib/db-auditor', `Database query audited: ${params.querySignature}`, {
        model: params.model,
        operation: params.operation,
        durationMs: params.durationMs,
        isCached: params.isCached,
      });
    }

    return entry;
  }

  public async auditAsync<T>(
    model: string,
    operation: QueryAuditEntry['operation'],
    querySignature: string,
    executor: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await executor();
      const durationMs = Date.now() - startTime;

      this.recordQuery({
        model,
        operation,
        querySignature,
        durationMs,
        isCached: false,
        computeCostUnits: Math.max(1, Math.round(durationMs / 5)),
      });

      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      this.recordQuery({
        model,
        operation,
        querySignature: `${querySignature} [FAILED]`,
        durationMs,
        isCached: false,
        computeCostUnits: 1,
      });
      throw error;
    }
  }

  public getMetrics(): DatabaseAuditMetrics {
    const cacheStats = dbCache.getStats();
    const avgDuration = this.totalQueries > 0 ? this.totalDurationMs / this.totalQueries : 0;
    const totalComputeHours = this.totalDurationMs / DB_COMPUTE_METRICS.MS_PER_HOUR;

    // Efficiency Score (0-100%): 100 * (1 - slowQueryRate) * (0.5 + 0.5 * (cacheHitRatio / 100))
    const slowQueryRate = this.totalQueries > 0 ? this.slowQueries.length / this.totalQueries : 0;
    const cacheBonus = cacheStats.hitRatio / 100;
    const efficiency = Math.min(100, Math.max(0, (1 - slowQueryRate) * (50 + 50 * cacheBonus)));

    return {
      totalQueries: this.totalQueries,
      slowQueriesCount: this.slowQueries.length,
      avgDurationMs: parseFloat(avgDuration.toFixed(2)),
      cacheStats,
      recentSlowQueries: [...this.slowQueries],
      estimatedComputeHoursTotal: parseFloat(totalComputeHours.toFixed(6)),
      estimatedComputeHoursSaved: cacheStats.estimatedComputeHoursSaved,
      efficiencyScore: parseFloat(efficiency.toFixed(1)),
    };
  }

  public reset(): void {
    this.totalQueries = 0;
    this.totalDurationMs = 0;
    this.slowQueries = [];
    dbCache.resetStats();
  }
}

export const dbAuditor = new DatabaseQueryAuditor();
