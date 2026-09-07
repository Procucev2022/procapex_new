import { NextRequest, NextResponse } from 'next/server';
import { generateCostAnalysis } from '@/lib/gemini';
import { logger } from '@/lib/logger';
import { validateSchema } from '@/lib/validator';
import { API_COST_ANALYSIS_SCHEMA } from '@/constants';

export async function POST(req: NextRequest) {
  const correlationId = `req-cost-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const startTime = Date.now();

  try {
    const body = await req.json();

    const validation = validateSchema(body, API_COST_ANALYSIS_SCHEMA);
    if (!validation.isValid) {
      logger.warn('api/cost-analysis', 'Validation failed: itemDescription is missing or invalid', {
        errors: validation.errors,
      }, correlationId);
      const isMissingDesc = validation.errors.some((e) => e.field === 'itemDescription');
      return NextResponse.json(
        {
          error: isMissingDesc ? 'itemDescription is required' : validation.errorSummary,
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { itemDescription, quantity, uom, currentQuote } = validation.data;

    logger.info('api/cost-analysis', 'Received cost analysis request', {
      itemDescription,
      quantity,
      uom,
      currentQuote,
    }, correlationId);

    const analysis = await generateCostAnalysis(
      itemDescription,
      quantity,
      uom,
      currentQuote
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
