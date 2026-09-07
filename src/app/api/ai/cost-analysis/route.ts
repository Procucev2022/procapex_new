import { NextRequest, NextResponse } from 'next/server';
import { generateCostAnalysis } from '@/lib/gemini';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const correlationId = `req-cost-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { itemDescription, quantity, uom, currentQuote } = body;

    logger.info('api/cost-analysis', 'Received cost analysis request', {
      itemDescription,
      quantity,
      uom,
      currentQuote,
    }, correlationId);

    if (!itemDescription || typeof itemDescription !== 'string') {
      logger.warn('api/cost-analysis', 'Validation failed: itemDescription is missing or invalid', {
        itemDescription,
      }, correlationId);
      return NextResponse.json(
        { error: 'itemDescription is required' },
        { status: 400 }
      );
    }

    const analysis = await generateCostAnalysis(
      itemDescription,
      typeof quantity === 'number' ? quantity : 1,
      typeof uom === 'string' ? uom : 'Unit',
      typeof currentQuote === 'number' ? currentQuote : undefined
    );

    const durationMs = Date.now() - startTime;
    logger.info('api/cost-analysis', 'Cost analysis request fulfilled successfully', {
      durationMs,
      targetRate: analysis.targetRate,
      maxLimit: analysis.maxLimit,
      isLiveAi: analysis.isLiveAi,
    }, correlationId);

    return NextResponse.json(analysis);
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    logger.error('api/cost-analysis', 'Error generating cost analysis', {
      error: error?.message,
      stack: error?.stack,
      durationMs,
    }, correlationId);

    return NextResponse.json(
      { error: error?.message || 'Failed to generate cost analysis' },
      { status: 500 }
    );
  }
}
