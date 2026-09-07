import { PrismaClient } from '@prisma/client';

describe('Prisma Client Singleton', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    (process.env as any).NODE_ENV = originalEnv;
  });

  it('should instantiate PrismaClient when global prisma is undefined in development', async () => {
    (process.env as any).NODE_ENV = 'development';
    const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
    delete globalForPrisma.prisma;
    jest.resetModules();

    const mod = await import('@/lib/prisma');
    expect(mod.prisma).toBeDefined();
    expect(globalForPrisma.prisma).toBe(mod.prisma);
  });

  it('should reuse existing global prisma when already defined', async () => {
    (process.env as any).NODE_ENV = 'development';
    const mockPrisma = new PrismaClient();
    const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
    globalForPrisma.prisma = mockPrisma;
    jest.resetModules();

    const mod = await import('@/lib/prisma');
    expect(mod.prisma).toBe(mockPrisma);
  });

  it('should not assign global prisma in production environment', async () => {
    (process.env as any).NODE_ENV = 'production';
    const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
    delete globalForPrisma.prisma;
    jest.resetModules();

    const mod = await import('@/lib/prisma');
    expect(mod.prisma).toBeDefined();
    expect(globalForPrisma.prisma).toBeUndefined();
  });
});
