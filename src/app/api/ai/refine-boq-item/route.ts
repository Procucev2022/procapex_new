import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { refineBOQItemWithAI } from '@/lib/gemini';
import { logger } from '@/lib/logger';
import { validateSchema } from '@/lib/validator';
import { API_REFINE_BOQ_ITEM_SCHEMA } from '@/constants';
import type { RefineBOQItemRequest } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const correlationId = `req-refine-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const startTime = Date.now();

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload in request body.' },
      { status: 400 },
    );
  }

  try {
    const validation = validateSchema(body, API_REFINE_BOQ_ITEM_SCHEMA);
    if (!validation.isValid) {
      logger.warn(
        'api/refine-boq-item',
        'Validation failed for BOQ line item refinement request',
        { errors: validation.errors },
        correlationId,
      );
      return NextResponse.json(
        {
          error: `Validation failed: ${validation.errorSummary}`,
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    const payload = validation.data as unknown as RefineBOQItemRequest;

    logger.info(
      'api/refine-boq-item',
      'Received BOQ line item refinement request',
      {
        itemCode: payload.itemCode,
        userInputSpecsLength: payload.userInputSpecs?.length,
        categoryHint: payload.categoryHint,
      },
      correlationId,
    );

    const result = await refineBOQItemWithAI(payload);

    const durationMs = Date.now() - startTime;
    logger.info(
      'api/refine-boq-item',
      'BOQ line item refinement completed successfully',
      {
        durationMs,
        itemCode: result.refinedCode,
        refinedBenchmarkRate: result.refinedBenchmarkRate,
        isLiveAi: result.isLiveAi,
      },
      correlationId,
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    logger.error(
      'api/refine-boq-item',
      'Error during BOQ line item refinement execution',
      {
        durationMs,
        error: errorMessage,
      },
      correlationId,
    );

    return NextResponse.json(
      {
        error: 'AI BOQ line item refinement failed',
        message: errorMessage,
      },
      { status: 500 },
    );
  }
}
