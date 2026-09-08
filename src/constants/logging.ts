import type { LogLevel } from '@/types';

export const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
};

export const DEFAULT_LOG_RETENTION_DAYS = 7;
export const MAX_LOG_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_ROTATED_FILES = 5;
export const MAX_IN_MEMORY_LOGS = 1000;
