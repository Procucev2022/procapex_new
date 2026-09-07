/**
 * @jest-environment node
 */
import { GET } from '@/app/api/ai/status/route';
import { isGeminiConfigured, getConfiguredModelName } from '@/lib/gemini';

jest.mock('@/lib/gemini', () => ({
  isGeminiConfigured: jest.fn(),
  getConfiguredModelName: jest.fn(),
}));

describe('GET /api/ai/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return status when Gemini is configured', async () => {
    (isGeminiConfigured as jest.Mock).mockReturnValue(true);
    (getConfiguredModelName as jest.Mock).mockReturnValue('gemini 3.5 flash lite');

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.provider).toBe('Gemini');
    expect(json.model).toBe('gemini 3.5 flash lite');
    expect(json.isConfigured).toBe(true);
    expect(json.message).toContain('Connected to Gemini');
  });

  it('should return status when Gemini is not configured', async () => {
    (isGeminiConfigured as jest.Mock).mockReturnValue(false);
    (getConfiguredModelName as jest.Mock).mockReturnValue('gemini-2.0-flash-lite');

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.isConfigured).toBe(false);
    expect(json.message).toContain('Using Gemini Demo Mode');
  });
});
