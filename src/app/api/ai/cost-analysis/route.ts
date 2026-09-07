import { NextRequest, NextResponse } from 'next/server';
import { generateCostAnalysis } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemDescription, quantity, uom, currentQuote } = body;

    if (!itemDescription || typeof itemDescription !== 'string') {
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

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error generating cost analysis:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate cost analysis' },
      { status: 500 }
    );
  }
}
