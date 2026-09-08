import {
  parseLogLine,
  extractStackFrames,
  categorizeError,
  generateBugSignature,
  analyzeLogEntries,
  analyzeLogFiles,
  autoResolveBugs,
} from '@/lib/log-analyzer';
import {
  BUG_CATEGORIES,
  RESOLUTION_STRATEGIES,
  DEFAULT_LOG_ANALYZER_CONFIG,
} from '@/constants';
import { DiagnosedBug } from '@/types';
import { dbCache } from '@/lib/db-cache';
import fs from 'node:fs';
import path from 'node:path';

describe('Log Diagnostics & Auto-Resolution Engine (src/lib/log-analyzer.ts)', () => {
  describe('parseLogLine', () => {
    it('should return null for empty or whitespace-only lines', () => {
      expect(parseLogLine('')).toBeNull();
      expect(parseLogLine('   \n  \t ')).toBeNull();
    });

    it('should parse JSON log lines correctly', () => {
      const jsonLine = JSON.stringify({
        timestamp: '2026-09-07T12:00:00.000Z',
        level: 'error',
        module: 'api/negotiation',
        message: 'TypeError: Cannot read property rate of undefined',
        correlationId: 'req-test-123',
        data: {
          stack: 'TypeError: Cannot read property rate of undefined\n    at calculateTarget (src/lib/gemini.ts:42:15)',
        },
      });

      const parsed = parseLogLine(jsonLine);
      expect(parsed).not.toBeNull();
      expect(parsed?.level).toBe('ERROR');
      expect(parsed?.module).toBe('api/negotiation');
      expect(parsed?.message).toContain('TypeError');
      expect(parsed?.correlationId).toBe('req-test-123');
      expect(parsed?.stack).toContain('calculateTarget');
    });

    it('should parse JSON log line with default fallbacks when fields are missing', () => {
      const parsed = parseLogLine('{}');
      expect(parsed).not.toBeNull();
      expect(parsed?.level).toBe('INFO');
      expect(parsed?.module).toBe('app');
      expect(parsed?.message).toBe('');
      expect(parsed?.timestamp).toBeDefined();
    });

    it('should parse structured text log lines with correlation ID and metadata', () => {
      const textLine =
        '[2026-09-07T12:00:00.000Z] [ERROR] [api/graphql] [gql-12345]: GraphQL operation failed {"error":"PrismaClient query timeout","stack":"Error: PrismaClient query timeout\\n    at executeQuery (src/lib/prisma.ts:32:10)"}';

      const parsed = parseLogLine(textLine);
      expect(parsed).not.toBeNull();
      expect(parsed?.timestamp).toBe('2026-09-07T12:00:00.000Z');
      expect(parsed?.level).toBe('ERROR');
      expect(parsed?.module).toBe('api/graphql');
      expect(parsed?.correlationId).toBe('gql-12345');
      expect(parsed?.message).toBe('GraphQL operation failed');
      expect(String(parsed?.data?.error)).toContain('PrismaClient query timeout');
      expect(parsed?.stack).toContain('executeQuery');
    });

    it('should parse structured text line without correlation ID and metadata', () => {
      const textLine = '[2026-09-07T12:00:00.000Z] [INFO] [app]: System started cleanly';
      const parsed = parseLogLine(textLine);

      expect(parsed).not.toBeNull();
      expect(parsed?.level).toBe('INFO');
      expect(parsed?.module).toBe('app');
      expect(parsed?.correlationId).toBeUndefined();
      expect(parsed?.message).toBe('System started cleanly');
    });

    it('should extract stack trace from data.error when data.stack is absent', () => {
      const line =
        '[2026-09-07T12:00:00.000Z] [ERROR] [api/crypto]: Failure {"error":"Error: Decryption failed\\n    at decrypt (src/lib/crypto.ts:180:11)"}';
      const parsed = parseLogLine(line);
      expect(parsed?.stack).toContain('decrypt (src/lib/crypto.ts:180:11)');
    });

    it('should handle malformed JSON metadata in structured log line', () => {
      const line = '[2026-09-07T12:00:00.000Z] [INFO] [app]: Message {not-valid-json}';
      const parsed = parseLogLine(line);
      expect(parsed?.message).toBe('Message {not-valid-json}');
    });

    it('should fall back to unstructured error line for unstructured text', () => {
      const unstructured = 'Fatal unhandled exception in background worker process';
      const parsed = parseLogLine(unstructured);

      expect(parsed).not.toBeNull();
      expect(parsed?.level).toBe('ERROR');
      expect(parsed?.module).toBe('unstructured');
      expect(parsed?.message).toBe(unstructured);
    });
  });

  describe('extractStackFrames', () => {
    it('should return empty array when stack is undefined or empty', () => {
      expect(extractStackFrames(undefined)).toEqual([]);
      expect(extractStackFrames('')).toEqual([]);
    });

    it('should extract method name, normalized file path, line, and column', () => {
      const stack = `Error: Database timeout
    at runQuery (C:\\Users\\procu\\src\\lib\\prisma.ts:32:10)
    at C:\\Users\\procu\\src\\graphql\\resolvers.ts:105:22`;

      const frames = extractStackFrames(stack);
      expect(frames.length).toBe(2);

      expect(frames[0].functionName).toBe('runQuery');
      expect(frames[0].file).toContain('src/lib/prisma.ts');
      expect(frames[0].line).toBe(32);
      expect(frames[0].column).toBe(10);

      expect(frames[1].functionName).toBeUndefined();
      expect(frames[1].file).toContain('src/graphql/resolvers.ts');
      expect(frames[1].line).toBe(105);
      expect(frames[1].column).toBe(22);
    });

    it('should respect max stack frames limit', () => {
      const lines = ['Error: Loop'];
      for (let i = 1; i <= 20; i++) {
        lines.push(`    at func${i} (src/file.ts:${i}:1)`);
      }
      const stack = lines.join('\n');

      const frames = extractStackFrames(stack);
      expect(frames.length).toBe(DEFAULT_LOG_ANALYZER_CONFIG.maxStackFrames);
    });
  });

  describe('categorizeError', () => {
    it('should categorize TypeError correctly', () => {
      const res = categorizeError('TypeError: Cannot read properties of undefined');
      expect(res.category).toBe(BUG_CATEGORIES.TYPE_ERROR);
      expect(res.autoResolvable).toBe(false);
    });

    it('should categorize SyntaxError correctly', () => {
      const res = categorizeError('SyntaxError: Unexpected token < in JSON at position 0');
      expect(res.category).toBe(BUG_CATEGORIES.SYNTAX_ERROR);
      expect(res.autoResolvable).toBe(false);
    });

    it('should categorize Database errors correctly', () => {
      const res = categorizeError('PrismaClient Known Request Error P2002 Unique constraint failed');
      expect(res.category).toBe(BUG_CATEGORIES.DATABASE_ERROR);
      expect(res.autoResolvable).toBe(true);
      expect(res.resolutionStrategy).toBe(
        RESOLUTION_STRATEGIES.CLEAR_DATABASE_CACHE_AND_VALIDATE_SCHEMA
      );
    });

    it('should categorize Crypto errors correctly', () => {
      const res = categorizeError('Decryption failed: corrupted ciphertext or auth tag mismatch');
      expect(res.category).toBe(BUG_CATEGORIES.CRYPTO_ERROR);
      expect(res.autoResolvable).toBe(true);
    });

    it('should categorize GraphQL errors correctly', () => {
      const res = categorizeError('GraphQL error: Cannot query field "unknownField" on type "Tenant"');
      expect(res.category).toBe(BUG_CATEGORIES.GRAPHQL_ERROR);
      expect(res.autoResolvable).toBe(false);
    });

    it('should categorize Network errors correctly', () => {
      const res = categorizeError('Network offline: fetch failed to connect');
      expect(res.category).toBe(BUG_CATEGORIES.NETWORK_ERROR);
      expect(res.autoResolvable).toBe(true);
    });

    it('should categorize Validation errors correctly', () => {
      const res = categorizeError('ValidationError: Must provide a valid GraphQL query string');
      expect(res.category).toBe(BUG_CATEGORIES.VALIDATION_ERROR);
      expect(res.autoResolvable).toBe(false);
    });

    it('should return UNKNOWN for uncategorized errors', () => {
      const res = categorizeError('Something unexpected happened in custom system hook');
      expect(res.category).toBe(BUG_CATEGORIES.UNKNOWN);
      expect(res.autoResolvable).toBe(false);
      expect(res.resolutionStrategy).toBe(RESOLUTION_STRATEGIES.MANUAL_INSPECTION);
    });
  });

  describe('generateBugSignature', () => {
    it('should normalize UUIDs, timestamps, and correlation IDs to group identical bugs', () => {
      const sig1 = generateBugSignature(
        BUG_CATEGORIES.TYPE_ERROR,
        'TypeError on user 123e4567-e89b-12d3-a456-426614174000 at timestamp 1788798000000 req-nego-178879-abc',
        'src/lib/gemini.ts',
        42
      );

      const sig2 = generateBugSignature(
        BUG_CATEGORIES.TYPE_ERROR,
        'TypeError on user 987fcdeb-51a2-43d7-9876-ba9876543210 at timestamp 1788799000000 req-nego-178879-xyz',
        'src/lib/gemini.ts',
        42
      );

      expect(sig1).toBe(sig2);
      expect(sig1).toContain('TYPE_ERROR::gemini.ts:42::');
    });

    it('should handle missing culprit file and line', () => {
      const sig = generateBugSignature(BUG_CATEGORIES.UNKNOWN, 'Global error message');
      expect(sig).toContain('UNKNOWN::global:0::');
    });
  });

  describe('analyzeLogEntries', () => {
    it('should analyze log entries, aggregate recurring bugs, and calculate health score', () => {
      const logLines = [
        '[2026-09-07T12:00:00Z] [INFO] [app]: Starting system',
        '[2026-09-07T12:01:00Z] [WARN] [db]: slow query detected {"durationMs":120}',
        '[2026-09-07T12:02:00Z] [ERROR] [api/crypto] [req-1]: Decryption failed {"stack":"Error: Decryption failed\\n    at decrypt (src/lib/crypto.ts:180:11)"}',
        '[2026-09-07T12:03:00Z] [ERROR] [api/crypto] [req-2]: Decryption failed {"stack":"Error: Decryption failed\\n    at decrypt (src/lib/crypto.ts:180:11)"}',
      ];

      const report = analyzeLogEntries(logLines);
      expect(report.totalLinesScanned).toBe(4);
      expect(report.warningCount).toBe(1);
      expect(report.errorCount).toBe(2);
      expect(report.uniqueBugsCount).toBe(1);

      const bug = report.diagnosedBugs[0];
      expect(bug.category).toBe(BUG_CATEGORIES.CRYPTO_ERROR);
      expect(bug.occurrences).toBe(2);
      expect(bug.correlationIds).toEqual(['req-1', 'req-2']);
      expect(bug.culpritFile).toContain('src/lib/crypto.ts');
      expect(bug.culpritLine).toBe(180);
      expect(bug.autoResolvable).toBe(true);

      expect(report.healthScore).toBe(88); // 100 - (2 * 5) - (1 * 2) = 88
    });

    it('should clamp health score between 0 and 100 on high error count', () => {
      const manyErrors = Array(25).fill('[2026-09-07T12:00:00Z] [ERROR] [api]: Unexpected error');
      const report = analyzeLogEntries(manyErrors);
      expect(report.healthScore).toBe(0);
    });
  });

  describe('analyzeLogFiles', () => {
    it('should read and analyze existing log files or handle missing files', () => {
      const tempLogDir = path.resolve(process.cwd(), 'tests', 'fixtures');
      if (!fs.existsSync(tempLogDir)) {
        fs.mkdirSync(tempLogDir, { recursive: true });
      }

      const tempErrorLog = path.resolve(tempLogDir, 'temp-error.log');
      fs.writeFileSync(
        tempErrorLog,
        '[2026-09-07T12:00:00Z] [ERROR] [api/db]: PrismaClient slow query {"durationMs":200}\n'
      );

      const report = analyzeLogFiles([tempErrorLog, 'non-existent-log-file.log']);
      expect(report.scannedFiles).toContain(tempErrorLog);
      expect(report.errorCount).toBe(1);
      expect(report.diagnosedBugs[0].category).toBe(BUG_CATEGORIES.DATABASE_ERROR);

      // Clean up
      fs.unlinkSync(tempErrorLog);
    });

    it('should scan default log paths when no paths provided', () => {
      const report = analyzeLogFiles();
      expect(report).toBeDefined();
      expect(typeof report.healthScore).toBe('number');
    });

    it('should handle read error when reading log file fails', () => {
      const spyExists = jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
      const spyRead = jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
        throw new Error('EACCES: permission denied');
      });

      const report = analyzeLogFiles(['/locked/error.log']);
      expect(report.scannedFiles).toEqual([]);

      spyExists.mockRestore();
      spyRead.mockRestore();
    });
  });

  describe('autoResolveBugs', () => {
    it('should auto-resolve DATABASE_ERROR, CRYPTO_ERROR, and NETWORK_ERROR bugs', () => {
      const bugs: DiagnosedBug[] = [
        {
          id: 'BUG-1',
          signature: 'sig-db',
          category: BUG_CATEGORIES.DATABASE_ERROR,
          message: 'Prisma query failed',
          stackFrames: [],
          occurrences: 3,
          firstSeen: '',
          lastSeen: '',
          correlationIds: [],
          resolutionStrategy: 'Flush cache',
          autoResolvable: true,
        },
        {
          id: 'BUG-2',
          signature: 'sig-crypto',
          category: BUG_CATEGORIES.CRYPTO_ERROR,
          message: 'Decryption failed: auth tag mismatch',
          stackFrames: [],
          occurrences: 1,
          firstSeen: '',
          lastSeen: '',
          correlationIds: [],
          resolutionStrategy: 'Verify key',
          autoResolvable: true,
        },
        {
          id: 'BUG-3',
          signature: 'sig-net',
          category: BUG_CATEGORIES.NETWORK_ERROR,
          message: 'Network offline: connection reset',
          stackFrames: [],
          occurrences: 2,
          firstSeen: '',
          lastSeen: '',
          correlationIds: [],
          resolutionStrategy: 'Cache fallback',
          autoResolvable: true,
        },
        {
          id: 'BUG-4',
          signature: 'sig-type',
          category: BUG_CATEGORIES.TYPE_ERROR,
          message: 'TypeError: undefined is not an object',
          stackFrames: [],
          occurrences: 1,
          firstSeen: '',
          lastSeen: '',
          correlationIds: [],
          resolutionStrategy: 'Manual inspection',
          autoResolvable: false, // Should be skipped
        },
      ];

      const result = autoResolveBugs(bugs);

      expect(result.attemptedCount).toBe(3);
      expect(result.resolvedCount).toBe(3);
      expect(result.failedCount).toBe(0);
      expect(result.actions).toHaveLength(3);
      expect(result.actions[0].actionTaken).toContain('Flushed entire database query cache');
    });

    it('should handle errors gracefully during resolution attempt', () => {
      const spy = jest.spyOn(dbCache, 'invalidateAll').mockImplementationOnce(() => {
        throw new Error('Memory lock error');
      });

      const bugs: DiagnosedBug[] = [
        {
          id: 'BUG-FAIL',
          signature: 'sig-fail',
          category: BUG_CATEGORIES.DATABASE_ERROR,
          message: 'Prisma query failed',
          stackFrames: [],
          occurrences: 1,
          firstSeen: '',
          lastSeen: '',
          correlationIds: [],
          resolutionStrategy: 'Flush cache',
          autoResolvable: true,
        },
      ];

      const result = autoResolveBugs(bugs);
      expect(result.failedCount).toBe(1);
      expect(result.actions[0].success).toBe(false);
      expect(result.actions[0].actionTaken).toContain('Memory lock error');

      spy.mockRestore();
    });

    it('should handle non-Error throw during resolution attempt', () => {
      const spy = jest.spyOn(dbCache, 'invalidateAll').mockImplementationOnce(() => {
        throw 'String error thrown';
      });

      const bugs: DiagnosedBug[] = [
        {
          id: 'BUG-FAIL-STRING',
          signature: 'sig-fail-str',
          category: BUG_CATEGORIES.DATABASE_ERROR,
          message: 'Prisma query failed',
          stackFrames: [],
          occurrences: 1,
          firstSeen: '',
          lastSeen: '',
          correlationIds: [],
          resolutionStrategy: 'Flush cache',
          autoResolvable: true,
        },
      ];

      const result = autoResolveBugs(bugs);
      expect(result.failedCount).toBe(1);
      expect(result.actions[0].actionTaken).toContain('String error thrown');

      spy.mockRestore();
    });
  });
});
