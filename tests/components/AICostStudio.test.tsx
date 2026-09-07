import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AICostStudio } from '@/components/AICostStudio';

describe('AICostStudio Component', () => {
  const mockOnNavigateToNegotiation = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/api/ai/status')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            model: 'gemini 3.5 flash lite',
            isConfigured: true,
            message: 'Connected',
          }),
        } as any);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          targetRate: 4300,
          maxLimit: 4450,
          pillars: {
            material: { percentage: 55, cost: 2365, description: 'Aggregates' },
            labour: { percentage: 15, cost: 645, description: 'Crew' },
            equipment: { percentage: 18, cost: 774, description: 'Mixer' },
            overheads: { percentage: 12, cost: 516, description: 'Margin' },
          },
          inflators: [{ title: 'Transit Surcharge', description: 'Fuel index' }],
          negotiationScripts: [{ title: 'Argument 1', argument: 'Volume discount' }],
          modelUsed: 'gemini 3.5 flash lite',
        }),
      } as any);
    });
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('renders initial state and fetches AI status on mount', async () => {
    await act(async () => {
      render(<AICostStudio onNavigateToNegotiation={mockOnNavigateToNegotiation} />);
    });

    expect(screen.getByText('Bottom-Up MLEO Cost Analysis')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('gemini 3.5 flash lite')).toBeInTheDocument();
    });
  });

  it('handles error in status fetch gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    global.fetch = jest.fn().mockRejectedValue(new Error('Status fetch failed'));

    await act(async () => {
      render(<AICostStudio onNavigateToNegotiation={mockOnNavigateToNegotiation} />);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ui/AICostStudio]'),
        'Failed to load AI status',
        expect.anything()
      );
    });
    consoleSpy.mockRestore();
  });

  it('allows selecting preset items and updating custom inputs, quantity, uom, quotedRate, targetRate, maxLimit', async () => {
    await act(async () => {
      render(<AICostStudio onNavigateToNegotiation={mockOnNavigateToNegotiation} />);
    });

    // Select preset
    const presetBtn = screen.getByRole('button', { name: 'TMT Reinforcement Steel Bars Fe500D 25mm' });
    fireEvent.click(presetBtn);

    const descInput = screen.getByDisplayValue('TMT Reinforcement Steel Bars Fe500D 25mm');
    expect(descInput).toBeInTheDocument();

    // Type custom item
    fireEvent.change(descInput, { target: { value: 'Custom Granite Slabs' } });
    expect(screen.getByDisplayValue('Custom Granite Slabs')).toBeInTheDocument();

    // Quantity change and empty fallback
    const qtyInput = screen.getByDisplayValue('150');
    fireEvent.change(qtyInput, { target: { value: '200' } });
    expect(screen.getByDisplayValue('200')).toBeInTheDocument();
    fireEvent.change(qtyInput, { target: { value: '' } });

    // UOM change
    const uomInput = screen.getByDisplayValue('Ton');
    fireEvent.change(uomInput, { target: { value: 'Kg' } });
    expect(screen.getByDisplayValue('Kg')).toBeInTheDocument();

    // Quoted rate change and empty fallback
    const quoteInput = screen.getByDisplayValue('54000');
    fireEvent.change(quoteInput, { target: { value: '55000' } });
    expect(screen.getByDisplayValue('55000')).toBeInTheDocument();
    fireEvent.change(quoteInput, { target: { value: '' } });

    // Target rate change
    const targetInput = screen.getByDisplayValue('4350');
    fireEvent.change(targetInput, { target: { value: '4100' } });
    expect(screen.getByDisplayValue('4100')).toBeInTheDocument();

    // Max limit change
    const maxInput = screen.getByDisplayValue('4500');
    fireEvent.change(maxInput, { target: { value: '4250' } });
    expect(screen.getByDisplayValue('4250')).toBeInTheDocument();
  });

  it('navigates to negotiation hub on button click', async () => {
    await act(async () => {
      render(<AICostStudio onNavigateToNegotiation={mockOnNavigateToNegotiation} />);
    });

    const navBtn = screen.getByRole('button', { name: /Send to Negotiation Hub/i });
    fireEvent.click(navBtn);

    expect(mockOnNavigateToNegotiation).toHaveBeenCalled();
  });

  it('runs Gemini AI analysis successfully and updates MLEO breakdown', async () => {
    await act(async () => {
      render(<AICostStudio onNavigateToNegotiation={mockOnNavigateToNegotiation} />);
    });

    const runBtn = screen.getByRole('button', { name: /Run Gemini AI/i });
    await act(async () => {
      fireEvent.click(runBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Live Cost Deconstruction Complete/i)).toBeInTheDocument();
    });
  });

  it('handles response without optional fields gracefully to exercise all false branches', async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/api/ai/status')) {
        return Promise.resolve({ ok: true, json: async () => ({}) } as any);
      }
      return Promise.resolve({ ok: true, json: async () => ({}) } as any);
    });

    await act(async () => {
      render(<AICostStudio onNavigateToNegotiation={mockOnNavigateToNegotiation} />);
    });

    const runBtn = screen.getByRole('button', { name: /Run Gemini AI/i });
    await act(async () => {
      fireEvent.click(runBtn);
    });
  });

  it('handles API error when running analysis', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/api/ai/status')) {
        return Promise.resolve({ ok: true, json: async () => ({}) } as any);
      }
      return Promise.resolve({ ok: false, status: 500 } as any);
    });

    await act(async () => {
      render(<AICostStudio onNavigateToNegotiation={mockOnNavigateToNegotiation} />);
    });

    const runBtn = screen.getByRole('button', { name: /Run Gemini AI/i });
    await act(async () => {
      fireEvent.click(runBtn);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ui/AICostStudio]'),
        'Error running Gemini cost analysis',
        expect.anything()
      );
    });
    consoleSpy.mockRestore();
  });
});
