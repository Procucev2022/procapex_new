import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ||
  (() => {
    logger.info('lib/prisma', 'Initializing Prisma ORM Client', {
      nodeEnv: process.env.NODE_ENV,
      databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
    });
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  })();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

