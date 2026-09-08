import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { dbAuditor } from './db-auditor';
import type { DatabaseOperation } from '@/types';

export async function prismaQueryAuditMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<unknown>
): Promise<unknown> {
  const before = Date.now();
  const result = await next(params);
  const durationMs = Date.now() - before;

  dbAuditor.recordQuery({
    model: params.model || 'PrismaQuery',
    operation: params.action ? (params.action.toUpperCase() as DatabaseOperation) : 'RAW',
    querySignature: `${params.model || 'db'}.${params.action || 'execute'}`,
    durationMs,
    isCached: false,
    computeCostUnits: Math.max(1, Math.round(durationMs / 5)),
  });

  return result;
}

export function createPrismaClient(): PrismaClient {
  logger.info('lib/prisma', 'Initializing Prisma ORM Client with Query Auditing', {
    nodeEnv: process.env.NODE_ENV,
    databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
  });

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  client.$use(prismaQueryAuditMiddleware);
  return client;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


