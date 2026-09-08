export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, unknown>;
  correlationId?: string;
  environment: 'server' | 'browser';
}

export interface LogFilterOptions {
  level?: LogLevel;
  module?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  correlationId?: string;
  limit?: number;
  offset?: number;
}

export interface LoggerConfig {
  minLevel?: LogLevel;
  maxMemoryLogs?: number;
  logDir?: string;
  maxFileSize?: number; // In bytes (default 5MB)
  maxRotatedFiles?: number; // Default 5
  retentionDays?: number; // Default 7 days
  isServer?: boolean;
}
