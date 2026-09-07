import { NextRequest, NextResponse } from 'next/server';
import { generateCounterOffer } from '@/lib/gemini';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const correlationId = `req-nego-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { prTitle, itemName, vendorQuoteRate, targetBenchmark, currentRound, historySummary } = body;

    logger.info('api/negotiation', 'Received negotiation counter-offer request', {
      prTitle,
      itemName,
      vendorQuoteRate,
      targetBenchmark,
      currentRound,
    }, correlationId);

    if (!prTitle || !itemName) {
      logger.warn('api/negotiation', 'Validation failed: prTitle or itemName is missing', {
        prTitle,
        itemName,
      }, correlationId);
      return NextResponse.json(
        { error: 'prTitle and itemName are required' },
        { status: 400 }
      );
    }

    const tactic = await generateCounterOffer({
      prTitle,
      itemName,
      vendorQuoteRate: Number(vendorQuoteRate) || 0,
      targetBenchmark: Number(targetBenchmark) || 0,
      currentRound: Number(currentRound) || 1,
      historySummary,
    });

    const durationMs = Date.now() - startTime;
    logger.info('api/negotiation', 'Negotiation counter-offer generated successfully', {
      durationMs,
      recommendedCounterRate: tactic.recommendedCounterRate,
      isLiveAi: tactic.isLiveAi,
    }, correlationId);

    return NextResponse.json(tactic);
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    logger.error('api/negotiation', 'Error generating counter-offer', {
      error: error?.message,
      stack: error?.stack,
      durationMs,
    }, correlationId);

    return NextResponse.json(
      { error: error?.message || 'Failed to generate negotiation counter-offer' },
      { status: 500 }
    );
  }
}
