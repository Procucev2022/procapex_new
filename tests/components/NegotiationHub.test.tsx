import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NegotiationHub } from '@/components/NegotiationHub';
import { useProcurement } from '@/context/ProcurementContext';
import { UI_STRINGS } from '@/constants';

jest.mock('@/context/ProcurementContext', () => ({
  useProcurement: jest.fn(),
}));

describe('NegotiationHub Component', () => {
  const mockAddNegotiationRound = jest.fn();

  const sampleNegotiations = {
    'PR-2026-0005': [
      {
        round: 1,
        type: 'VENDOR_INITIAL_BID',
        user: 'Vendor 1 (VND-001)',
        rate: 162260,
        remarks: 'Initial quote',
        timestamp: '2026-09-06 10:30',
      },
      {
        round: 2,
        type: 'BUYER_COUNTER',
        user: 'Buyer',
        rate: 148500,
        remarks: 'Counter offer',
        timestamp: '2026-09-06 14:00',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useProcurement as jest.Mock).mockReturnValue({
      negotiations: sampleNegotiations,
      addNegotiationRound: mockAddNegotiationRound,
    });
  });

  it('renders negotiation hub with active rounds timeline', () => {
    render(<NegotiationHub />);

    expect(screen.getByText(UI_STRINGS.negotiationHub.title)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.negotiationHub.timelineTitle)).toBeInTheDocument();
    expect(screen.getByText('Initial quote')).toBeInTheDocument();
    expect(screen.getByText('Counter offer')).toBeInTheDocument();
  });

  it('switches active negotiation PR and falls back to default round when PR has no history', () => {
    render(<NegotiationHub />);

    const prSelect = screen.getByDisplayValue(/PR-2026-0005/i);
    fireEvent.change(prSelect, { target: { value: 'PR-2026-0002' } });

    expect(screen.getByText('Initial competitive bid submitted against tender specifications.')).toBeInTheDocument();
  });

  it('submits a counter offer and changes action type', () => {
    render(<NegotiationHub />);

    const actionSelect = screen.getByDisplayValue(/Buyer Sends Counter-Offer/i);
    fireEvent.change(actionSelect, { target: { value: 'VENDOR_REVISION' } });

    const rateInput = screen.getByPlaceholderText('e.g. 148500');
    fireEvent.change(rateInput, { target: { value: '145000' } });

    const remarksInput = screen.getByPlaceholderText(/Reference AI cost model/i);
    fireEvent.change(remarksInput, { target: { value: 'Volume concession' } });

    const submitBtn = screen.getByRole('button', { name: /Send Counter-Offer to Vendor/i });
    fireEvent.click(submitBtn);

    expect(mockAddNegotiationRound).toHaveBeenCalledWith(
      'PR-2026-0005',
      145000,
      'Volume concession',
      'VENDOR_REVISION'
    );
  });

  it('does not submit when rate is cleared', () => {
    render(<NegotiationHub />);

    const rateInput = screen.getByPlaceholderText('e.g. 148500');
    fireEvent.change(rateInput, { target: { value: '' } });

    const form = rateInput.closest('form')!;
    fireEvent.submit(form);

    expect(mockAddNegotiationRound).not.toHaveBeenCalled();
  });

  it('simulates receiving 2nd BAFO quote', () => {
    render(<NegotiationHub />);

    const bafoBtn = screen.getByRole('button', { name: /Ingest 2nd Quote/i });
    fireEvent.click(bafoBtn);

    expect(mockAddNegotiationRound).toHaveBeenCalledWith(
      'PR-2026-0005',
      148500,
      expect.stringContaining('Conceded volume discount'),
      'VENDOR_2ND_QUOTE_BAFO'
    );
  });

  it('calls Gemini tactical assistant and populates counter rate and remarks', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        recommendedCounterRate: 142000,
        counterRemarks: 'Gemini calculated counter offer.',
      }),
    } as any);

    render(<NegotiationHub />);

    const geminiBtn = screen.getByRole('button', { name: /Draft Smart Counter-Offer/i });
    fireEvent.click(geminiBtn);

    await waitFor(() => {
      expect(screen.getByDisplayValue('142000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Gemini calculated counter offer.')).toBeInTheDocument();
    });

    global.fetch = originalFetch;
  });

  it('handles Gemini response with missing optional fields or non-ok response', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as any)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as any);

    render(<NegotiationHub />);

    const geminiBtn = screen.getByRole('button', { name: /Draft Smart Counter-Offer/i });
    fireEvent.click(geminiBtn);
    fireEvent.click(geminiBtn);

    global.fetch = originalFetch;
  });

  it('handles Gemini tactical assistant network failure', async () => {
    const originalFetch = global.fetch;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    render(<NegotiationHub />);

    const geminiBtn = screen.getByRole('button', { name: /Draft Smart Counter-Offer/i });
    fireEvent.click(geminiBtn);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ui/NegotiationHub]'),
        'Failed to generate counter tactic',
        expect.anything()
      );
    });

    consoleSpy.mockRestore();
    global.fetch = originalFetch;
  });
});
