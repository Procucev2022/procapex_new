import { NextResponse } from 'next/server';
import { getConfiguredModelName, isGeminiConfigured } from '@/lib/gemini';

export async function GET() {
  const configured = isGeminiConfigured();
  const model = getConfiguredModelName();

  return NextResponse.json({
    provider: 'Gemini',
    model,
    isConfigured: configured,
    message: configured
      ? `Connected to Gemini (${model})`
      : `Using Gemini Demo Mode (${model}). Add GEMINI_API_KEY to .env to connect live API.`,
  });
}
