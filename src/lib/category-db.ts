import fs from 'fs';
import path from 'path';
import type { BudgetCategory, SubCategory, StandardBOQItem } from '@/types';
import { INITIAL_PROJECT_CATEGORIES } from '@/constants';
import { prisma } from './prisma';
import { logger } from './logger';

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'categories.json');

async function ensureDataDir(): Promise<void> {
  try {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    logger.warn('lib/category-db', 'Could not create data directory', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

async function readBackupFile(): Promise<BudgetCategory[] | null> {
  try {
    await ensureDataDir();
    if (!fs.existsSync(BACKUP_FILE)) return null;
    const raw = await fs.promises.readFile(BACKUP_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as BudgetCategory[]) : null;
  } catch (err) {
    logger.warn('lib/category-db', 'Failed to read backup categories file', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

async function writeBackupFile(categories: BudgetCategory[]): Promise<void> {
  try {
    await ensureDataDir();
    await fs.promises.writeFile(BACKUP_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (err) {
    logger.warn('lib/category-db', 'Failed to write backup categories file', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

interface PrismaSubCatRecord {
  id: string;
  categoryId: string;
  name: string;
  shortCode: string;
  description: string | null;
}

interface PrismaItemRecord {
  id: string;
  code: string;
  categoryId: string;
  subCategoryId: string | null;
  subCategoryName: string | null;
  desc: string;
  uom: string;
  benchmarkRate: number;
  defaultQty: number;
  qty: number;
  calculatedCost: number;
  benchmarkDetailsRate: number | null;
  benchmarkRateCardRate: number | null;
  historicalLowestRate: number | null;
  aiConfidence: string | null;
  varianceVsRateCardPercent: number | null;
  notes: string | null;
  status: string;
  isImmutable: boolean;
}

interface PrismaCatRecord {
  id: string;
  name: string;
  shortCode: string;
  costCenter: string;
  description: string;
  subtotalCost: number;
  baselineBudget: number;
  committedCost: number;
  status: string;
  subCategories: PrismaSubCatRecord[];
  items: PrismaItemRecord[];
}

function mapPrismaCategory(cat: PrismaCatRecord): BudgetCategory {
  const subCategories: SubCategory[] = (cat.subCategories || []).map((s) => ({
    id: s.id,
    categoryId: s.categoryId,
    name: s.name,
    shortCode: s.shortCode,
    description: s.description || undefined,
  }));

  const items: StandardBOQItem[] = (cat.items || []).map((it) => ({
    id: it.id,
    code: it.code,
    categoryId: it.categoryId,
    subCategoryId: it.subCategoryId || undefined,
    subCategoryName: it.subCategoryName || undefined,
    desc: it.desc,
    uom: it.uom,
    benchmarkRate: it.benchmarkRate,
    defaultQty: it.defaultQty,
    qty: it.qty,
    calculatedCost: it.calculatedCost,
    benchmarkDetails: {
      benchmarkRate: it.benchmarkDetailsRate || it.benchmarkRate,
      masterRateCardRate: it.benchmarkRateCardRate || it.benchmarkRate,
      historicalLowestRate: it.historicalLowestRate || it.benchmarkRate,
      aiConfidence: it.aiConfidence || '95%',
      varianceVsRateCardPercent: it.varianceVsRateCardPercent || 0,
    },
    notes: it.notes || undefined,
    status: it.status === 'ON_HOLD' ? 'ON_HOLD' : 'ACTIVE',
    isImmutable: it.isImmutable,
  }));

  return {
    id: cat.id,
    name: cat.name,
    shortCode: cat.shortCode,
    costCenter: cat.costCenter,
    description: cat.description,
    subtotalCost: cat.subtotalCost,
    baselineBudget: cat.baselineBudget,
    committedCost: cat.committedCost,
    status: (cat.status as 'DRAFT' | 'BASELINED' | 'APPROVED') || 'DRAFT',
    subCategories,
    items,
  };
}

/**
 * Loads categories from the database or local persistence layer.
 * Seeds initial categories on first run if database is empty.
 */
export async function getCategoriesFromDatabase(): Promise<BudgetCategory[]> {
  try {
    const records = await prisma.masterCategory.findMany({
      include: {
        subCategories: true,
        items: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (records && records.length > 0) {
      logger.info('lib/category-db', 'Fetched categories from database', { count: records.length });
      const mapped = (records as unknown as PrismaCatRecord[]).map(mapPrismaCategory);
      void writeBackupFile(mapped);
      return mapped;
    }

    // Database is empty - Seed with INITIAL_PROJECT_CATEGORIES
    logger.info('lib/category-db', 'Seeding database with standard categories', {
      count: INITIAL_PROJECT_CATEGORIES.length,
    });
    await saveCategoriesToDatabase(INITIAL_PROJECT_CATEGORIES);
    return INITIAL_PROJECT_CATEGORIES;
  } catch (err) {
    logger.warn('lib/category-db', 'Database query failed, falling back to backup', {
      error: err instanceof Error ? err.message : String(err),
    });
    const backup = await readBackupFile();
    return backup || INITIAL_PROJECT_CATEGORIES;
  }
}

/**
 * Persists all categories, subcategories, and standard BOQ items to the database and backup file.
 */
export async function saveCategoriesToDatabase(categories: BudgetCategory[]): Promise<boolean> {
  // Always update backup file first for fast local resilience
  await writeBackupFile(categories);

  try {
    for (const cat of categories) {
      await prisma.masterCategory.upsert({
        where: { id: cat.id },
        update: {
          name: cat.name,
          shortCode: cat.shortCode,
          costCenter: cat.costCenter,
          description: cat.description,
          subtotalCost: cat.subtotalCost,
          baselineBudget: cat.baselineBudget,
          committedCost: cat.committedCost,
          status: cat.status,
        },
        create: {
          id: cat.id,
          name: cat.name,
          shortCode: cat.shortCode,
          costCenter: cat.costCenter,
          description: cat.description,
          subtotalCost: cat.subtotalCost,
          baselineBudget: cat.baselineBudget,
          committedCost: cat.committedCost,
          status: cat.status,
        },
      });

      if (cat.subCategories) {
        for (const sub of cat.subCategories) {
          await prisma.masterSubCategory.upsert({
            where: { id: sub.id },
            update: {
              name: sub.name,
              shortCode: sub.shortCode,
              description: sub.description || null,
            },
            create: {
              id: sub.id,
              categoryId: cat.id,
              name: sub.name,
              shortCode: sub.shortCode,
              description: sub.description || null,
            },
          });
        }
      }

      if (cat.items) {
        for (const item of cat.items) {
          await prisma.masterStandardBOQItem.upsert({
            where: { code: item.code },
            update: {
              desc: item.desc,
              uom: item.uom,
              benchmarkRate: item.benchmarkRate,
              defaultQty: item.defaultQty,
              qty: item.qty,
              calculatedCost: item.calculatedCost,
              status: item.status || 'ACTIVE',
              notes: item.notes || null,
            },
            create: {
              id: item.id,
              code: item.code,
              categoryId: cat.id,
              subCategoryId: item.subCategoryId || null,
              subCategoryName: item.subCategoryName || null,
              desc: item.desc,
              uom: item.uom,
              benchmarkRate: item.benchmarkRate,
              defaultQty: item.defaultQty,
              qty: item.qty,
              calculatedCost: item.calculatedCost,
              benchmarkDetailsRate: item.benchmarkDetails?.benchmarkRate || item.benchmarkRate,
              benchmarkRateCardRate: item.benchmarkDetails?.masterRateCardRate || item.benchmarkRate,
              historicalLowestRate: item.benchmarkDetails?.historicalLowestRate || item.benchmarkRate,
              aiConfidence: item.benchmarkDetails?.aiConfidence || '95%',
              varianceVsRateCardPercent: item.benchmarkDetails?.varianceVsRateCardPercent || 0,
              notes: item.notes || null,
              status: item.status || 'ACTIVE',
              isImmutable: item.isImmutable ?? true,
            },
          });
        }
      }
    }

    logger.info('lib/category-db', 'Successfully persisted categories to database', { count: categories.length });
    return true;
  } catch (err) {
    logger.warn('lib/category-db', 'Failed to persist to database, backup file updated', {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
