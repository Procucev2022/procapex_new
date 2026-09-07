export const GRAPHQL_COMPLEXITY_LIMITS = {
  maxDepth: 6,
  maxQueryLength: 5000,
  defaultPageLimit: 50,
  maxPageLimit: 100,
} as const;

export const GRAPHQL_ERROR_CODES = {
  BAD_USER_INPUT: 'BAD_USER_INPUT',
  QUERY_TOO_COMPLEX: 'QUERY_TOO_COMPLEX',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
} as const;

export const DEFAULT_GRAPHQL_INTROSPECTION_QUERY = `
  query GetAppOverview {
    tenants {
      id
      name
      project
    }
    databaseAuditMetrics {
      totalQueries
      slowQueriesCount
      efficiencyScore
      estimatedComputeHoursSaved
    }
  }
`;
