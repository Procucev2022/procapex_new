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

  describe('Prisma Query Audit Middleware', () => {
    it('should audit query execution with model and action', async () => {
      const { prismaQueryAuditMiddleware } = await import('@/lib/prisma');
      const next = jest.fn().mockResolvedValue([{ id: '1' }]);

      const result = await prismaQueryAuditMiddleware(
        { model: 'Tenant', action: 'findMany' },
        next
      );

      expect(result).toEqual([{ id: '1' }]);
      expect(next).toHaveBeenCalledWith({ model: 'Tenant', action: 'findMany' });
    });

    it('should audit raw queries when model and action are omitted', async () => {
      const { prismaQueryAuditMiddleware } = await import('@/lib/prisma');
      const next = jest.fn().mockResolvedValue('ok');

      const result = await prismaQueryAuditMiddleware({}, next);
      expect(result).toBe('ok');
    });

    it('should create PrismaClient instance using createPrismaClient', async () => {
      const { createPrismaClient } = await import('@/lib/prisma');
      const client = createPrismaClient();
      expect(client).toBeDefined();
    });
  });
});
