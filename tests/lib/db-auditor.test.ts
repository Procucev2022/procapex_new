import { DatabaseQueryAuditor, dbAuditor } from '@/lib/db-auditor';
import { logger } from '@/lib/logger';

describe('DatabaseQueryAuditor Suite', () => {
  let auditor: DatabaseQueryAuditor;

  beforeEach(() => {
    auditor = new DatabaseQueryAuditor({
      slowQueryThresholdMs: 50, // 50ms slow query threshold
      computeCostPerQueryMs: 15,
    });
  });

  it('should record queries and calculate average duration', () => {
    auditor.recordQuery({
      model: 'PurchaseRequest',
      operation: 'FIND_MANY',
      querySignature: 'pr.findMany',
      durationMs: 20,
      isCached: false,
      computeCostUnits: 4,
    });

    auditor.recordQuery({
      model: 'Tenant',
      operation: 'FIND_UNIQUE',
      querySignature: 'tenant.findUnique',
      durationMs: 40,
      isCached: false,
      computeCostUnits: 8,
    });

    const metrics = auditor.getMetrics();
    expect(metrics.totalQueries).toBe(2);
    expect(metrics.slowQueriesCount).toBe(0);
    expect(metrics.avgDurationMs).toBe(30);
    expect(metrics.efficiencyScore).toBeGreaterThan(0);
  });

  it('should flag slow queries exceeding threshold and retain recent ones', () => {
    const warnSpy = jest.spyOn(logger, 'warn');

    auditor.recordQuery({
      model: 'VendorQuote',
      operation: 'FIND_MANY',
      querySignature: 'vendorQuote.findMany',
      durationMs: 120, // exceeds 50ms
      isCached: false,
      computeCostUnits: 24,
    });

    expect(warnSpy).toHaveBeenCalledWith(
      'lib/db-auditor',
      expect.stringContaining('Slow database query detected'),
      expect.objectContaining({ durationMs: 120, model: 'VendorQuote' })
    );

    const metrics = auditor.getMetrics();
    expect(metrics.slowQueriesCount).toBe(1);
    expect(metrics.recentSlowQueries.length).toBe(1);
    expect(metrics.recentSlowQueries[0].isSlowQuery).toBe(true);

    warnSpy.mockRestore();
  });

  it('should audit async execution and record duration', async () => {
    const asyncOp = jest.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { result: 'success' };
    });

    const res = await auditor.auditAsync<{ result: string }>('BOQItem', 'FIND_MANY', 'boq.findMany', asyncOp);
    expect(res.result).toBe('success');
    expect(asyncOp).toHaveBeenCalledTimes(1);

    const metrics = auditor.getMetrics();
    expect(metrics.totalQueries).toBe(1);
    expect(metrics.avgDurationMs).toBeGreaterThanOrEqual(5);
  });

  it('should audit async execution when executor throws error', async () => {
    const faultyOp = jest.fn().mockRejectedValue(new Error('Connection failure'));

    await expect(
      auditor.auditAsync('BOQItem', 'DELETE', 'boq.delete', faultyOp)
    ).rejects.toThrow('Connection failure');

    const metrics = auditor.getMetrics();
    expect(metrics.totalQueries).toBe(1);
    expect(metrics.recentSlowQueries).toBeDefined();
  });

  it('should cap retained slow queries to maximum limit', () => {
    for (let i = 0; i < 60; i++) {
      auditor.recordQuery({
        model: 'HeavyTable',
        operation: 'FIND_MANY',
        querySignature: `heavy.query.${i}`,
        durationMs: 80, // slow query
        isCached: false,
        computeCostUnits: 10,
      });
    }

    const metrics = auditor.getMetrics();
    expect(metrics.totalQueries).toBe(60);
    expect(metrics.slowQueriesCount).toBe(50);
    expect(metrics.recentSlowQueries.length).toBe(50);
  });

  it('should reset auditor state correctly', () => {
    auditor.recordQuery({
      model: 'Test',
      operation: 'FIND_MANY',
      querySignature: 'test.find',
      durationMs: 10,
      isCached: false,
      computeCostUnits: 1,
    });

    expect(auditor.getMetrics().totalQueries).toBe(1);

    auditor.reset();
    expect(auditor.getMetrics().totalQueries).toBe(0);
    expect(auditor.getMetrics().avgDurationMs).toBe(0);
    expect(auditor.getMetrics().slowQueriesCount).toBe(0);
  });

  it('should export singleton dbAuditor instance', () => {
    expect(dbAuditor).toBeDefined();
    expect(dbAuditor.getMetrics()).toBeDefined();
  });
});
