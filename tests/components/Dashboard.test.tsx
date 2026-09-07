import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from '@/components/Dashboard';
import { useProcurement } from '@/context/ProcurementContext';

jest.mock('@/context/ProcurementContext', () => ({
  useProcurement: jest.fn(),
}));

describe('Dashboard Component', () => {
  const mockOnNavigate = jest.fn();
  const mockResetToSampleData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useProcurement as jest.Mock).mockReturnValue({
      prs: [{ id: 'PR-1' }, { id: 'PR-2' }],
      pos: [{ id: 'PO-1' }],
      activeTenant: { name: 'L&T Construction', project: 'Noida Airport' },
      resetToSampleData: mockResetToSampleData,
    });
  });

  it('renders welcome banner and KPI cards with tenant information', () => {
    render(<Dashboard onNavigate={mockOnNavigate} />);

    expect(screen.getByText('L&T Construction – Sourcing Command')).toBeInTheDocument();
    expect(screen.getByText('Noida Airport')).toBeInTheDocument();
    expect(screen.getByText('Active PRs')).toBeInTheDocument();
    expect(screen.getByText('Work Orders Issued')).toBeInTheDocument();
  });

  it('falls back to default title when activeTenant is undefined', () => {
    (useProcurement as jest.Mock).mockReturnValue({
      prs: [],
      pos: [],
      activeTenant: null,
      resetToSampleData: mockResetToSampleData,
    });

    render(<Dashboard onNavigate={mockOnNavigate} />);
    expect(screen.getByText('Procurement & AI Cost Intelligence Hub')).toBeInTheDocument();
  });

  it('handles pipeline stage card navigations', () => {
    render(<Dashboard onNavigate={mockOnNavigate} />);

    fireEvent.click(screen.getByText('1. PR & BOQ'));
    expect(mockOnNavigate).toHaveBeenCalledWith('prs');

    fireEvent.click(screen.getByText('2. Commercial Eval'));
    expect(mockOnNavigate).toHaveBeenCalledWith('commercial');

    fireEvent.click(screen.getByText('3. Negotiation'));
    expect(mockOnNavigate).toHaveBeenCalledWith('negotiation');

    fireEvent.click(screen.getByText('4. PPO & PO'));
    expect(mockOnNavigate).toHaveBeenCalledWith('ppo');
  });

  it('handles action alerts navigation links', () => {
    render(<Dashboard onNavigate={mockOnNavigate} />);

    const reviewCommBtn = screen.getByRole('button', { name: /Review Commercial Check/i });
    fireEvent.click(reviewCommBtn);
    expect(mockOnNavigate).toHaveBeenCalledWith('commercial');

    const reviewPpoBtn = screen.getByRole('button', { name: /Review & Approve PPO/i });
    fireEvent.click(reviewPpoBtn);
    expect(mockOnNavigate).toHaveBeenCalledWith('ppo');
  });

  it('triggers reset to sample baseline data', () => {
    render(<Dashboard onNavigate={mockOnNavigate} />);

    const resetBtn = screen.getByRole('button', { name: /Reset to Sample Baseline Data/i });
    fireEvent.click(resetBtn);
    expect(mockResetToSampleData).toHaveBeenCalled();
  });
});
