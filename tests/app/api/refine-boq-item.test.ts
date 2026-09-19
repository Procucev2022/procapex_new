/**
 * @jest-environment node
 */
import { POST } from '@/app/api/ai/refine-boq-item/route';
import { refineBOQItemWithAI } from '@/lib/gemini';
import { NextRequest } from 'next/server';

jest.mock('@/lib/gemini', () => ({
  refineBOQItemWithAI: jest.fn(),
}));

describe('POST /api/ai/refine-boq-item', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if request body is not valid JSON', async () => {
    const req = new NextRequest('http://localhost/api/ai/refine-boq-item', {
      method: 'POST',
      body: 'invalid-json{',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Invalid JSON payload');
  });

  it('returns 400 if required fields are missing', async () => {
    const req = new NextRequest('http://localhost/api/ai/refine-boq-item', {
      method: 'POST',
      body: JSON.stringify({
        itemCode: 'ITEM-1',
        // missing currentDesc and userInputSpecs
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Validation failed');
  });

  it('returns 200 with refined BOQ item on valid request', async () => {
    const mockResult = {
      refinedCode: 'ITEM-1',
      refinedDesc: '12mm extra-clear toughened safety glass with AISI 316 matte black spider fittings',
      refinedUom: 'Sqm',
      refinedQty: 25,
      refinedBenchmarkRate: 3200,
      aiRationale: 'Recalibrated benchmark rate due to commercial grade architectural glass and SS316 hardware.',
      specsHighlighted: ['Toughened Safety Glass', 'SS 316 Architectural Grade'],
      modelUsed: 'gemini-2.0-flash-lite',
      isLiveAi: true,
      confidence: '96%',
    };

    (refineBOQItemWithAI as jest.Mock).mockResolvedValueOnce(mockResult);

    const req = new NextRequest('http://localhost/api/ai/refine-boq-item', {
      method: 'POST',
      body: JSON.stringify({
        itemCode: 'ITEM-1',
        currentDesc: 'Commercial clear glass',
        currentUom: 'Sqm',
        currentQty: 25,
        currentBenchmarkRate: 2200,
        userInputSpecs: 'Upgrade to 12mm extra-clear toughened glass with AISI 316 matte black spider fittings',
        categoryHint: 'Interior & Fitouts',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.refinedCode).toBe('ITEM-1');
    expect(json.refinedBenchmarkRate).toBe(3200);
    expect(json.specsHighlighted).toContain('Toughened Safety Glass');
  });

  it('returns 500 when AI refinement engine throws an error', async () => {
    (refineBOQItemWithAI as jest.Mock).mockRejectedValueOnce(new Error('AI Engine Failure'));

    const req = new NextRequest('http://localhost/api/ai/refine-boq-item', {
      method: 'POST',
      body: JSON.stringify({
        itemCode: 'ITEM-1',
        currentDesc: 'Commercial clear glass',
        currentUom: 'Sqm',
        currentQty: 25,
        currentBenchmarkRate: 2200,
        userInputSpecs: 'Upgrade specs',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toContain('AI BOQ line item refinement failed');
  });
});
