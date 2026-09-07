/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/logs/route';
import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

describe('/api/logs API Route', () => {
  beforeEach(() => {
    logger.clearLogs();
  });

  describe('GET /api/logs', () => {
    it('returns empty list when no logs exist', async () => {
      const req = new NextRequest('http://localhost:3000/api/logs');
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.total).toBe(0);
      expect(json.logs).toEqual([]);
    });

    it('returns filtered logs with pagination parameters', async () => {
      logger.info('module-a', 'First message', { idx: 1 });
      logger.warn('module-b', 'Second warning', { idx: 2 });
      logger.error('module-a', 'Third error', { idx: 3 });

      const req = new NextRequest('http://localhost:3000/api/logs?module=module-a&level=ERROR&limit=10&offset=0');
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.total).toBe(1);
      expect(json.logs[0].message).toBe('Third error');
    });

    it('filters by search term, dates, and correlationId', async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 5000).toISOString();
      const future = new Date(now.getTime() + 5000).toISOString();

      logger.info('search-test', 'Specific keyword inside message', {}, 'corr-123');
      logger.info('search-test', 'Another standard message');

      const req = new NextRequest(`http://localhost:3000/api/logs?search=keyword&startDate=${past}&endDate=${future}&correlationId=corr-123&limit=invalid&offset=invalid`);
      const res = await GET(req);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.total).toBe(1);
      expect(json.limit).toBe(50);
      expect(json.offset).toBe(0);
      expect(json.logs[0].message).toContain('keyword');
    });

    it('caps limit at 500', async () => {
      const req = new NextRequest('http://localhost:3000/api/logs?limit=9999');
      const res = await GET(req);
      const json = await res.json();
      expect(json.limit).toBe(500);
    });

    it('executes purge action with custom retention days', async () => {
      logger.info('purge-test', 'Log prior to purge');

      const req = new NextRequest('http://localhost:3000/api/logs?action=purge&retentionDays=14');
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.action).toBe('purge');
      expect(json.retentionDays).toBe(14);
    });

    it('executes purge action with default retention days when omitted or invalid', async () => {
      const req1 = new NextRequest('http://localhost:3000/api/logs?action=purge');
      const res1 = await GET(req1);
      const json1 = await res1.json();
      expect(json1.retentionDays).toBe(7);

      const req2 = new NextRequest('http://localhost:3000/api/logs?action=purge&retentionDays=invalid');
      const res2 = await GET(req2);
      const json2 = await res2.json();
      expect(json2.retentionDays).toBe(7);
    });

    it('executes diagnose action and returns log analysis report', async () => {
      logger.error('diagnose-test', 'PrismaClientInitializationError: Unable to connect');

      const req = new NextRequest('http://localhost:3000/api/logs?action=diagnose');
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.action).toBe('diagnose');
      expect(json.report).toBeDefined();
      expect(typeof json.report.healthScore).toBe('number');
      expect(Array.isArray(json.report.diagnosedBugs)).toBe(true);
    });

    it('executes auto-resolve action and attempts resolution on diagnosed bugs', async () => {
      logger.error('autoresolve-test', 'ECONNREFUSED 127.0.0.1:5432');

      const req = new NextRequest('http://localhost:3000/api/logs?action=auto-resolve');
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.action).toBe('auto-resolve');
      expect(json.report).toBeDefined();
      expect(json.resolution).toBeDefined();
      expect(typeof json.resolution.attemptedCount).toBe('number');
      expect(typeof json.resolution.resolvedCount).toBe('number');
      expect(Array.isArray(json.resolution.actions)).toBe(true);
    });

    it('handles unexpected errors gracefully and returns 500', async () => {
      jest.spyOn(logger, 'searchLogs').mockImplementationOnce(() => {
        throw new Error('Database search explosion');
      });

      const req = new NextRequest('http://localhost:3000/api/logs');
      const res = await GET(req);
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Database search explosion');
    });

    it('handles unexpected non-Error throws in GET', async () => {
      jest.spyOn(logger, 'searchLogs').mockImplementationOnce(() => {
        throw 'String error';
      });

      const req = new NextRequest('http://localhost:3000/api/logs');
      const res = await GET(req);
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json.error).toBe('Failed to process logs request');
    });
  });

  describe('POST /api/logs', () => {
    it('ingests a single client log successfully with all fields', async () => {
      const payload = {
        level: 'WARN',
        module: 'ui/button',
        message: 'Button clicked multiple times',
        data: { clicks: 5 },
        correlationId: 'client-trace-1',
      };

      const req = new NextRequest('http://localhost:3000/api/logs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBe(1);
      expect(json.entry.message).toBe('Button clicked multiple times');
    });

    it('ingests a single client log with only message (defaults module and level)', async () => {
      const req = new NextRequest('http://localhost:3000/api/logs', {
        method: 'POST',
        body: JSON.stringify({ message: 'Only message provided' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.entry.module).toBe('client');
      expect(json.entry.level).toBe('INFO');
    });

    it('ingests a single client log with only module (defaults message and level)', async () => {
      const req = new NextRequest('http://localhost:3000/api/logs', {
        method: 'POST',
        body: JSON.stringify({ module: 'my-custom-module' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.entry.module).toBe('my-custom-module');
      expect(json.entry.message).toBe('');
    });

    it('ingests batch logs array successfully with minimal and full items', async () => {
      const payload = {
        logs: [
          {},
          { level: 'DEBUG', module: 'ui/tab', message: 'Tab switched to BOQ', data: { tab: 'boq' } },
        ],
      };

      const req = new NextRequest('http://localhost:3000/api/logs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBe(2);
    });

    it('returns 400 when both message and module are missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/logs', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Module or message is required');
    });

    it('handles unexpected errors during POST and returns 500', async () => {
      jest.spyOn(logger, 'ingest').mockImplementationOnce(() => {
        throw new Error('Ingestion failure');
      });

      const req = new NextRequest('http://localhost:3000/api/logs', {
        method: 'POST',
        body: JSON.stringify({ module: 'test', message: 'crash' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Ingestion failure');
    });

    it('handles unexpected non-Error throws in POST', async () => {
      jest.spyOn(logger, 'ingest').mockImplementationOnce(() => {
        throw 'Raw string failure';
      });

      const req = new NextRequest('http://localhost:3000/api/logs', {
        method: 'POST',
        body: JSON.stringify({ module: 'test', message: 'crash' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json.error).toBe('Failed to ingest log entry');
    });
  });
});
