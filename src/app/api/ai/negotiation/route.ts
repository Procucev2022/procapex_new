import { NextRequest, NextResponse } from 'next/server';
import { generateCounterOffer } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prTitle, itemName, vendorQuoteRate, targetBenchmark, currentRound, historySummary } = body;

    if (!prTitle || !itemName) {
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

    return NextResponse.json(tactic);
  } catch (error: any) {
    console.error('Error generating counter-offer:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate negotiation counter-offer' },
      { status: 500 }
    );
  }
}
