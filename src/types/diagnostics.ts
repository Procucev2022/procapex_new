/**
 * Log Diagnostics & Auto-Resolution Types
 * ProcureTrack / ProcApex Enterprise Platform
 */

import { BUG_CATEGORIES } from '@/constants/diagnostics';

export type BugCategory = (typeof BUG_CATEGORIES)[keyof typeof BUG_CATEGORIES];

export interface StackTraceFrame {
  file: string;
  line: number;
  column?: number;
  functionName?: string;
  raw: string;
}

export interface ParsedLogLine {
  timestamp: string;
  level: string;
  module: string;
  message: string;
  correlationId?: string;
  data?: any;
  stack?: string;
  raw: string;
}

export interface DiagnosedBug {
  id: string;
  signature: string;
  category: BugCategory;
  message: string;
  culpritFile?: string;
  culpritLine?: number;
  stackFrames: StackTraceFrame[];
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  correlationIds: string[];
  resolutionStrategy: string;
  autoResolvable: boolean;
}

export interface LogAnalysisReport {
  scannedFiles: string[];
  totalLinesScanned: number;
  errorCount: number;
  warningCount: number;
  uniqueBugsCount: number;
  diagnosedBugs: DiagnosedBug[];
  timestamp: string;
  healthScore: number;
}

export interface AutoResolutionAction {
  bugId: string;
  category: BugCategory;
  actionTaken: string;
  success: boolean;
  details?: any;
}

export interface AutoResolutionResult {
  attemptedCount: number;
  resolvedCount: number;
  failedCount: number;
  actions: AutoResolutionAction[];
  timestamp: string;
}
