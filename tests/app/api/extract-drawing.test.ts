/**
 * @jest-environment node
 */
import { POST } from '@/app/api/ai/extract-drawing/route';
import { extractDrawingWithAI } from '@/lib/gemini';
import { NextRequest } from 'next/server';

jest.mock('@/lib/gemini', () => ({
  extractDrawingWithAI: jest.fn(),
}));

describe('POST /api/ai/extract-drawing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if neither fileName nor drawingTitleHint is provided', async () => {
    const req = new NextRequest('http://localhost/api/ai/extract-drawing', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Validation failed');
  });

  it('returns 400 if request body is not valid JSON', async () => {
    const req = new NextRequest('http://localhost/api/ai/extract-drawing', {
      method: 'POST',
      body: 'invalid-json{',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Invalid JSON payload');
  });

  it('returns 200 with extracted BOQ items on valid request', async () => {
    const mockResult = {
      drawingTitle: 'Counter Elevation D',
      category: 'Interior & Fitouts',
      subCategory: 'Counter Millwork',
      items: [
        {
          code: 'DWG-SPEC-001',
          desc: '18mm Marine Grade Core Substrate',
          uom: 'Sqm',
          qty: 45,
          benchmark: 2200,
          rateCard: 2200,
          status: 'Active',
          drawingElevation: 'Counter Elevation D',
        },
      ],
      modelUsed: 'gemini-1.5-pro',
      isLiveAi: true,
      confidenceScore: 0.95,
    };

    (extractDrawingWithAI as jest.Mock).mockResolvedValueOnce(mockResult);

    const req = new NextRequest('http://localhost/api/ai/extract-drawing', {
      method: 'POST',
      body: JSON.stringify({
        fileName: 'Counter_Elevation_D.pdf',
        drawingTitleHint: 'Counter Elevation D',
        categoryHint: 'Interior & Fitouts',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.drawingTitle).toBe('Counter Elevation D');
    expect(json.items).toHaveLength(1);
    expect(json.items[0].code).toBe('DWG-SPEC-001');
  });

  it('returns 500 when AI extraction throws an error', async () => {
    (extractDrawingWithAI as jest.Mock).mockRejectedValueOnce(new Error('AI Service Timeout'));

    const req = new NextRequest('http://localhost/api/ai/extract-drawing', {
      method: 'POST',
      body: JSON.stringify({
        fileName: 'structural_plan.pdf',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toContain('AI Drawing extraction failed');
  });
});
