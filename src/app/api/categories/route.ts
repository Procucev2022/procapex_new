import { NextResponse } from 'next/server';
import type { BudgetCategory } from '@/types';
import { getCategoriesFromDatabase, saveCategoriesToDatabase } from '@/lib/category-db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const correlationId = `cat-get-${Date.now()}`;
  try {
    const categories = await getCategoriesFromDatabase();
    logger.info('api/categories', 'Retrieved categories from persistence', {
      correlationId,
      count: categories.length,
    });
    return NextResponse.json({ success: true, categories, count: categories.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    logger.error('api/categories', 'Failed to retrieve categories', { correlationId, error: msg });
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  const correlationId = `cat-post-${Date.now()}`;
  try {
    const body = await req.json() as { categories?: BudgetCategory[] };
    if (!body || !Array.isArray(body.categories)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: categories array is required' },
        { status: 400 }
      );
    }

    const saved = await saveCategoriesToDatabase(body.categories);
    logger.info('api/categories', 'Persisted categories payload', {
      correlationId,
      count: body.categories.length,
      savedToDb: saved,
    });

    return NextResponse.json({
      success: true,
      persistedCount: body.categories.length,
      savedToDb: saved,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    logger.error('api/categories', 'Failed to persist categories', { correlationId, error: msg });
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
