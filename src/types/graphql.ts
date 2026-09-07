export interface GraphQLRequestContext {
  correlationId: string;
  startTime: number;
  environment: string;
}

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, unknown>;
  }>;
  extensions?: {
    durationMs: number;
    correlationId: string;
    isCached?: boolean;
    computeHoursSaved?: number;
  };
}

export interface GraphQLOperationPayload {
  query: string;
  operationName?: string | null;
  variables?: Record<string, unknown> | null;
}

export interface ClearCacheInput {
  tag?: string;
  clearAll?: boolean;
}
