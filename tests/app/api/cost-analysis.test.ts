/**
 * @jest-environment node
 */
import { POST } from '@/app/api/ai/cost-analysis/route';
import { generateCostAnalysis } from '@/lib/gemini';
import { NextRequest } from 'next/server';

jest.mock('@/lib/gemini', () => ({
  generateCostAnalysis: jest.fn(),
}));

describe('POST /api/ai/cost-analysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if itemDescription is missing or not a string', async () => {
    const reqEmpty = new NextRequest('http://localhost/api/ai/cost-analysis', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const resEmpty = await POST(reqEmpty);
    expect(resEmpty.status).toBe(400);
    const jsonEmpty = await resEmpty.json();
    expect(jsonEmpty.error).toBe('itemDescription is required');

    const reqNumber = new NextRequest('http://localhost/api/ai/cost-analysis', {
      method: 'POST',
      body: JSON.stringify({ itemDescription: 12345 }),
    });
    const resNumber = await POST(reqNumber);
    expect(resNumber.status).toBe(400);
  });

  it('generates cost analysis with all parameters provided', async () => {
    const mockAnalysis = {
      itemName: 'Concrete M30',
      targetRate: 4350,
      maxLimit: 4500,
      currency: 'INR',
      pillars: {
        material: { percentage: 56, cost: 2436, description: 'Aggregates' },
        labour: { percentage: 14, cost: 609, description: 'Crew' },
        equipment: { percentage: 18, cost: 783, description: 'Transit' },
        overheads: { percentage: 12, cost: 522, description: 'Testing' },
      },
      inflators: [],
      negotiationScripts: [],
      modelUsed: 'gemini-2.0-flash-lite',
      isLiveAi: true,
    };

    (generateCostAnalysis as jest.Mock).mockResolvedValue(mockAnalysis);

    const req = new NextRequest('http://localhost/api/ai/cost-analysis', {
      method: 'POST',
      body: JSON.stringify({
        itemDescription: 'Concrete M30',
        quantity: 450,
        uom: 'Cum',
        currentQuote: 4800,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.itemName).toBe('Concrete M30');
    expect(generateCostAnalysis).toHaveBeenCalledWith('Concrete M30', 450, 'Cum', 4800);
  });

  it('uses default values when optional fields are omitted', async () => {
    (generateCostAnalysis as jest.Mock).mockResolvedValue({ itemName: 'Steel' });

    const req = new NextRequest('http://localhost/api/ai/cost-analysis', {
      method: 'POST',
      body: JSON.stringify({
        itemDescription: 'Steel',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(generateCostAnalysis).toHaveBeenCalledWith('Steel', 1, 'Unit', undefined);
  });

  it('returns 500 when generateCostAnalysis throws with an error message', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (generateCostAnalysis as jest.Mock).mockRejectedValue(new Error('AI generation timeout'));

    const req = new NextRequest('http://localhost/api/ai/cost-analysis', {
      method: 'POST',
      body: JSON.stringify({ itemDescription: 'Bricks' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('AI generation timeout');
    consoleSpy.mockRestore();
  });

  it('returns 500 with fallback message when thrown error has no message', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (generateCostAnalysis as jest.Mock).mockRejectedValue('string-error');

    const req = new NextRequest('http://localhost/api/ai/cost-analysis', {
      method: 'POST',
      body: JSON.stringify({ itemDescription: 'Sand' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Failed to generate cost analysis');
    consoleSpy.mockRestore();
  });
});
