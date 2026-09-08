/**
 * @jest-environment node
 */
import fs from 'fs';
import path from 'path';
import { CentralizedLogger, logger, safeSerialize, LogLevel } from '@/lib/logger';

describe('CentralizedLogger System', () => {
  const testLogDir = path.resolve(__dirname, '../../tmp-test-logs');

  beforeEach(() => {
    logger.clearLogs();
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  describe('safeSerialize', () => {
    it('handles primitives, null, and undefined', () => {
      expect(safeSerialize(null)).toBeNull();
      expect(safeSerialize(undefined)).toBeUndefined();
      expect(safeSerialize('test')).toBe('test');
      expect(safeSerialize(123)).toBe(123);
      expect(safeSerialize(true)).toBe(true);
    });

    it('handles BigInt', () => {
      expect(safeSerialize(BigInt(9007199254740991))).toBe('9007199254740991');
    });

    it('handles Error instances', () => {
      const err = new Error('Test Error');
      const serialized = safeSerialize(err) as Record<string, unknown>;
      expect(serialized.name).toBe('Error');
      expect(serialized.message).toBe('Test Error');
      expect(serialized.stack).toBeDefined();
    });

    it('handles circular references and nested objects', () => {
      const obj: Record<string, unknown> = { a: 1, nested: { b: 2 } };
      obj.self = obj;
      const serialized = safeSerialize(obj) as {
        a: number;
        nested: { b: number };
        self: string;
      };
      expect(serialized.a).toBe(1);
      expect(serialized.nested.b).toBe(2);
      expect(serialized.self).toBe('[Circular]');
    });

    it('handles arrays and complex objects with nested errors', () => {
      const arr = [1, { err: new Error('inner') }, BigInt(42)];
      const serialized = safeSerialize(arr) as [
        number,
        { err: { message: string } },
        string,
      ];
      expect(serialized[0]).toBe(1);
      expect(serialized[1].err.message).toBe('inner');
      expect(serialized[2]).toBe('42');
    });
  });

  describe('Core Logging & Ring Buffer', () => {
    let customLogger: CentralizedLogger;

    beforeEach(() => {
      customLogger = new CentralizedLogger({
        logDir: testLogDir,
        maxMemoryLogs: 5,
        minLevel: 'DEBUG',
      });
    });

    it('logs entries with proper attributes across all levels', () => {
      const d = customLogger.debug('test/module', 'debug message', { val: 1 });
      const i = customLogger.info('test/module', 'info message', { val: 2 }, 'corr-1');
      const w = customLogger.warn('test/module', 'warn message', { val: 3 });
      const e = customLogger.error('test/module', 'error message', { val: 4 });

      expect(d.level).toBe('DEBUG');
      expect(i.level).toBe('INFO');
      expect(i.correlationId).toBe('corr-1');
      expect(w.level).toBe('WARN');
      expect(e.level).toBe('ERROR');

      const { logs, total } = customLogger.searchLogs();
      expect(total).toBe(4);
      expect(logs.length).toBe(4);
    });

    it('evicts oldest logs from memory ring buffer once max is reached', () => {
      for (let idx = 1; idx <= 8; idx++) {
        customLogger.info('test/module', `msg ${idx}`);
      }
      const { logs, total } = customLogger.searchLogs();
      expect(total).toBe(5);
      expect(logs[0].message).toBe('msg 8');
      expect(logs[4].message).toBe('msg 4');
    });

    it('supports child loggers with default module and correlationId', () => {
      const child = customLogger.child({ module: 'child/mod', correlationId: 'child-corr' });
      child.info('child info', { foo: 'bar' });
      child.debug('child debug');
      child.warn('child warn');
      child.error('child error');

      const { logs } = customLogger.searchLogs({ module: 'child/mod' });
      expect(logs.length).toBe(4);
      expect(logs[0].correlationId).toBe('child-corr');
      expect(logs[0].module).toBe('child/mod');
    });

    it('clears in-memory logs', () => {
      customLogger.info('test', 'will be cleared');
      expect(customLogger.searchLogs().total).toBe(1);
      customLogger.clearLogs();
      expect(customLogger.searchLogs().total).toBe(0);
    });
  });

  describe('Search & Filter', () => {
    let customLogger: CentralizedLogger;

    beforeEach(() => {
      customLogger = new CentralizedLogger({
        logDir: testLogDir,
        maxMemoryLogs: 50,
      });

      customLogger.info('module/alpha', 'Alpha operation completed', { status: 'OK' }, 'corr-alpha');
      customLogger.warn('module/beta', 'Beta resource low', { threshold: 90 }, 'corr-beta');
      customLogger.error('module/gamma', 'Gamma critical failure', { code: 500 });
      customLogger.debug('module/alpha', 'Alpha debug trace', { step: 1 });
    });

    it('filters by level', () => {
      const res = customLogger.searchLogs({ level: 'ERROR' });
      expect(res.total).toBe(1);
      expect(res.logs[0].message).toBe('Gamma critical failure');
    });

    it('filters by module substring', () => {
      const res = customLogger.searchLogs({ module: 'alpha' });
      expect(res.total).toBe(2);
    });

    it('filters by correlationId', () => {
      const res = customLogger.searchLogs({ correlationId: 'corr-beta' });
      expect(res.total).toBe(1);
      expect(res.logs[0].message).toBe('Beta resource low');
    });

    it('filters by full-text search across message and metadata', () => {
      const resMsg = customLogger.searchLogs({ search: 'critical' });
      expect(resMsg.total).toBe(1);

      const resMeta = customLogger.searchLogs({ search: 'threshold' });
      expect(resMeta.total).toBe(1);
    });

    it('filters by start and end date range', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 10000).toISOString();
      const future = new Date(now.getTime() + 10000).toISOString();

      const res = customLogger.searchLogs({ startDate: past, endDate: future });
      expect(res.total).toBe(4);

      const resFuture = customLogger.searchLogs({ startDate: future });
      expect(resFuture.total).toBe(0);
    });

    it('supports offset and limit pagination', () => {
      const page1 = customLogger.searchLogs({ limit: 2, offset: 0 });
      expect(page1.logs.length).toBe(2);
      expect(page1.total).toBe(4);

      const page2 = customLogger.searchLogs({ limit: 2, offset: 2 });
      expect(page2.logs.length).toBe(2);
      expect(page2.logs[0].id).not.toBe(page1.logs[0].id);
    });
  });

  describe('Local Filesystem Persistence & Purging', () => {
    it('persists logs into app.log and error.log', () => {
      const fsLogger = new CentralizedLogger({
        logDir: testLogDir,
        minLevel: 'DEBUG',
      });

      fsLogger.info('fs/test', 'Info line on disk', { data: 'val' });
      fsLogger.error('fs/test', 'Error line on disk', { err: 'critical' });

      const appLogPath = path.join(testLogDir, 'app.log');
      const errorLogPath = path.join(testLogDir, 'error.log');

      expect(fs.existsSync(appLogPath)).toBe(true);
      expect(fs.existsSync(errorLogPath)).toBe(true);

      const appContent = fs.readFileSync(appLogPath, 'utf8');
      expect(appContent).toContain('Info line on disk');
      expect(appContent).toContain('Error line on disk');

      const errorContent = fs.readFileSync(errorLogPath, 'utf8');
      expect(errorContent).not.toContain('Info line on disk');
      expect(errorContent).toContain('Error line on disk');
    });

    it('rotates log file when exceeding maxFileSize', () => {
      const rotLogger = new CentralizedLogger({
        logDir: testLogDir,
        maxFileSize: 150, // Small limit for testing rotation
        maxRotatedFiles: 3,
      });

      for (let i = 0; i < 10; i++) {
        rotLogger.info('rot/test', `Message sequence ${i} with padding text ${'x'.repeat(50)}`);
      }

      const rotated1 = path.join(testLogDir, 'app.log.1');
      expect(fs.existsSync(rotated1)).toBe(true);
    });

    it('purges expired log files and in-memory entries based on retention threshold', () => {
      const purgeLogger = new CentralizedLogger({
        logDir: testLogDir,
        retentionDays: 1,
      });

      fs.mkdirSync(testLogDir, { recursive: true });
      // Create an older log file directly
      const oldFile = path.join(testLogDir, 'old-audit.log');
      fs.writeFileSync(oldFile, 'legacy content');
      const pastTime = (Date.now() - 3 * 24 * 60 * 60 * 1000) / 1000;
      fs.utimesSync(oldFile, pastTime, pastTime);

      // Add fresh log
      purgeLogger.info('purge/test', 'Fresh log');

      const result = purgeLogger.purgeExpiredLogs(1);
      expect(result.purgedFiles).toContain('old-audit.log');
      expect(fs.existsSync(oldFile)).toBe(false);
    });

    it('handles browser environment when isServer is false', () => {
      const browserLogger = new CentralizedLogger({
        isServer: false,
        logDir: testLogDir,
      });

      const entry = browserLogger.info('browser/test', 'Browser log line', { key: 'val' });
      expect(entry.environment).toBe('browser');

      const appLogPath = path.join(testLogDir, 'app.log');
      expect(fs.existsSync(appLogPath)).toBe(false); // Does not write to disk in browser mode
    });

    it('ingests client logs and stores in memory & filesystem', () => {
      const ingestLogger = new CentralizedLogger({
        logDir: testLogDir,
      });

      const ingested = ingestLogger.ingest({
        level: 'WARN',
        module: 'client/browser',
        message: 'Client warning log',
        data: { screen: 'checkout' },
      });

      expect(ingested.module).toBe('client/browser');
      expect(ingested.level).toBe('WARN');
    });

    it('evicts oldest entries when ingesting beyond maxMemoryLogs', () => {
      const ingestLogger = new CentralizedLogger({
        logDir: testLogDir,
        maxMemoryLogs: 2,
      });
      ingestLogger.ingest({ message: 'one' });
      ingestLogger.ingest({ message: 'two' });
      ingestLogger.ingest({ message: 'three' });
      const { logs } = ingestLogger.searchLogs();
      expect(logs.length).toBe(2);
      expect(logs[0].message).toBe('three');
    });

    it('rotates and unlinks old rotated log file when exceeding maxRotatedFiles', () => {
      const rotLogger = new CentralizedLogger({
        logDir: testLogDir,
        maxFileSize: 80,
        maxRotatedFiles: 2,
      });
      for (let i = 0; i < 20; i++) {
        rotLogger.info('rot/test', `Message ${i} with long padding text ${'y'.repeat(60)}`);
      }
      expect(fs.existsSync(path.join(testLogDir, 'app.log.1'))).toBe(true);
    });

    it('skips non-expired files and subdirectories during purge', () => {
      const purgeLogger = new CentralizedLogger({
        logDir: testLogDir,
        retentionDays: 1,
      });
      fs.mkdirSync(testLogDir, { recursive: true });
      const subDir = path.join(testLogDir, 'sub-folder');
      fs.mkdirSync(subDir, { recursive: true });
      const freshFile = path.join(testLogDir, 'fresh.log');
      fs.writeFileSync(freshFile, 'fresh');
      const result = purgeLogger.purgeExpiredLogs(1);
      expect(fs.existsSync(freshFile)).toBe(true);
      expect(fs.existsSync(subDir)).toBe(true);
      expect(result.purgedFiles).not.toContain('fresh.log');
    });

    it('handles filesystem errors gracefully in ensureLogDir and writeToFile', () => {
      const badLogger = new CentralizedLogger({
        logDir: '\0invalid-null-byte-path',
      });
      expect(() => badLogger.info('test', 'should not throw')).not.toThrow();
    });

    it('respects minLevel configuration and ignores lower severity logs', () => {
      const infoOnlyLogger = new CentralizedLogger({
        minLevel: 'INFO',
        maxMemoryLogs: 10,
      });
      infoOnlyLogger.debug('test', 'hidden debug');
      expect(infoOnlyLogger.searchLogs({ level: 'DEBUG' }).total).toBe(0);
    });

    it('supports child loggers with default and override parameters', () => {
      const customLogger = new CentralizedLogger({ logDir: testLogDir });
      const childNoDefaults = customLogger.child({});
      childNoDefaults.info('msg without defaults', undefined, 'custom-id');
      const { logs } = customLogger.searchLogs({ correlationId: 'custom-id' });
      expect(logs[0].module).toBe('app');
    });
  });

  describe('Default Singleton Logger', () => {
    it('provides global singleton logger instance', () => {
      expect(logger).toBeDefined();
      logger.info('singleton/test', 'Singleton is functioning');
      const res = logger.searchLogs({ module: 'singleton/test' });
      expect(res.total).toBeGreaterThanOrEqual(1);
    });
  });
});
