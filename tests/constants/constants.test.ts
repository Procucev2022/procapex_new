import {
  TENANTS,
  INITIAL_PRS,
  INITIAL_QUOTES,
  INITIAL_NEGO,
  INITIAL_PPOS,
  INITIAL_POS,
  INITIAL_AUDIT_LOGS,
  VENDOR_DATABASE,
  MASTER_VENDORS,
  INITIAL_VENDOR_QUOTE_ITEMS,
  DEFAULT_COUNTER_ITEMS,
  INITIAL_DOCS,
  DRAWING_NAME_CATALOG,
  INITIAL_PRS_DATA,
  COMMERCIAL_COUNTER_ITEMS,
  STANDARD_MASTER_RATE_CARDS,
  NAV_ITEMS,
  DEFAULT_GEMINI_MODEL,
  PRESET_ITEMS,
  DEFAULT_MLEO_RATIOS,
  DEFAULT_COST_INFLATORS,
  DEFAULT_NEGOTIATION_SCRIPTS,
  LOG_LEVEL_SEVERITY,
  DEFAULT_LOG_RETENTION_DAYS,
  MAX_LOG_FILE_SIZE_BYTES,
  MAX_ROTATED_FILES,
  MAX_IN_MEMORY_LOGS,
  DEFAULT_DB_OPTIMIZATION_CONFIG,
  CACHE_TAGS,
  DB_COMPUTE_METRICS,
  GRAPHQL_COMPLEXITY_LIMITS,
  GRAPHQL_ERROR_CODES,
  DEFAULT_GRAPHQL_INTROSPECTION_QUERY,
} from '@/constants';

import * as tenantsModule from '@/constants/tenants';
import * as procurementModule from '@/constants/procurement';
import * as vendorsModule from '@/constants/vendors';
import * as boqModule from '@/constants/boq';
import * as mastersModule from '@/constants/masters';
import * as navigationModule from '@/constants/navigation';
import * as aiModule from '@/constants/ai';
import * as loggingModule from '@/constants/logging';
import * as databaseModule from '@/constants/database';
import * as graphqlModule from '@/constants/graphql';
import * as indexModule from '@/constants/index';

describe('Constants Architecture & Integrity Test Suite', () => {
  describe('Tenants Constants', () => {
    it('should export all 4 enterprise tenant configurations with complete team rosters', () => {
      expect(tenantsModule.TENANTS).toBeDefined();
      expect(Object.keys(TENANTS)).toEqual(['TNT_LNT', 'TNT_TATA', 'TNT_GODREJ', 'TNT_SHAPOORJI']);

      const lnt = TENANTS.TNT_LNT;
      expect(lnt.id).toBe('TNT-LNT-001');
      expect(lnt.name).toContain('L&T');
      expect(lnt.project).toBeDefined();
      expect(lnt.short).toBe('LT');
      expect(lnt.vendor).toBeDefined();
      expect(lnt.team['PROJECT_TEAM']).toBeDefined();
      expect(lnt.team['PROJECT_HEAD_PR']).toBeDefined();
      expect(lnt.team['CATEGORY_MANAGER']).toBeDefined();
      expect(lnt.team['CATEGORY_MANAGER_2']).toBeDefined();
      expect(lnt.team['PROJECT_HEAD_PPO']).toBeDefined();
      expect(lnt.team['FINANCE_HEAD']).toBeDefined();
      expect(lnt.team['VENDOR']).toBeDefined();

      const tata = TENANTS.TNT_TATA;
      expect(tata.id).toBe('TNT-TATA-002');
      expect(tata.team['PROJECT_TEAM'].name).toContain('Siddharth');

      const godrej = TENANTS.TNT_GODREJ;
      expect(godrej.id).toBe('TNT-GODREJ-003');

      const shapoorji = TENANTS.TNT_SHAPOORJI;
      expect(shapoorji.id).toBe('TNT-SHAPOORJI-004');
    });
  });

  describe('Procurement Constants', () => {
    it('should export valid INITIAL_PRS with items and audit trail', () => {
      expect(procurementModule.INITIAL_PRS).toBeDefined();
      expect(INITIAL_PRS.length).toBeGreaterThan(0);
      const pr = INITIAL_PRS[0];
      expect(pr.id).toBe('PR-2026-0005');
      expect(pr.title).toBeDefined();
      expect(pr.items.length).toBeGreaterThan(0);
      expect(pr.items[0].code).toBe('CNT-TOP-GRN20');
      expect(pr.items[0].rateCard).toBe(3550);
    });

    it('should export valid INITIAL_QUOTES and INITIAL_NEGO dictionaries', () => {
      expect(procurementModule.INITIAL_QUOTES).toBeDefined();
      expect(Object.keys(INITIAL_QUOTES).length).toBeGreaterThan(0);
      expect(INITIAL_QUOTES['PR-2026-0005']).toBeDefined();
      expect(INITIAL_QUOTES['PR-2026-0005'][0].vendor).toBeDefined();

      expect(procurementModule.INITIAL_NEGO).toBeDefined();
      expect(Object.keys(INITIAL_NEGO).length).toBeGreaterThan(0);
      expect(INITIAL_NEGO['PR-2026-0005']).toBeDefined();
      expect(INITIAL_NEGO['PR-2026-0005'][0].round).toBe(1);
    });

    it('should export valid INITIAL_PPOS, INITIAL_POS, and INITIAL_AUDIT_LOGS', () => {
      expect(procurementModule.INITIAL_PPOS).toBeDefined();
      expect(INITIAL_PPOS.length).toBeGreaterThan(0);
      expect(INITIAL_PPOS[0].id).toBe('PPO-2026-0015');
      expect(INITIAL_PPOS[0].unitRate).toBe(148500);

      expect(procurementModule.INITIAL_POS).toBeDefined();
      expect(INITIAL_POS.length).toBeGreaterThan(0);
      expect(INITIAL_POS[0].id).toBe('PO-2026-0089');

      expect(procurementModule.INITIAL_AUDIT_LOGS).toBeDefined();
      expect(INITIAL_AUDIT_LOGS.length).toBeGreaterThan(0);
      expect(INITIAL_AUDIT_LOGS[0].action).toBeDefined();
    });
  });

  describe('Vendors Constants', () => {
    it('should export VENDOR_DATABASE with comprehensive ratings and compliance', () => {
      expect(vendorsModule.VENDOR_DATABASE).toBeDefined();
      expect(VENDOR_DATABASE.length).toBeGreaterThan(0);
      const vendor = VENDOR_DATABASE[0];
      expect(vendor.id).toBe('VND-001');
      expect(vendor.name).toBe('Vendor 1');
      expect(vendor.rating).toBeGreaterThanOrEqual(4.0);
      expect(vendor.isRateCard).toBe(true);
    });

    it('should export MASTER_VENDORS list', () => {
      expect(vendorsModule.MASTER_VENDORS).toBeDefined();
      expect(MASTER_VENDORS.length).toBeGreaterThan(0);
      expect(MASTER_VENDORS[0].name).toBe('Vendor 1');
      expect(MASTER_VENDORS[0].id).toBe('VND-001');
    });

    it('should export INITIAL_VENDOR_QUOTE_ITEMS with valid unit prices', () => {
      expect(vendorsModule.INITIAL_VENDOR_QUOTE_ITEMS).toBeDefined();
      expect(INITIAL_VENDOR_QUOTE_ITEMS.length).toBeGreaterThan(0);
      expect(INITIAL_VENDOR_QUOTE_ITEMS[0].code).toBe('CNT-TOP-GRN20');
      expect(INITIAL_VENDOR_QUOTE_ITEMS[0].rate1).toBe(3900);
      expect(INITIAL_VENDOR_QUOTE_ITEMS[0].targetRate).toBe(3380);
    });
  });

  describe('BOQ Constants', () => {
    it('should export DEFAULT_COUNTER_ITEMS and INITIAL_DOCS', () => {
      expect(boqModule.DEFAULT_COUNTER_ITEMS).toBeDefined();
      expect(DEFAULT_COUNTER_ITEMS.length).toBeGreaterThan(0);
      expect(DEFAULT_COUNTER_ITEMS[0].code).toBe('CNT-TOP-GRN20');

      expect(boqModule.INITIAL_DOCS).toBeDefined();
      expect(INITIAL_DOCS.length).toBeGreaterThan(0);
      expect(INITIAL_DOCS[0].name).toContain('.pdf');
    });

    it('should export DRAWING_NAME_CATALOG and INITIAL_PRS_DATA', () => {
      expect(boqModule.DRAWING_NAME_CATALOG).toBeDefined();
      expect(Object.keys(DRAWING_NAME_CATALOG).length).toBeGreaterThan(0);
      expect(DRAWING_NAME_CATALOG['COUNTER_ELEVATION_D']).toBeDefined();

      expect(boqModule.INITIAL_PRS_DATA).toBeDefined();
      expect(INITIAL_PRS_DATA['PR-2026-0005']).toBeDefined();
      expect(INITIAL_PRS_DATA['PR-2026-0005'].items.length).toBeGreaterThan(0);
    });

    it('should export COMMERCIAL_COUNTER_ITEMS with complete MLEO breakdowns', () => {
      expect(boqModule.COMMERCIAL_COUNTER_ITEMS).toBeDefined();
      expect(COMMERCIAL_COUNTER_ITEMS.length).toBeGreaterThan(0);
      const item = COMMERCIAL_COUNTER_ITEMS[0];
      expect(item.code).toBeDefined();
      expect(item.mleo).toBeDefined();
      expect(item.mleo.m).toBeGreaterThan(0);
    });
  });

  describe('Masters Constants', () => {
    it('should export STANDARD_MASTER_RATE_CARDS', () => {
      expect(mastersModule.STANDARD_MASTER_RATE_CARDS).toBeDefined();
      expect(STANDARD_MASTER_RATE_CARDS.length).toBeGreaterThan(0);
      const m = STANDARD_MASTER_RATE_CARDS[0];
      expect(m.code).toBe('CON-RMC-M30');
      expect(m.cat).toBe('Civil Materials');
      expect(m.rate).toBe('₹ 4,200');
      expect(m.uom).toBe('Cum');
      expect(m.region).toBe('North Hub (NCR)');
    });
  });

  describe('Navigation Constants', () => {
    it('should export NAV_ITEMS matching enterprise navigation structure', () => {
      expect(navigationModule.NAV_ITEMS).toBeDefined();
      expect(NAV_ITEMS.length).toBe(8);
      const ids = NAV_ITEMS.map((n) => n.id);
      expect(ids).toContain('dashboard');
      expect(ids).toContain('boq_raiser_studio');
      expect(ids).toContain('pr_approval_queue');
      expect(ids).toContain('category_manager_hub');
      expect(ids).toContain('ppo_workorders');
      expect(ids).toContain('vendor_portal');
      expect(ids).toContain('tenant_overview');
      expect(ids).toContain('masters');
    });
  });

  describe('AI Constants', () => {
    it('should export DEFAULT_GEMINI_MODEL and PRESET_ITEMS', () => {
      expect(aiModule.DEFAULT_GEMINI_MODEL).toBe('gemini-2.0-flash-lite');
      expect(DEFAULT_GEMINI_MODEL).toBe('gemini-2.0-flash-lite');

      expect(aiModule.PRESET_ITEMS).toBeDefined();
      expect(PRESET_ITEMS.length).toBeGreaterThan(0);
      expect(PRESET_ITEMS[0].name).toBe('Design Mix Concrete M30 with Fly Ash');
    });

    it('should export default MLEO ratios, inflators, and negotiation scripts', () => {
      expect(aiModule.DEFAULT_MLEO_RATIOS).toBeDefined();
      expect(DEFAULT_MLEO_RATIOS.material).toBe(0.55);
      expect(DEFAULT_MLEO_RATIOS.labour).toBe(0.20);
      expect(DEFAULT_MLEO_RATIOS.equipment).toBe(0.10);
      expect(DEFAULT_MLEO_RATIOS.overheads).toBe(0.15);

      expect(aiModule.DEFAULT_COST_INFLATORS).toBeDefined();
      expect(DEFAULT_COST_INFLATORS.length).toBeGreaterThan(0);

      expect(aiModule.DEFAULT_NEGOTIATION_SCRIPTS).toBeDefined();
      expect(DEFAULT_NEGOTIATION_SCRIPTS.length).toBeGreaterThan(0);
    });
  });

  describe('Logging Constants', () => {
    it('should export logging severity weights and thresholds', () => {
      expect(loggingModule.LOG_LEVEL_SEVERITY).toEqual({
        DEBUG: 10,
        INFO: 20,
        WARN: 30,
        ERROR: 40,
      });
      expect(LOG_LEVEL_SEVERITY.DEBUG).toBe(10);
      expect(DEFAULT_LOG_RETENTION_DAYS).toBe(7);
      expect(MAX_LOG_FILE_SIZE_BYTES).toBe(5 * 1024 * 1024);
      expect(MAX_ROTATED_FILES).toBe(5);
      expect(MAX_IN_MEMORY_LOGS).toBe(1000);
    });
  });

  describe('Database Constants', () => {
    it('should export database optimization and compute metric thresholds', () => {
      expect(databaseModule.DEFAULT_DB_OPTIMIZATION_CONFIG).toBeDefined();
      expect(DEFAULT_DB_OPTIMIZATION_CONFIG.defaultTtlMs).toBe(60000);
      expect(DEFAULT_DB_OPTIMIZATION_CONFIG.slowQueryThresholdMs).toBe(100);
      expect(DEFAULT_DB_OPTIMIZATION_CONFIG.maxEntries).toBe(500);

      expect(CACHE_TAGS.TENANTS).toBe('tenant');
      expect(CACHE_TAGS.PURCHASE_REQUESTS).toBe('pr');

      expect(DB_COMPUTE_METRICS.MS_PER_HOUR).toBe(3600000);
      expect(DB_COMPUTE_METRICS.MAX_SLOW_QUERIES_RETAINED).toBe(50);
    });
  });

  describe('GraphQL Constants', () => {
    it('should export GraphQL complexity limits and error codes', () => {
      expect(graphqlModule.GRAPHQL_COMPLEXITY_LIMITS).toBeDefined();
      expect(GRAPHQL_COMPLEXITY_LIMITS.maxQueryLength).toBe(5000);
      expect(GRAPHQL_ERROR_CODES.BAD_USER_INPUT).toBe('BAD_USER_INPUT');
      expect(DEFAULT_GRAPHQL_INTROSPECTION_QUERY).toContain('databaseAuditMetrics');
    });
  });

  describe('Index Barrel Export', () => {
    it('should re-export all constants correctly from index', () => {
      expect(indexModule.TENANTS).toBe(tenantsModule.TENANTS);
      expect(indexModule.INITIAL_PRS).toBe(procurementModule.INITIAL_PRS);
      expect(indexModule.VENDOR_DATABASE).toBe(vendorsModule.VENDOR_DATABASE);
      expect(indexModule.COMMERCIAL_COUNTER_ITEMS).toBe(boqModule.COMMERCIAL_COUNTER_ITEMS);
      expect(indexModule.STANDARD_MASTER_RATE_CARDS).toBe(mastersModule.STANDARD_MASTER_RATE_CARDS);
      expect(indexModule.NAV_ITEMS).toBe(navigationModule.NAV_ITEMS);
      expect(indexModule.DEFAULT_GEMINI_MODEL).toBe(aiModule.DEFAULT_GEMINI_MODEL);
      expect(indexModule.LOG_LEVEL_SEVERITY).toBe(loggingModule.LOG_LEVEL_SEVERITY);
      expect(indexModule.DEFAULT_DB_OPTIMIZATION_CONFIG).toBe(databaseModule.DEFAULT_DB_OPTIMIZATION_CONFIG);
      expect(indexModule.GRAPHQL_COMPLEXITY_LIMITS).toBe(graphqlModule.GRAPHQL_COMPLEXITY_LIMITS);
    });
  });
});
