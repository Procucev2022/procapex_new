import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { LogLevel } from '@/types';
import { DEFAULT_LOG_RETENTION_DAYS, API_LOGS_QUERY_SCHEMA, API_LOGS_INGEST_SCHEMA } from '@/constants';
import { analyzeLogFiles, autoResolveBugs } from '@/lib/log-analyzer';
import { validateQueryParams, validateSchema } from '@/lib/validator';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryValidation = validateQueryParams(searchParams, API_LOGS_QUERY_SCHEMA);
    const validParams = queryValidation.data;
    const action = validParams.action || searchParams.get('action');

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
      const rawDays = searchParams.get('retentionDays');
      const parsedDays = rawDays ? parseInt(rawDays, 10) : DEFAULT_LOG_RETENTION_DAYS;
      const days = isNaN(parsedDays) ? DEFAULT_LOG_RETENTION_DAYS : parsedDays;
      const purgeResult = logger.purgeExpiredLogs(days);
      logger.info('api/logs', 'Log purge operation executed', {
        retentionDays: days,
        ...purgeResult,
      });

      return NextResponse.json({
        success: true,
        action: 'purge',
        retentionDays: days,
        ...purgeResult,
      });
    }

    // Action: Search and filter logs
    const level = validParams.level as LogLevel | undefined;
    const moduleName = validParams.module;
    const search = validParams.search;
    const startDate = validParams.startDate;
    const endDate = validParams.endDate;
    const correlationId = validParams.correlationId;
    const rawLimit = searchParams.get('limit');
    const parsedLimit = rawLimit ? parseInt(rawLimit, 10) : 50;
    const limit = Math.min(isNaN(parsedLimit) ? 50 : parsedLimit, 500);
    const rawOffset = searchParams.get('offset');
    const parsedOffset = rawOffset ? parseInt(rawOffset, 10) : 0;
    const offset = Math.max(isNaN(parsedOffset) ? 0 : parsedOffset, 0);

    const result = logger.searchLogs({
      level: level || undefined,
      module: moduleName,
      search,
      startDate,
      endDate,
      correlationId,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      total: result.total,
      limit,
      offset,
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
      const ingested = body.logs.map((entry: any) => {
        const itemVal = validateSchema(entry, API_LOGS_INGEST_SCHEMA);
        const data = itemVal.data;
        return logger.ingest({
          level: data.level,
          module: data.module,
          message: data.message,
          data: data.data,
          correlationId: data.correlationId,
          environment: 'browser',
        });
      });
      return NextResponse.json({ success: true, count: ingested.length });
    }

    if (!body.message && !body.module) {
      return NextResponse.json(
        { success: false, error: 'Module or message is required' },
        { status: 400 }
      );
    }

    const validation = validateSchema(body, API_LOGS_INGEST_SCHEMA);
    const entryData = validation.data;

    const entry = logger.ingest({
      level: entryData.level,
      module: entryData.module,
      message: entryData.message,
      data: entryData.data,
      correlationId: entryData.correlationId,
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
