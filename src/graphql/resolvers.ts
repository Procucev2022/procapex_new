import {
  TENANTS,
  INITIAL_PRS,
  INITIAL_QUOTES,
  MASTER_VENDORS,
  STANDARD_MASTER_RATE_CARDS,
  INITIAL_PPOS,
  INITIAL_POS,
  INITIAL_AUDIT_LOGS,
  CACHE_TAGS,
} from '@/constants';
import {
  PurchaseRequest,
  PPOItem,
  PurchaseOrder,
  TenantConfig,
  TenantKey,
  ClearCacheInput,
} from '@/types';
import { dbCache } from '@/lib/db-cache';
import { dbAuditor } from '@/lib/db-auditor';
import { logger } from '@/lib/logger';

// In-memory runtime state for mutations
let purchaseRequestsState: PurchaseRequest[] = [...INITIAL_PRS];
let pposState: PPOItem[] = [...INITIAL_PPOS];
let posState: PurchaseOrder[] = [...INITIAL_POS];

export const resolvers = {
  // Query: All Tenants
  tenants: async () => {
    return dbAuditor.auditAsync('Tenant', 'FIND_MANY', 'graphql.query.tenants', async () => {
      const { data } = await dbCache.wrap(
        'graphql:tenants:all',
        async () => {
          return Object.keys(TENANTS).map((k) => {
            const t = TENANTS[k as TenantKey];
            const users = Object.entries(t.team).map(([role, u]) => ({
              role,
              name: u.name,
              title: u.title,
            }));
            return {
              id: t.id,
              key: k,
              name: t.name,
              short: t.short,
              project: t.project,
              vendor: t.vendor,
              users,
            };
          });
        },
        [CACHE_TAGS.TENANTS]
      );
      return data;
    });
  },

  // Query: Single Tenant
  tenant: async ({ id, key }: { id?: string; key?: string }) => {
    return dbAuditor.auditAsync('Tenant', 'FIND_UNIQUE', `graphql.query.tenant(${id || key})`, async () => {
      const cacheKey = `graphql:tenant:${id || key}`;
      const { data } = await dbCache.wrap(
        cacheKey,
        async () => {
          const tenantKey = (key ||
            Object.keys(TENANTS).find((k) => TENANTS[k as TenantKey].id === id)) as TenantKey | undefined;

          if (!tenantKey || !TENANTS[tenantKey]) return null;
          const t = TENANTS[tenantKey];
          return {
            id: t.id,
            key: tenantKey,
            name: t.name,
            short: t.short,
            project: t.project,
            vendor: t.vendor,
            users: Object.entries(t.team).map(([role, u]) => ({
              role,
              name: u.name,
              title: u.title,
            })),
          };
        },
        [CACHE_TAGS.TENANTS]
      );
      return data;
    });
  },

  // Query: Purchase Requests (with filtering & caching)
  purchaseRequests: async ({
    tenantId,
    status,
    limit,
  }: {
    tenantId?: string;
    status?: string;
    limit?: number;
  }) => {
    const signature = `graphql.query.purchaseRequests(${status || 'all'},${limit || 50})`;
    return dbAuditor.auditAsync('PurchaseRequest', 'FIND_MANY', signature, async () => {
      const cacheKey = `graphql:prs:${tenantId || 'all'}:${status || 'all'}:${limit || 50}`;
      const { data } = await dbCache.wrap(
        cacheKey,
        async () => {
          let results = purchaseRequestsState;
          if (status) {
            results = results.filter((pr) => pr.status.toLowerCase() === status.toLowerCase());
          }
          if (tenantId) {
            results = results.filter((pr) => pr.tenantId === tenantId);
          }
          if (limit && limit > 0) {
            results = results.slice(0, limit);
          }
          return results.map((pr) => ({
            ...pr,
            quotes: INITIAL_QUOTES[pr.id] || [],
          }));
        },
        [CACHE_TAGS.PURCHASE_REQUESTS]
      );
      return data;
    });
  },

  // Query: Single Purchase Request
  purchaseRequest: async ({ id }: { id: string }) => {
    return dbAuditor.auditAsync('PurchaseRequest', 'FIND_UNIQUE', `graphql.query.purchaseRequest(${id})`, async () => {
      const { data } = await dbCache.wrap(
        `graphql:pr:${id}`,
        async () => {
          const pr = purchaseRequestsState.find((p) => p.id === id);
          if (!pr) return null;
          return {
            ...pr,
            quotes: INITIAL_QUOTES[pr.id] || [],
          };
        },
        [CACHE_TAGS.PURCHASE_REQUESTS]
      );
      return data;
    });
  },

  // Query: Vendors
  vendors: async ({ category, isRateCard }: { category?: string; isRateCard?: boolean }) => {
    return dbAuditor.auditAsync('Vendor', 'FIND_MANY', 'graphql.query.vendors', async () => {
      const cacheKey = `graphql:vendors:${category || 'all'}:${isRateCard ?? 'all'}`;
      const { data } = await dbCache.wrap(
        cacheKey,
        async () => {
          let list = MASTER_VENDORS;
          if (category) {
            list = list.filter((v) => v.category.toUpperCase() === category.toUpperCase());
          }
          if (isRateCard !== undefined) {
            list = list.filter((v) => v.isRateCard === isRateCard);
          }
          return list;
        },
        [CACHE_TAGS.VENDORS]
      );
      return data;
    });
  },

  // Query: Master Rate Cards
  masterRateCards: async ({ category, region }: { category?: string; region?: string }) => {
    return dbAuditor.auditAsync('MasterRateCard', 'FIND_MANY', 'graphql.query.masterRateCards', async () => {
      const cacheKey = `graphql:masters:${category || 'all'}:${region || 'all'}`;
      const { data } = await dbCache.wrap(
        cacheKey,
        async () => {
          let list = STANDARD_MASTER_RATE_CARDS;
          if (category) {
            list = list.filter((m) => m.cat.toLowerCase().includes(category.toLowerCase()));
          }
          if (region) {
            list = list.filter((m) => m.region.toLowerCase().includes(region.toLowerCase()));
          }
          return list;
        },
        [CACHE_TAGS.MASTERS]
      );
      return data;
    });
  },

  // Query: PPOs
  ppos: async ({ status }: { status?: string }) => {
    return dbAuditor.auditAsync('PPO', 'FIND_MANY', 'graphql.query.ppos', async () => {
      const cacheKey = `graphql:ppos:${status || 'all'}`;
      const { data } = await dbCache.wrap(
        cacheKey,
        async () => {
          if (!status) return pposState;
          return pposState.filter((p) => p.status.toLowerCase() === status.toLowerCase());
        },
        [CACHE_TAGS.PPOS]
      );
      return data;
    });
  },

  // Query: POs
  pos: async ({ status }: { status?: string }) => {
    return dbAuditor.auditAsync('PO', 'FIND_MANY', 'graphql.query.pos', async () => {
      const cacheKey = `graphql:pos:${status || 'all'}`;
      const { data } = await dbCache.wrap(
        cacheKey,
        async () => {
          if (!status) return posState;
          return posState.filter((p) => p.status.toLowerCase() === status.toLowerCase());
        },
        [CACHE_TAGS.POS]
      );
      return data;
    });
  },

  // Query: Audit Logs
  auditLogs: async ({ limit }: { limit?: number }) => {
    return dbAuditor.auditAsync('AuditLog', 'FIND_MANY', 'graphql.query.auditLogs', async () => {
      const count = limit && limit > 0 ? limit : 20;
      return INITIAL_AUDIT_LOGS.slice(0, count);
    });
  },

  // Query: Database Performance & Compute Optimization Metrics
  databaseAuditMetrics: async () => {
    return dbAuditor.getMetrics();
  },

  // Mutation: Create Purchase Request (invalidates PR cache)
  createPurchaseRequest: async ({ input }: { input: any }) => {
    return dbAuditor.auditAsync('PurchaseRequest', 'CREATE', 'graphql.mutation.createPurchaseRequest', async () => {
      const id = `PR-2026-${String(purchaseRequestsState.length + 10).padStart(4, '0')}`;
      const newPR: PurchaseRequest = {
        id,
        title: input.title,
        projectName: input.projectName,
        costCentre: input.costCentre,
        category: input.category,
        requester: input.requester,
        reqDate: input.reqDate || new Date().toISOString().split('T')[0],
        status: 'SUBMITTED',
        remarks: input.remarks || '',
        items: input.items || [],
      };

      purchaseRequestsState = [newPR, ...purchaseRequestsState];
      // Invalidate PR cache to avoid stale read compute
      dbCache.invalidateByTag(CACHE_TAGS.PURCHASE_REQUESTS);

      logger.info('graphql/resolvers', `Created new PR via GraphQL: ${id}`, {
        prId: id,
        title: newPR.title,
      });

      return {
        ...newPR,
        quotes: [],
      };
    });
  },

  // Mutation: Approve Purchase Request
  approvePurchaseRequest: async ({ id }: { id: string }) => {
    return dbAuditor.auditAsync('PurchaseRequest', 'UPDATE', `graphql.mutation.approvePurchaseRequest(${id})`, async () => {
      const pr = purchaseRequestsState.find((p) => p.id === id);
      if (!pr) return null;

      pr.status = 'APPROVED_BY_PROJECT_HEAD';
      dbCache.invalidateByTag(CACHE_TAGS.PURCHASE_REQUESTS);

      logger.info('graphql/resolvers', `Approved PR via GraphQL: ${id}`, { prId: id });
      return {
        ...pr,
        quotes: INITIAL_QUOTES[id] || [],
      };
    });
  },

  // Mutation: Create PPO (invalidates PPO cache)
  createPPO: async ({ input }: { input: any }) => {
    return dbAuditor.auditAsync('PPO', 'CREATE', 'graphql.mutation.createPPO', async () => {
      const id = `PPO-2026-${String(pposState.length + 20).padStart(4, '0')}`;
      const totalVal = input.unitRate * input.qty;
      const taxAmount = (totalVal * input.taxRate) / 100;
      const grandTotal = totalVal + taxAmount;

      const newPPO: PPOItem = {
        id,
        prId: input.prId,
        vendor: input.vendor,
        itemDesc: input.itemDesc,
        unitRate: input.unitRate,
        qty: input.qty,
        totalVal,
        taxRate: input.taxRate,
        taxAmount,
        grandTotal,
        paymentTerms: input.paymentTerms,
        leadTime: input.leadTime,
        status: 'TIER_1_PENDING',
        createdDate: new Date().toISOString().split('T')[0],
      };

      pposState = [newPPO, ...pposState];
      dbCache.invalidateByTag(CACHE_TAGS.PPOS);

      return newPPO;
    });
  },

  // Mutation: Release PO
  releasePO: async ({ ppoId }: { ppoId: string }) => {
    return dbAuditor.auditAsync('PO', 'CREATE', `graphql.mutation.releasePO(${ppoId})`, async () => {
      const ppo = pposState.find((p) => p.id === ppoId);
      const id = `PO-2026-${String(posState.length + 100).padStart(4, '0')}`;

      const newPO: PurchaseOrder = {
        id,
        ppoRef: ppoId,
        prRef: ppo?.prId || 'PR-2026-0005',
        vendor: ppo?.vendor || 'Vendor',
        amount: ppo?.grandTotal || 100000,
        issueDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'ISSUED',
      };

      posState = [newPO, ...posState];
      if (ppo) {
        ppo.status = 'APPROVED_PO_ISSUED';
      }

      dbCache.invalidateByTag(CACHE_TAGS.POS);
      dbCache.invalidateByTag(CACHE_TAGS.PPOS);

      return newPO;
    });
  },

  // Mutation: Clear Database Cache
  clearDatabaseCache: async ({ tag }: ClearCacheInput) => {
    if (tag) {
      dbCache.invalidateByTag(tag);
      return true;
    }
    dbCache.invalidateAll();
    return true;
  },
};
