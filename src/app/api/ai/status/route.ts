import { NextResponse } from 'next/server';
import { getConfiguredModelName, isGeminiConfigured } from '@/lib/gemini';
import { logger } from '@/lib/logger';

export async function GET() {
  const correlationId = `req-status-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
