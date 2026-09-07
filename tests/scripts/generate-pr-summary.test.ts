/**
 * @jest-environment node
 */
import path from 'path';
import fs from 'fs';
import {
  generateSummaryMarkdown,
  parseCoverageSummary,
  parseTestResults,
} from '@/../scripts/generate-pr-summary';

describe('PR Summary Generator (scripts/generate-pr-summary.js)', () => {
  const tmpDir = path.resolve(__dirname, '../../tmp-test-summary');

  beforeAll(() => {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe('parseCoverageSummary & parseTestResults', () => {
    it('returns null if file does not exist', () => {
      expect(parseCoverageSummary(path.join(tmpDir, 'non-existent.json'))).toBeNull();
      expect(parseTestResults(path.join(tmpDir, 'non-existent.json'))).toBeNull();
    });

    it('returns null if file contains invalid JSON', () => {
      const corruptFile = path.join(tmpDir, 'corrupt.json');
      fs.writeFileSync(corruptFile, 'not-valid-json');
      expect(parseCoverageSummary(corruptFile)).toBeNull();
      expect(parseTestResults(corruptFile)).toBeNull();
    });

    it('parses valid JSON file correctly', () => {
      const validFile = path.join(tmpDir, 'valid.json');
      fs.writeFileSync(validFile, JSON.stringify({ key: 'value' }));
      expect(parseCoverageSummary(validFile)).toEqual({ key: 'value' });
      expect(parseTestResults(validFile)).toEqual({ key: 'value' });
    });
  });

  describe('generateSummaryMarkdown', () => {
    it('generates a PASSED summary when all metrics satisfy >= 90% benchmark', () => {
      const mockCoverage = {
        total: {
          statements: { pct: 98.5 },
          branches: { pct: 93.2 },
          functions: { pct: 97.8 },
          lines: { pct: 98.9 },
        },
        'src/file1.ts': {
          statements: { pct: 95 },
          branches: { pct: 92 },
          functions: { pct: 94 },
          lines: { pct: 96 },
        },
        'src/file2.tsx': {
          statements: { pct: 100 },
          branches: { pct: 100 },
          functions: { pct: 100 },
          lines: { pct: 100 },
        },
      };

      const mockTestResults = {
        numPassedTestSuites: 23,
        numFailedTestSuites: 0,
        numTotalTestSuites: 23,
        numPassedTests: 153,
        numFailedTests: 0,
        numPendingTests: 0,
        numTotalTests: 153,
        startTime: Date.now() - 5000,
        success: true,
      };

      const markdown = generateSummaryMarkdown({
        coverageData: mockCoverage,
        testResults: mockTestResults,
        benchmark: 90,
      });

      expect(markdown).toContain('<!-- procpx-ci-report -->');
      expect(markdown).toContain('✅ **PASSED**');
      expect(markdown).toContain('**23** passed, **0** failed');
      expect(markdown).toContain('**153** passed, **0** failed');
      expect(markdown).toContain('98.50%');
      expect(markdown).toContain('All monitored source files satisfy the strict 90% per-file benchmark');
    });

    it('generates a FAILED summary when files or metrics are below 90% benchmark', () => {
      const mockCoverage = {
        total: {
          statements: { pct: 88.0 },
          branches: { pct: 85.0 },
          functions: { pct: 89.0 },
          lines: { pct: 87.5 },
        },
        'src/subpar.ts': {
          statements: { pct: 75.0 },
          branches: { pct: 60.0 },
          functions: { pct: 80.0 },
          lines: { pct: 70.0 },
        },
      };

      const mockTestResults = {
        numPassedTestSuites: 20,
        numFailedTestSuites: 2,
        numTotalTestSuites: 22,
        numPassedTests: 140,
        numFailedTests: 5,
        numPendingTests: 1,
        numTotalTests: 146,
        startTime: Date.now() - 6000,
        success: false,
      };

      const markdown = generateSummaryMarkdown({
        coverageData: mockCoverage,
        testResults: mockTestResults,
        benchmark: 90,
      });

      expect(markdown).toContain('❌ **FAILED**');
      expect(markdown).toContain('Files Below 90% Benchmark');
      expect(markdown).toContain('subpar.ts');
      expect(markdown).toContain('75.00%');
    });

    it('handles empty or missing coverage data without throwing', () => {
      const markdown = generateSummaryMarkdown({
        coverageData: null,
        testResults: null,
      });

      expect(markdown).toBeDefined();
      expect(markdown).toContain('0.00%');
    });
  });
});
