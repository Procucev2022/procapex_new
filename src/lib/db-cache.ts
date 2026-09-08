import type { CacheEntry, CacheStats, DatabaseOptimizationConfig } from '@/types';
import { DEFAULT_DB_OPTIMIZATION_CONFIG, DB_COMPUTE_METRICS } from '@/constants';
import { logger } from './logger';

export class DatabaseQueryCache {
  private cache = new Map<string, CacheEntry>();
  private hits = 0;
  private misses = 0;
  private totalComputeSavedMs = 0;
  private config: DatabaseOptimizationConfig;

  constructor(config: Partial<DatabaseOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_DB_OPTIMIZATION_CONFIG, ...config };
  }

  public get<T = unknown>(key: string): T | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.misses++;
      return undefined;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    // Cache hit
    this.hits++;
    entry.hitCount++;
    this.totalComputeSavedMs += this.config.computeCostPerQueryMs;

    logger.debug('lib/db-cache', 'Query cache hit - compute saved', {
      key,
      hitCount: entry.hitCount,
      computeSavedMs: this.config.computeCostPerQueryMs,
    });

    return entry.data;
  }

  public set<T = unknown>(
    key: string,
    data: T,
    tags: string[] = [],
    ttlMs: number = this.config.defaultTtlMs
  ): void {
    // Capacity management: enforce LRU-style eviction if maxEntries exceeded
    if (this.cache.size >= this.config.maxEntries) {
      let oldestKey: string | undefined;
      this.cache.forEach((_, k) => {
        if (!oldestKey) oldestKey = k;
      });
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const now = Date.now();
    const entry: CacheEntry<T> = {
      key,
      data,
      createdAt: now,
      expiresAt: now + ttlMs,
      tags,
      hitCount: 0,
    };

    this.cache.set(key, entry as CacheEntry);
  }

  public invalidateByTag(tag: string): number {
    const keysToDelete: string[] = [];
    this.cache.forEach((entry, key) => {
      if (entry.tags.includes(tag)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
    });
    const invalidated = keysToDelete.length;

    logger.info('lib/db-cache', `Invalidated ${invalidated} cache entries for tag: ${tag}`, {
      tag,
      invalidatedCount: invalidated,
      remainingEntries: this.cache.size,
    });

    return invalidated;
  }

  public invalidateAll(): void {
    const count = this.cache.size;
    this.cache.clear();
    logger.info('lib/db-cache', `Flushed entire database query cache (${count} entries)`, {
      clearedCount: count,
    });
  }

  public async wrap<T>(
    key: string,
    fetcher: () => Promise<T>,
    tags: string[] = [],
    ttlMs: number = this.config.defaultTtlMs
  ): Promise<{ data: T; isCached: boolean; computeSavedMs: number }> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return {
        data: cached,
        isCached: true,
        computeSavedMs: this.config.computeCostPerQueryMs,
      };
    }

    const data = await fetcher();
    this.set(key, data, tags, ttlMs);

    return {
      data,
      isCached: false,
      computeSavedMs: 0,
    };
  }

  public getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRatio = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;
    const estimatedHours = this.totalComputeSavedMs / DB_COMPUTE_METRICS.MS_PER_HOUR;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRatio: parseFloat(hitRatio.toFixed(2)),
      activeEntries: this.cache.size,
      totalComputeSavedMs: this.totalComputeSavedMs,
      estimatedComputeHoursSaved: parseFloat(estimatedHours.toFixed(6)),
    };
  }

  public resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.totalComputeSavedMs = 0;
  }
}

export const dbCache = new DatabaseQueryCache();
