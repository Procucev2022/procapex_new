/**
 * Structured & Centralized Logging System for ProCPX Procurement System
 * 
 * Features:
 *  - Isomorphic: works across Node.js server, Next.js API routes, and browser UI
 *  - Structured schema: timestamp, level, module, message, metadata, correlationId
 *  - Local file system persistence: writes structured logs to logs/app.log and logs/error.log
 *  - In-memory ring buffer: fast query, search, and audit inspection (up to 1,000 entries)
 *  - Automatic file rotation: rotates logs once max file size is reached
 *  - Automatic purging: purges expired logs based on retention compliance (default 7 days)
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, any>;
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

const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
};

/**
 * Safely serialize any object handling circular references and Error instances
 */
export function safeSerialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Error) {
    return {
      name: obj.name,
      message: obj.message,
      stack: obj.stack,
      ...(obj as any),
    };
  }
  if (typeof obj === 'bigint') return obj.toString();
  if (typeof obj !== 'object') return obj;

  const seen = new WeakSet();
  const serialize = (item: any): any => {
    if (item === null || typeof item !== 'object') {
      if (typeof item === 'bigint') return item.toString();
      return item;
    }
    if (seen.has(item)) return '[Circular]';
    seen.add(item);

    if (item instanceof Error) {
      return {
        name: item.name,
        message: item.message,
        stack: item.stack,
        ...(item as any),
      };
    }
    if (Array.isArray(item)) {
      return item.map(serialize);
    }
    const result: Record<string, any> = {};
    for (const key of Object.keys(item)) {
      result[key] = serialize(item[key]);
    }
    return result;
  };

  return serialize(obj);
}

export class CentralizedLogger {
  private inMemoryLogs: LogEntry[] = [];
  private maxMemoryLogs: number;
  private minLevel: LogLevel;
  private logDir: string;
  private maxFileSize: number;
  private maxRotatedFiles: number;
  private retentionDays: number;
  private isServer: boolean;
  private fs: typeof import('fs') | null = null;
  private path: typeof import('path') | null = null;

  constructor(config: LoggerConfig = {}) {
    this.minLevel = config.minLevel || (process.env.LOG_LEVEL as LogLevel) || 'DEBUG';
    this.maxMemoryLogs = config.maxMemoryLogs || 1000;
    this.maxFileSize = config.maxFileSize || 5 * 1024 * 1024; // 5 MB
    this.maxRotatedFiles = config.maxRotatedFiles || 5;
    this.retentionDays = config.retentionDays || (parseInt(process.env.LOG_RETENTION_DAYS || '7', 10) || 7);
    this.isServer = config.isServer !== undefined ? config.isServer : typeof window === 'undefined';

    if (this.isServer) {
      try {
        // Dynamically require Node built-ins only on server
        const fsLib = require('fs');
        const pathLib = require('path');
        this.fs = fsLib;
        this.path = pathLib;
        const cwd = process.cwd();
        this.logDir = config.logDir || process.env.LOG_DIR || pathLib.resolve(cwd, 'logs');
        this.ensureLogDir();
      } catch {
        this.logDir = './logs';
      }
    } else {
      this.logDir = './logs';
    }
  }

  private ensureLogDir() {
    if (this.isServer && this.fs && this.logDir) {
      try {
        if (!this.fs.existsSync(this.logDir)) {
          this.fs.mkdirSync(this.logDir, { recursive: true });
        }
      } catch (err) {
        // Fallback silently if filesystem cannot be created
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_SEVERITY[level] >= LOG_LEVEL_SEVERITY[this.minLevel];
  }

  /**
   * Rotate a log file if it exceeds maxFileSize
   */
  private rotateLogFile(filePath: string) {
    if (!this.isServer || !this.fs || !this.path) return;
    try {
      if (!this.fs.existsSync(filePath)) return;
      const stats = this.fs.statSync(filePath);
      if (stats.size < this.maxFileSize) return;

      // Rotate existing rotated files
      for (let i = this.maxRotatedFiles - 1; i >= 1; i--) {
        const oldFile = `${filePath}.${i}`;
        const newFile = `${filePath}.${i + 1}`;
        if (this.fs.existsSync(oldFile)) {
          if (i === this.maxRotatedFiles - 1 && this.fs.existsSync(newFile)) {
            this.fs.unlinkSync(newFile);
          }
          this.fs.renameSync(oldFile, newFile);
        }
      }
      this.fs.renameSync(filePath, `${filePath}.1`);
    } catch (err) {
      // Rotation failed gracefully
    }
  }

  /**
   * Persist a log entry to the local filesystem (when running on Node.js/server)
   */
  private writeToFile(entry: LogEntry) {
    if (!this.isServer || !this.fs || !this.path) return;

    try {
      this.ensureLogDir();
      const combinedPath = this.path.join(this.logDir, 'app.log');
      this.rotateLogFile(combinedPath);

      const jsonLine = JSON.stringify(entry) + '\n';
      this.fs.appendFileSync(combinedPath, jsonLine, 'utf8');

      // Also append to error.log if level is ERROR
      if (entry.level === 'ERROR') {
        const errorPath = this.path.join(this.logDir, 'error.log');
        this.rotateLogFile(errorPath);
        this.fs.appendFileSync(errorPath, jsonLine, 'utf8');
      }
    } catch (err) {
      // Ignore disk write errors to prevent breaking app operations
    }
  }

  /**
   * Purge log files older than the retention threshold
   */
  public purgeExpiredLogs(retentionDays = this.retentionDays): { purgedFiles: string[]; purgedMemoryCount: number } {
    const purgedFiles: string[] = [];
    let purgedMemoryCount = 0;

    const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

    // Purge in-memory entries
    const initialMemoryCount = this.inMemoryLogs.length;
    this.inMemoryLogs = this.inMemoryLogs.filter(entry => {
      const entryTime = new Date(entry.timestamp).getTime();
      return entryTime >= cutoffTime;
    });
    purgedMemoryCount = initialMemoryCount - this.inMemoryLogs.length;

    // Purge filesystem logs
    if (this.isServer && this.fs && this.path && this.fs.existsSync(this.logDir)) {
      try {
        const files = this.fs.readdirSync(this.logDir);
        for (const file of files) {
          const filePath = this.path.join(this.logDir, file);
          const stats = this.fs.statSync(filePath);
          if (stats.isFile() && stats.mtimeMs < cutoffTime) {
            this.fs.unlinkSync(filePath);
            purgedFiles.push(file);
          }
        }
      } catch (err) {
        // Ignore purging errors
      }
    }

    return { purgedFiles, purgedMemoryCount };
  }

  /**
   * Core logging mechanism
   */
  public log(level: LogLevel, module: string, message: string, data?: Record<string, any>, correlationId?: string): LogEntry {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data: data ? safeSerialize(data) : undefined,
      correlationId,
      environment: this.isServer ? 'server' : 'browser',
    };

    if (this.shouldLog(level)) {
      // Add to in-memory ring buffer
      this.inMemoryLogs.unshift(entry);
      if (this.inMemoryLogs.length > this.maxMemoryLogs) {
        this.inMemoryLogs.pop();
      }

      // Persist to local filesystem on server
      if (this.isServer) {
        this.writeToFile(entry);
      }

      // Format console output
      const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.module}]${entry.correlationId ? ` [${entry.correlationId}]` : ''}:`;
      if (level === 'ERROR') {
        console.error(prefix, entry.message, entry.data || '');
      } else if (level === 'WARN') {
        console.warn(prefix, entry.message, entry.data || '');
      } else if (level === 'DEBUG') {
        console.debug(prefix, entry.message, entry.data || '');
      } else {
        console.log(prefix, entry.message, entry.data || '');
      }
    }

    return entry;
  }

  public debug(module: string, message: string, data?: Record<string, any>, correlationId?: string): LogEntry {
    return this.log('DEBUG', module, message, data, correlationId);
  }

  public info(module: string, message: string, data?: Record<string, any>, correlationId?: string): LogEntry {
    return this.log('INFO', module, message, data, correlationId);
  }

  public warn(module: string, message: string, data?: Record<string, any>, correlationId?: string): LogEntry {
    return this.log('WARN', module, message, data, correlationId);
  }

  public error(module: string, message: string, data?: Record<string, any>, correlationId?: string): LogEntry {
    return this.log('ERROR', module, message, data, correlationId);
  }

  /**
   * Search and filter logs from memory and/or local files
   */
  public searchLogs(options: LogFilterOptions = {}): { logs: LogEntry[]; total: number } {
    let filtered = [...this.inMemoryLogs];

    if (options.level) {
      filtered = filtered.filter(l => l.level === options.level);
    }
    if (options.module) {
      const mod = options.module.toLowerCase();
      filtered = filtered.filter(l => l.module.toLowerCase().includes(mod));
    }
    if (options.correlationId) {
      filtered = filtered.filter(l => l.correlationId === options.correlationId);
    }
    if (options.startDate) {
      const start = new Date(options.startDate).getTime();
      filtered = filtered.filter(l => new Date(l.timestamp).getTime() >= start);
    }
    if (options.endDate) {
      const end = new Date(options.endDate).getTime();
      filtered = filtered.filter(l => new Date(l.timestamp).getTime() <= end);
    }
    if (options.search) {
      const term = options.search.toLowerCase();
      filtered = filtered.filter(l => {
        const inMsg = l.message.toLowerCase().includes(term);
        const inMod = l.module.toLowerCase().includes(term);
        const inData = l.data ? JSON.stringify(l.data).toLowerCase().includes(term) : false;
        return inMsg || inMod || inData;
      });
    }

    const total = filtered.length;
    const offset = options.offset || 0;
    const limit = options.limit || 100;
    const paginated = filtered.slice(offset, offset + limit);

    return { logs: paginated, total };
  }

  /**
   * Ingest logs (e.g. sent from client-side to server)
   */
  public ingest(entry: Partial<LogEntry> & { message?: string }): LogEntry {
    const fullEntry: LogEntry = {
      id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      level: entry.level || 'INFO',
      module: entry.module || 'client',
      message: entry.message || '',
      data: entry.data ? safeSerialize(entry.data) : undefined,
      correlationId: entry.correlationId,
      environment: entry.environment || (this.isServer ? 'server' : 'browser'),
    };

    this.inMemoryLogs.unshift(fullEntry);
    if (this.inMemoryLogs.length > this.maxMemoryLogs) {
      this.inMemoryLogs.pop();
    }

    if (this.isServer) {
      this.writeToFile(fullEntry);
    }

    return fullEntry;
  }

  /**
   * Reset in-memory log buffer (useful for test suites)
   */
  public clearLogs() {
    this.inMemoryLogs = [];
  }

  /**
   * Create a scoped child logger with default module and/or correlationId
   */
  public child(defaults: { module?: string; correlationId?: string }) {
    return {
      debug: (msg: string, data?: Record<string, any>, corrId?: string) =>
        this.debug(defaults.module || 'app', msg, data, corrId || defaults.correlationId),
      info: (msg: string, data?: Record<string, any>, corrId?: string) =>
        this.info(defaults.module || 'app', msg, data, corrId || defaults.correlationId),
      warn: (msg: string, data?: Record<string, any>, corrId?: string) =>
        this.warn(defaults.module || 'app', msg, data, corrId || defaults.correlationId),
      error: (msg: string, data?: Record<string, any>, corrId?: string) =>
        this.error(defaults.module || 'app', msg, data, corrId || defaults.correlationId),
    };
  }
}

// Global Singleton Instance
export const logger = new CentralizedLogger();
