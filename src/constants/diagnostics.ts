/**
 * Log Diagnostics & Auto-Resolution Constants
 * ProcureTrack / ProcApex Enterprise Platform
 */

export const BUG_CATEGORIES = {
  TYPE_ERROR: 'TYPE_ERROR',
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  GRAPHQL_ERROR: 'GRAPHQL_ERROR',
  CRYPTO_ERROR: 'CRYPTO_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const;

export const COMMON_ERROR_PATTERNS = [
  {
    category: BUG_CATEGORIES.TYPE_ERROR,
    pattern: /(TypeError|Cannot read propert|is not a function|undefined is not)/i,
    autoResolvable: false,
    resolutionKey: 'CHECK_TYPE_CONTRACTS',
  },
  {
    category: BUG_CATEGORIES.SYNTAX_ERROR,
    pattern: /(SyntaxError|Unexpected token|JSON\.parse|Corrupted JSON)/i,
    autoResolvable: false,
    resolutionKey: 'FIX_SYNTAX_PARSER',
  },
  {
    category: BUG_CATEGORIES.DATABASE_ERROR,
    pattern: /(PrismaClient|Query failed|Unique constraint|Foreign key constraint|P2002|P2025|slow query)/i,
    autoResolvable: true,
    resolutionKey: 'CLEAR_DATABASE_CACHE_AND_VALIDATE_SCHEMA',
  },
  {
    category: BUG_CATEGORIES.GRAPHQL_ERROR,
    pattern: /(GraphQL error|Syntax Error: Expected|Cannot query field|Variable \$.* was not provided|QUERY_TOO_COMPLEX)/i,
    autoResolvable: false,
    resolutionKey: 'ALIGN_GRAPHQL_SCHEMA',
  },
  {
    category: BUG_CATEGORIES.CRYPTO_ERROR,
    pattern: /(Decryption failed|corrupted ciphertext|auth tag mismatch|Unsupported AES algorithm|bad decrypt)/i,
    autoResolvable: true,
    resolutionKey: 'VERIFY_ENCRYPTION_SECRETS_AND_SALT',
  },
  {
    category: BUG_CATEGORIES.NETWORK_ERROR,
    pattern: /(ECONNREFUSED|ENOTFOUND|ETIMEDOUT|Network offline|fetch failed)/i,
    autoResolvable: true,
    resolutionKey: 'RETRY_OR_FALLBACK_CACHE',
  },
  {
    category: BUG_CATEGORIES.VALIDATION_ERROR,
    pattern: /(ValidationError|validation failed|Invalid input|Must provide a valid)/i,
    autoResolvable: false,
    resolutionKey: 'SANITIZE_REQUEST_PAYLOAD',
  },
] as const;

export const DEFAULT_LOG_ANALYZER_CONFIG = {
  errorLogPath: 'logs/error.log',
  appLogPath: 'logs/app.log',
  maxLogLinesToScan: 1000,
  maxStackFrames: 10,
  dedupWindowMs: 3600000, // 1 hour
} as const;

export const RESOLUTION_STRATEGIES = {
  CLEAR_DATABASE_CACHE_AND_VALIDATE_SCHEMA:
    'Flush stale database query cache and re-validate Prisma models.',
  VERIFY_ENCRYPTION_SECRETS_AND_SALT:
    'Check ENCRYPTION_SECRET configuration and verify ciphertext integrity.',
  RETRY_OR_FALLBACK_CACHE:
    'Activate offline query fallback and retry transient connection.',
  CHECK_TYPE_CONTRACTS:
    'Inspect stack trace frame, verify null checks, and run typecheck.',
  FIX_SYNTAX_PARSER:
    'Validate JSON payload format and sanitize corrupted stream.',
  ALIGN_GRAPHQL_SCHEMA:
    'Inspect GraphQL SDL schema and resolver contracts for mismatch.',
  SANITIZE_REQUEST_PAYLOAD:
    'Validate request parameters against API bounds and required fields.',
  MANUAL_INSPECTION:
    'Manual inspection required: review stack trace and culprit file line.',
} as const;
