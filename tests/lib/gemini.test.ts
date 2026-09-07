import {
  getConfiguredModelName,
  resolveApiModelId,
  isGeminiConfigured,
  getGeminiModel,
  generateCostAnalysis,
  generateCounterOffer,
} from '@/lib/gemini';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai');

describe('Gemini AI Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Model Configuration & Resolution', () => {
    it('returns default model name when GEMINI_MODEL is not set', () => {
      delete process.env.GEMINI_MODEL;
      expect(getConfiguredModelName()).toBe('gemini-2.0-flash-lite');
    });

    it('returns trimmed configured model name when set', () => {
      process.env.GEMINI_MODEL = '  gemini-custom-flash  ';
      expect(getConfiguredModelName()).toBe('gemini-custom-flash');
    });

    it('resolves friendly model names to valid API model identifiers', () => {
      expect(resolveApiModelId('gemini 3.5 flash lite')).toBe('gemini-2.0-flash-lite');
      expect(resolveApiModelId('gemini-3.5-flash-lite')).toBe('gemini-2.0-flash-lite');
      expect(resolveApiModelId('gemini-1.5-flash')).toBe('gemini-1.5-flash');
      expect(resolveApiModelId('gemini-1.5-pro')).toBe('gemini-1.5-pro');
      expect(resolveApiModelId('custom-enterprise-model')).toBe('custom-enterprise-model');
    });

    it('correctly reports if Gemini is configured', () => {
      delete process.env.GEMINI_API_KEY;
      expect(isGeminiConfigured()).toBe(false);

      process.env.GEMINI_API_KEY = '   ';
      expect(isGeminiConfigured()).toBe(false);

      process.env.GEMINI_API_KEY = 'AIzaSyFakeTestKey';
      expect(isGeminiConfigured()).toBe(true);
    });

    it('returns null for getGeminiModel if API key is missing', () => {
      delete process.env.GEMINI_API_KEY;
      expect(getGeminiModel()).toBeNull();
    });

    it('returns client and resolved model if API key is present', () => {
      process.env.GEMINI_API_KEY = 'AIzaSyFakeKey';
      process.env.GEMINI_MODEL = 'gemini 3.5 flash lite';

      const mockGetGenerativeModel = jest.fn().mockReturnValue({ modelName: 'resolved' });
      (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: mockGetGenerativeModel,
      }));

      const res = getGeminiModel();
      expect(res).not.toBeNull();
      expect(res?.displayModelName).toBe('gemini 3.5 flash lite');
      expect(res?.apiModelId).toBe('gemini-2.0-flash-lite');
      expect(mockGetGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-2.0-flash-lite' });
    });
  });

  describe('generateCostAnalysis', () => {
    it('uses fallback intelligent estimation when no API key is provided', async () => {
      delete process.env.GEMINI_API_KEY;

      const resWithQuote = await generateCostAnalysis('Cement OPC 53', 100, 'Bags', 400);
      expect(resWithQuote.isLiveAi).toBe(false);
      expect(resWithQuote.itemName).toBe('Cement OPC 53');
      expect(resWithQuote.targetRate).toBe(Math.round(400 * 0.88));
      expect(resWithQuote.pillars.material.percentage).toBe(56);
      expect(resWithQuote.inflators.length).toBeGreaterThan(0);
      expect(resWithQuote.negotiationScripts.length).toBeGreaterThan(0);

      const resWithoutQuote = await generateCostAnalysis('Custom Tooling');
      expect(resWithoutQuote.targetRate).toBe(4350);
    });

    it('uses live Gemini API when key is present and parses JSON successfully', async () => {
      process.env.GEMINI_API_KEY = 'AIzaSyKey';
      process.env.GEMINI_MODEL = 'gemini-2.0-flash-lite';

      const mockJson = {
        itemName: 'Steel Reinforcement',
        targetRate: 52000,
        maxLimit: 54000,
        currency: 'INR',
        pillars: {
          material: { percentage: 60, cost: 31200, description: 'Iron ore & alloy' },
          labour: { percentage: 10, cost: 5200, description: 'Milling staff' },
          equipment: { percentage: 15, cost: 7800, description: 'Rolling mills' },
          overheads: { percentage: 15, cost: 7800, description: 'Transport & margin' },
        },
        inflators: [{ title: 'Freight Surcharge', description: 'Diesel price spike' }],
        negotiationScripts: [{ title: 'Scrap Price', argument: 'Index lowered' }],
      };

      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () => `\`\`\`json\n${JSON.stringify(mockJson)}\n\`\`\``,
        },
      });

      (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: mockGenerateContent,
        }),
      }));

      const res = await generateCostAnalysis('Steel Reinforcement', 10, 'Ton', 55000);
      expect(res.isLiveAi).toBe(true);
      expect(res.targetRate).toBe(52000);
      expect(res.modelUsed).toBe('gemini-2.0-flash-lite');
      expect(res.pillars.material.percentage).toBe(60);

      const resNoQuote = await generateCostAnalysis('Steel Reinforcement');
      expect(resNoQuote.isLiveAi).toBe(true);
    });

    it('falls back to estimation if Gemini API call throws', async () => {
      process.env.GEMINI_API_KEY = 'AIzaSyKey';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: jest.fn().mockRejectedValue(new Error('Quota exceeded')),
        }),
      }));

      const res = await generateCostAnalysis('Failed Material', 5, 'Cum', 5000);
      expect(res.isLiveAi).toBe(false);
      expect(res.targetRate).toBe(Math.round(5000 * 0.88));
      consoleSpy.mockRestore();
    });
  });

  describe('generateCounterOffer', () => {
    it('uses fallback calculation when no API key is provided for round 1 and subsequent rounds', async () => {
      delete process.env.GEMINI_API_KEY;

      const round1 = await generateCounterOffer({
        prTitle: 'PR-1',
        itemName: 'Concrete M30',
        vendorQuoteRate: 5000,
        targetBenchmark: 4000,
        currentRound: 1,
      });
      expect(round1.isLiveAi).toBe(false);
      expect(round1.recommendedCounterRate).toBe(Math.round(4000 + 1000 * 0.35));
      expect(round1.counterRemarks).toContain('Reference AI MLEO');

      const round2 = await generateCounterOffer({
        prTitle: 'PR-1',
        itemName: 'Concrete M30',
        vendorQuoteRate: 5000,
        targetBenchmark: 4000,
        currentRound: 2,
        historySummary: 'Vendor offered 4800 in round 1',
      });
      expect(round2.recommendedCounterRate).toBe(Math.round(4000 + 1000 * 0.55));
    });

    it('uses live Gemini API to generate counter-offer when key is valid', async () => {
      process.env.GEMINI_API_KEY = 'AIzaSyKey';

      const mockResponse = {
        recommendedCounterRate: 4300,
        counterRemarks: 'Based on regional indices, 4300 is our fair price.',
        strategyAdvice: 'Hold firm on standard terms.',
      };

      (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => JSON.stringify(mockResponse),
            },
          }),
        }),
      }));

      const res = await generateCounterOffer({
        prTitle: 'PR-2',
        itemName: 'Chiller Unit',
        vendorQuoteRate: 500000,
        targetBenchmark: 400000,
        currentRound: 1,
        historySummary: 'First round quote received',
      });

      expect(res.isLiveAi).toBe(true);
      expect(res.recommendedCounterRate).toBe(4300);
      expect(res.counterRemarks).toBe('Based on regional indices, 4300 is our fair price.');
    });

    it('falls back to estimation if Gemini API call fails during counter-offer generation', async () => {
      process.env.GEMINI_API_KEY = 'AIzaSyKey';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: jest.fn().mockRejectedValue(new Error('Network error')),
        }),
      }));

      const res = await generateCounterOffer({
        prTitle: 'PR-3',
        itemName: 'Transformers',
        vendorQuoteRate: 20000,
        targetBenchmark: 15000,
        currentRound: 1,
      });

      expect(res.isLiveAi).toBe(false);
      expect(res.recommendedCounterRate).toBe(Math.round(15000 + 5000 * 0.35));
      consoleSpy.mockRestore();
    });
  });
});
