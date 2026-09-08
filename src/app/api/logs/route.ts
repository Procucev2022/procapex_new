import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import type { LogLevel } from '@/types';
import { DEFAULT_LOG_RETENTION_DAYS, API_LOGS_QUERY_SCHEMA, API_LOGS_INGEST_SCHEMA } from '@/constants';
import { analyzeLogFiles, autoResolveBugs } from '@/lib/log-analyzer';
import { validateQueryParams, validateSchema } from '@/lib/validator';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const queryValidation = validateQueryParams(searchParams, API_LOGS_QUERY_SCHEMA);
    const validParams = queryValidation.data as Record<string, string | undefined>;
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process logs request';
    logger.error('api/logs', 'Failed to retrieve or purge logs', { error: errorMessage });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    if (Array.isArray(body.logs)) {
      const ingested = body.logs.map((entry: unknown) => {
        const itemVal = validateSchema(entry, API_LOGS_INGEST_SCHEMA);
        const data = itemVal.data as Record<string, unknown>;
        return logger.ingest({
          level: data.level as LogLevel | undefined,
          module: data.module as string | undefined,
          message: data.message as string | undefined,
          data: data.data as Record<string, unknown> | undefined,
          correlationId: data.correlationId as string | undefined,
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
    const entryData = validation.data as Record<string, unknown>;

    const entry = logger.ingest({
      level: entryData.level as LogLevel | undefined,
      module: entryData.module as string | undefined,
      message: entryData.message as string | undefined,
      data: entryData.data as Record<string, unknown> | undefined,
      correlationId: entryData.correlationId as string | undefined,
      environment: 'browser',
    });

    return NextResponse.json({ success: true, count: 1, entry });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to ingest log entry';
    logger.error('api/logs', 'Failed to ingest client logs', { error: errorMessage });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
