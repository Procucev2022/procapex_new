import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getConfiguredModelName, isGeminiConfigured } from '@/lib/gemini';
import { logger } from '@/lib/logger';
import { validateQueryParams } from '@/lib/validator';
import { API_AI_STATUS_QUERY_SCHEMA } from '@/constants';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const correlationId = `req-status-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const { searchParams } = new URL(req.url);
  const validation = validateQueryParams(searchParams, API_AI_STATUS_QUERY_SCHEMA);
  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.errorSummary, details: validation.errors },
      { status: 400 }
    );
  }

  const configured = isGeminiConfigured();
  const model = getConfiguredModelName();

  logger.info('api/ai-status', 'AI status healthcheck requested', {
    provider: 'Gemini',
    model,
    isConfigured: configured,
  }, correlationId);

  return NextResponse.json({
    provider: 'Gemini',
    model,
    isConfigured: configured,
    message: configured
      ? `Connected to Gemini (${model})`
      : `Using Gemini Demo Mode (${model}). Add GEMINI_API_KEY to .env to connect live API.`,
  });
}
