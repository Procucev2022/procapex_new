import type { GraphQLResponse } from '@/types';
import { logger } from './logger';

export async function executeGraphQL<TData = unknown, TVariables = Record<string, unknown>>(
  query: string,
  variables?: TVariables,
  operationName?: string
): Promise<GraphQLResponse<TData>> {
  try {
    const res = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
        operationName,
      }),
    });

    const json = (await res.json()) as GraphQLResponse<TData>;
    if (json.errors && json.errors.length > 0) {
      logger.warn('lib/graphql-client', 'GraphQL query returned errors', {
        operationName,
        errors: json.errors.map((e) => e.message),
      });
    }

    return json;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Network error executing GraphQL query';
    logger.error('lib/graphql-client', 'Failed to execute GraphQL query', {
      operationName,
      error: errorMessage,
    });
    return {
      errors: [{ message: errorMessage }],
    };
  }
}
