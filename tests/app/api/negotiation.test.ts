/**
 * @jest-environment node
 */
import { POST } from '@/app/api/ai/negotiation/route';
import { generateCounterOffer } from '@/lib/gemini';
import { NextRequest } from 'next/server';

jest.mock('@/lib/gemini', () => ({
  generateCounterOffer: jest.fn(),
}));

describe('POST /api/ai/negotiation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if prTitle or itemName is missing', async () => {
    const req1 = new NextRequest('http://localhost/api/ai/negotiation', {
      method: 'POST',
      body: JSON.stringify({ prTitle: 'PR-1' }),
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(400);

    const req2 = new NextRequest('http://localhost/api/ai/negotiation', {
      method: 'POST',
      body: JSON.stringify({ itemName: 'Concrete' }),
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(400);

    // When prTitle and itemName exist, but other fields fail schema validation (e.g. currentRound > 20)
    const req3 = new NextRequest('http://localhost/api/ai/negotiation', {
      method: 'POST',
      body: JSON.stringify({ prTitle: 'PR-1', itemName: 'Concrete', currentRound: 99 }),
    });
    const res3 = await POST(req3);
    expect(res3.status).toBe(400);
    const json3 = await res3.json();
    expect(json3.error).toContain('currentRound');
  });

  it('generates counter-offer with valid parameters', async () => {
    (generateCounterOffer as jest.Mock).mockResolvedValue({
      recommendedCounterRate: 4350,
      counterRemarks: 'Counter based on volume.',
      strategyAdvice: 'Hold firm.',
      modelUsed: 'gemini-2.0-flash-lite',
      isLiveAi: true,
    });

    const req = new NextRequest('http://localhost/api/ai/negotiation', {
      method: 'POST',
      body: JSON.stringify({
        prTitle: 'PR-2026-0005',
        itemName: 'Granite Countertop',
        vendorQuoteRate: 5000,
        targetBenchmark: 4000,
        currentRound: 2,
        historySummary: 'Vendor offered 4800 in round 1',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.recommendedCounterRate).toBe(4350);
    expect(generateCounterOffer).toHaveBeenCalledWith({
      prTitle: 'PR-2026-0005',
      itemName: 'Granite Countertop',
      vendorQuoteRate: 5000,
      targetBenchmark: 4000,
      currentRound: 2,
      historySummary: 'Vendor offered 4800 in round 1',
    });
  });

  it('handles default values when numeric fields are non-numeric or omitted', async () => {
    (generateCounterOffer as jest.Mock).mockResolvedValue({ recommendedCounterRate: 0 });

    const req = new NextRequest('http://localhost/api/ai/negotiation', {
      method: 'POST',
      body: JSON.stringify({
        prTitle: 'PR-1',
        itemName: 'Sand',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(generateCounterOffer).toHaveBeenCalledWith({
      prTitle: 'PR-1',
      itemName: 'Sand',
      vendorQuoteRate: 0,
      targetBenchmark: 0,
      currentRound: 1,
      historySummary: undefined,
    });
  });

  it('returns 500 when generateCounterOffer throws an error with message', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (generateCounterOffer as jest.Mock).mockRejectedValue(new Error('Quota limit'));

    const req = new NextRequest('http://localhost/api/ai/negotiation', {
      method: 'POST',
      body: JSON.stringify({
        prTitle: 'PR-1',
        itemName: 'Cement',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Quota limit');
    consoleSpy.mockRestore();
  });

  it('returns 500 with default message when thrown error has no message', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (generateCounterOffer as jest.Mock).mockRejectedValue({});

    const req = new NextRequest('http://localhost/api/ai/negotiation', {
      method: 'POST',
      body: JSON.stringify({
        prTitle: 'PR-1',
        itemName: 'Cement',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Failed to generate negotiation counter-offer');
    consoleSpy.mockRestore();
  });
});
