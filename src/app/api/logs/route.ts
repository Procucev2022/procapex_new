import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { LogLevel } from '@/types';
import { DEFAULT_LOG_RETENTION_DAYS } from '@/constants';
import { analyzeLogFiles, autoResolveBugs } from '@/lib/log-analyzer';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // Action: Automated Log Error Diagnostics
    if (action === 'diagnose') {
      const report = analyzeLogFiles();
      return NextResponse.json({
        success: true,
        action: 'diagnose',
        report,
      });
    }

    // Action: Automated Log Error Resolution
    if (action === 'auto-resolve') {
      const report = analyzeLogFiles();
      const resolution = autoResolveBugs(report.diagnosedBugs);
      return NextResponse.json({
        success: true,
        action: 'auto-resolve',
        report,
        resolution,
      });
    }

    // Action: Purge expired logs for compliance & storage management
    if (action === 'purge') {
      const days = parseInt(searchParams.get('retentionDays') || String(DEFAULT_LOG_RETENTION_DAYS), 10);
      const purgeResult = logger.purgeExpiredLogs(isNaN(days) ? DEFAULT_LOG_RETENTION_DAYS : days);
      logger.info('api/logs', 'Log purge operation executed', {
        retentionDays: days,
        ...purgeResult,
      });

      return NextResponse.json({
        success: true,
        action: 'purge',
        retentionDays: isNaN(days) ? 7 : days,
        ...purgeResult,
      });
    }

    // Action: Search and filter logs
    const level = searchParams.get('level') as LogLevel | null;
    const moduleName = searchParams.get('module') || undefined;
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const correlationId = searchParams.get('correlationId') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 500);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

    const result = logger.searchLogs({
      level: level || undefined,
      module: moduleName,
      search,
      startDate,
      endDate,
      correlationId,
      limit: isNaN(limit) ? 50 : limit,
      offset: isNaN(offset) ? 0 : offset,
    });

    return NextResponse.json({
      success: true,
      total: result.total,
      limit: isNaN(limit) ? 50 : limit,
      offset: isNaN(offset) ? 0 : offset,
      logs: result.logs,
    });
  } catch (error: any) {
    logger.error('api/logs', 'Failed to retrieve or purge logs', { error: error?.message });
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process logs request' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (Array.isArray(body.logs)) {
      const ingested = body.logs.map((entry: any) =>
        logger.ingest({
          level: entry.level || 'INFO',
          module: entry.module || 'client',
          message: entry.message || '',
          data: entry.data,
          correlationId: entry.correlationId,
          environment: 'browser',
        })
      );
      return NextResponse.json({ success: true, count: ingested.length });
    }

    if (!body.message && !body.module) {
      return NextResponse.json(
        { success: false, error: 'Module or message is required' },
        { status: 400 }
      );
    }

    const entry = logger.ingest({
      level: body.level || 'INFO',
      module: body.module || 'client',
      message: body.message || '',
      data: body.data,
      correlationId: body.correlationId,
      environment: 'browser',
    });

    return NextResponse.json({ success: true, count: 1, entry });
  } catch (error: any) {
    logger.error('api/logs', 'Failed to ingest client logs', { error: error?.message });
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to ingest log entry' },
      { status: 500 }
    );
  }
}
