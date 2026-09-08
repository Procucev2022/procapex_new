import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { generateCounterOffer } from '@/lib/gemini';
import { logger } from '@/lib/logger';
import { validateSchema } from '@/lib/validator';
import { API_NEGOTIATION_SCHEMA } from '@/constants';
import type { NegotiationParams } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const correlationId = `req-nego-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const startTime = Date.now();

  try {
    const body = await req.json();

    const validation = validateSchema(body, API_NEGOTIATION_SCHEMA);
    if (!validation.isValid) {
      logger.warn('api/negotiation', 'Validation failed: prTitle or itemName is missing', {
        errors: validation.errors,
      }, correlationId);
      const isMissingTitleOrItem = validation.errors.some((e) => e.field === 'prTitle' || e.field === 'itemName');
      return NextResponse.json(
        {
          error: isMissingTitleOrItem ? 'prTitle and itemName are required' : validation.errorSummary,
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { prTitle, itemName, vendorQuoteRate, targetBenchmark, currentRound, historySummary } =
      validation.data as unknown as NegotiationParams;

    logger.info('api/negotiation', 'Received negotiation counter-offer request', {
      prTitle,
      itemName,
      vendorQuoteRate,
      targetBenchmark,
      currentRound,
    }, correlationId);

    const tactic = await generateCounterOffer({
      prTitle,
      itemName,
      vendorQuoteRate,
      targetBenchmark,
      currentRound,
      historySummary,
    });

    const durationMs = Date.now() - startTime;
    logger.info('api/negotiation', 'Negotiation counter-offer generated successfully', {
      durationMs,
      recommendedCounterRate: tactic.recommendedCounterRate,
      isLiveAi: tactic.isLiveAi,
    }, correlationId);

    return NextResponse.json(tactic);
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate negotiation counter-offer';
    logger.error('api/negotiation', 'Error generating counter-offer', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      durationMs,
    }, correlationId);

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
