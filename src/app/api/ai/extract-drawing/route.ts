import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { extractDrawingWithAI } from '@/lib/gemini';
import { logger } from '@/lib/logger';
import { validateSchema } from '@/lib/validator';
import { API_DRAWING_EXTRACTION_SCHEMA } from '@/constants';
import type { DrawingExtractionRequest } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const correlationId = `req-dwg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
    const validation = validateSchema(body, API_DRAWING_EXTRACTION_SCHEMA);
    if (!validation.isValid) {
      logger.warn(
        'api/extract-drawing',
        'Validation failed for drawing extraction request',
        { errors: validation.errors },
        correlationId,
      );
      return NextResponse.json(
        {
          error: validation.errorSummary,
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    const payload = validation.data as DrawingExtractionRequest;

    if (!payload.fileName?.trim() && !payload.drawingTitleHint?.trim()) {
      return NextResponse.json(
        { error: 'Validation failed: Either fileName or drawingTitleHint is required.' },
        { status: 400 },
      );
    }

    logger.info(
      'api/extract-drawing',
      'Received drawing extraction request',
      {
        fileName: payload.fileName,
        drawingTitleHint: payload.drawingTitleHint,
        categoryHint: payload.categoryHint,
      },
      correlationId,
    );

    const result = await extractDrawingWithAI(payload);

    const durationMs = Date.now() - startTime;
    logger.info(
      'api/extract-drawing',
      'Drawing extraction completed successfully',
      {
        durationMs,
        drawingTitle: result.drawingTitle,
        itemCount: result.items.length,
        isLiveAi: result.isLiveAi,
      },
      correlationId,
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    logger.error(
      'api/extract-drawing',
      'Error during drawing extraction execution',
      {
        durationMs,
        error: errorMessage,
      },
      correlationId,
    );

    return NextResponse.json(
      {
        error: 'AI Drawing extraction failed',
        message: errorMessage,
      },
      { status: 500 },
    );
  }
}
