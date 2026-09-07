import { GraphQLResponse } from '@/types';
import { logger } from './logger';

export async function executeGraphQL<TData = any, TVariables = Record<string, unknown>>(
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
  } catch (error: any) {
    logger.error('lib/graphql-client', 'Failed to execute GraphQL query', {
      operationName,
      error: error?.message,
    });
    return {
      errors: [{ message: error?.message || 'Network error executing GraphQL query' }],
    };
  }
}
