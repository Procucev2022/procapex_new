import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { graphql } from 'graphql';
import { schema } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { logger } from '@/lib/logger';
import { dbCache } from '@/lib/db-cache';
import { dbAuditor } from '@/lib/db-auditor';
import { validateSchema } from '@/lib/validator';
import {
  GRAPHQL_COMPLEXITY_LIMITS,
  GRAPHQL_ERROR_CODES,
  DEFAULT_GRAPHQL_INTROSPECTION_QUERY,
  API_GRAPHQL_SCHEMA,
} from '@/constants';
import type { GraphQLOperationPayload, GraphQLResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const correlationId = `gql-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const startTime = Date.now();

  try {
    const body = await req.json();
    const validation = validateSchema<GraphQLOperationPayload>(body, API_GRAPHQL_SCHEMA);

    if (!validation.isValid) {
      logger.warn('api/graphql', 'Rejected GraphQL request: missing or invalid query', {
        errors: validation.errors,
        correlationId,
      });
      return NextResponse.json(
        {
          errors: [
            {
              message: 'Must provide a valid GraphQL query string.',
              extensions: { code: GRAPHQL_ERROR_CODES.BAD_USER_INPUT, details: validation.errors },
            },
          ],
        },
        { status: 400 }
      );
    }

    const { query, variables, operationName } = validation.data;

    // Complexity & Security Guard: prevent excessively large queries
    if (query.length > GRAPHQL_COMPLEXITY_LIMITS.maxQueryLength) {
      logger.warn('api/graphql', 'Query exceeds maximum allowed payload length', {
        queryLength: query.length,
        maxLength: GRAPHQL_COMPLEXITY_LIMITS.maxQueryLength,
        correlationId,
      });
      return NextResponse.json(
        {
          errors: [
            {
              message: `Query payload length (${query.length}) exceeds maximum limit (${GRAPHQL_COMPLEXITY_LIMITS.maxQueryLength}).`,
              extensions: { code: GRAPHQL_ERROR_CODES.QUERY_TOO_COMPLEX },
            },
          ],
        },
        { status: 413 }
      );
    }

    logger.debug('api/graphql', `Executing GraphQL operation: ${operationName || 'Anonymous'}`, {
      operationName,
      variables,
      correlationId,
    });

    const contextValue = {
      correlationId,
      startTime,
      environment: process.env.NODE_ENV || 'development',
    };

    const result = await graphql({
      schema,
      source: query,
      rootValue: resolvers,
      variableValues: variables || undefined,
      contextValue,
      operationName: operationName || undefined,
    });

    const durationMs = Date.now() - startTime;
    const cacheStats = dbCache.getStats();

    // Audit GraphQL query execution
    dbAuditor.recordQuery({
      model: 'GraphQL',
      operation: 'GRAPHQL_QUERY',
      querySignature: operationName || query.slice(0, 40).replace(/\s+/g, ' '),
      durationMs,
      isCached: false,
      computeCostUnits: Math.max(1, Math.round(durationMs / 4)),
    });

    logger.info('api/graphql', `GraphQL operation finished in ${durationMs}ms`, {
      operationName,
      durationMs,
      hasErrors: Boolean(result.errors?.length),
      correlationId,
    });

    const responsePayload: GraphQLResponse = {
      data: result.data,
      errors: result.errors?.map((err) => ({
        message: err.message,
        locations: err.locations ? err.locations.map((loc) => ({ line: loc.line, column: loc.column })) : undefined,
        path: err.path ? [...err.path] : undefined,
      })),
      extensions: {
        durationMs,
        correlationId,
        computeHoursSaved: cacheStats.estimatedComputeHoursSaved,
      },
    };

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Internal GraphQL execution error';
    logger.error('api/graphql', 'Unhandled exception during GraphQL execution', {
      error: errorMessage,
      durationMs,
      correlationId,
    });

    return NextResponse.json(
      {
        errors: [
          {
            message: errorMessage,
            extensions: { code: GRAPHQL_ERROR_CODES.INTERNAL_SERVER_ERROR },
          },
        ],
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const correlationId = `gql-get-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || DEFAULT_GRAPHQL_INTROSPECTION_QUERY;

  const result = await graphql({
    schema,
    source: query,
    rootValue: resolvers,
    contextValue: { correlationId, startTime: Date.now() },
  });

  return NextResponse.json({
    status: 'GraphQL API Ready',
    schemaVersion: '1.0.0',
    metrics: dbAuditor.getMetrics(),
    sampleResult: result,
  });
}
