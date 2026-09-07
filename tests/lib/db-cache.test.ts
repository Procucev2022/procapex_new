import { DatabaseQueryCache, dbCache } from '@/lib/db-cache';

describe('DatabaseQueryCache Suite', () => {
  let cache: DatabaseQueryCache;

  beforeEach(() => {
    cache = new DatabaseQueryCache({
      defaultTtlMs: 100, // short TTL for testing
      maxEntries: 3, // small capacity for testing eviction
      computeCostPerQueryMs: 20,
    });
  });

  it('should store and retrieve cached items on cache hit', () => {
    cache.set('key1', { val: 42 }, ['tagA']);
    const result = cache.get<{ val: number }>('key1');

    expect(result).toBeDefined();
    expect(result?.val).toBe(42);

    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(0);
    expect(stats.hitRatio).toBe(100);
    expect(stats.totalComputeSavedMs).toBe(20);
    expect(stats.estimatedComputeHoursSaved).toBeGreaterThan(0);
  });

  it('should return undefined and register miss for non-existent keys', () => {
    const result = cache.get('non_existent');
    expect(result).toBeUndefined();

    const stats = cache.getStats();
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(1);
    expect(stats.hitRatio).toBe(0);
  });

  it('should expire entries after TTL elapsed', async () => {
    cache.set('ttl_key', 'hello', [], 50); // 50ms TTL

    expect(cache.get('ttl_key')).toBe('hello');

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(cache.get('ttl_key')).toBeUndefined();
  });

  it('should evict oldest entry when capacity exceeds maxEntries', () => {
    cache.set('k1', 1);
    cache.set('k2', 2);
    cache.set('k3', 3);
    // Exceed maxEntries (3)
    cache.set('k4', 4);

    expect(cache.get('k1')).toBeUndefined();
    expect(cache.get('k2')).toBe(2);
    expect(cache.get('k3')).toBe(3);
    expect(cache.get('k4')).toBe(4);
  });

  it('should invalidate entries matching specific tag', () => {
    cache.set('pr_1', { id: 1 }, ['pr', 'tenant_1']);
    cache.set('pr_2', { id: 2 }, ['pr', 'tenant_2']);
    cache.set('vendor_1', { id: 10 }, ['vendor']);

    const count = cache.invalidateByTag('pr');
    expect(count).toBe(2);

    expect(cache.get('pr_1')).toBeUndefined();
    expect(cache.get('pr_2')).toBeUndefined();
    expect(cache.get('vendor_1')).toBeDefined();
  });

  it('should invalidate all entries when invalidateAll is called', () => {
    cache.set('k1', 'a');
    cache.set('k2', 'b');

    cache.invalidateAll();
    expect(cache.get('k1')).toBeUndefined();
    expect(cache.get('k2')).toBeUndefined();
    expect(cache.getStats().activeEntries).toBe(0);
  });

  it('should wrap async fetchers with read-through caching', async () => {
    interface TestItem {
      id: string;
      name: string;
    }
    const fetcher = jest.fn().mockResolvedValue({ id: 'PR-100', name: 'Cement' });

    // First call: executes fetcher
    const firstCall = await cache.wrap<TestItem>('fetch_key', fetcher, ['pr']);
    expect(firstCall.isCached).toBe(false);
    expect(firstCall.data.id).toBe('PR-100');
    expect(firstCall.computeSavedMs).toBe(0);
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Second call: returns from cache without calling fetcher
    const secondCall = await cache.wrap<TestItem>('fetch_key', fetcher, ['pr']);
    expect(secondCall.isCached).toBe(true);
    expect(secondCall.data.id).toBe('PR-100');
    expect(secondCall.computeSavedMs).toBe(20);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should reset stats correctly', () => {
    cache.set('k', 1);
    cache.get('k');
    cache.get('missing');

    expect(cache.getStats().hits).toBe(1);
    expect(cache.getStats().misses).toBe(1);

    cache.resetStats();
    expect(cache.getStats().hits).toBe(0);
    expect(cache.getStats().misses).toBe(0);
    expect(cache.getStats().totalComputeSavedMs).toBe(0);
  });

  it('should export singleton dbCache instance', () => {
    expect(dbCache).toBeDefined();
    expect(dbCache.getStats()).toBeDefined();
  });
});
