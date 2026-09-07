import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BOQStudio } from '@/components/BOQStudio';

describe('BOQStudio Component', () => {
  const mockOnNavigateToCommercial = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial drawing scope (Counter Elevation D) and table line items', () => {
    render(
      <BOQStudio
        selectedPRId="PR-2026-0005"
        onNavigateToCommercial={mockOnNavigateToCommercial}
      />
    );

    expect(screen.getByText('BOQ Extraction by Drawing Name')).toBeInTheDocument();
    expect(screen.getByText('COUNTER ELEVATION D ONLY')).toBeInTheDocument();
    expect(screen.getByText('CNT-TOP-GRN20')).toBeInTheDocument();
    expect(screen.getByText('CNT-PLY-BWP18')).toBeInTheDocument();
  });

  it('extracts BOQ for Foundation Raft scope and handles unknown drawing name', () => {
    render(
      <BOQStudio
        selectedPRId="PR-2026-0005"
        onNavigateToCommercial={mockOnNavigateToCommercial}
      />
    );

    const input = screen.getByPlaceholderText('e.g. Counter Elevation D');

    // Test 'raft' keyword
    fireEvent.change(input, { target: { value: 'Raft Slabs' } });
    const extractBtn = screen.getByRole('button', { name: /Extract for this Drawing Name/i });
    fireEvent.click(extractBtn);
    expect(screen.getByText('FOUNDATION RAFT ONLY')).toBeInTheDocument();

    // Test 'elevation d' keyword without 'counter'
    fireEvent.change(input, { target: { value: 'Elevation D Details' } });
    fireEvent.click(extractBtn);
    expect(screen.getByText('COUNTER ELEVATION D ONLY')).toBeInTheDocument();

    // Test 'foundation' keyword without 'raft'
    fireEvent.change(input, { target: { value: 'Deep Foundation Work' } });
    fireEvent.click(extractBtn);
    expect(screen.getByText('FOUNDATION RAFT ONLY')).toBeInTheDocument();

    // Unknown name should not change current scope
    fireEvent.change(input, { target: { value: 'Electrical Schematic' } });
    fireEvent.click(extractBtn);
    expect(screen.getByText('FOUNDATION RAFT ONLY')).toBeInTheDocument();
  });

  it('switches scopes using quick presets', () => {
    render(
      <BOQStudio
        selectedPRId="PR-2026-0005"
        onNavigateToCommercial={mockOnNavigateToCommercial}
      />
    );

    const raftPreset = screen.getByRole('button', { name: 'Foundation Raft Reinforcement' });
    fireEvent.click(raftPreset);
    expect(screen.getByText('FOUNDATION RAFT ONLY')).toBeInTheDocument();

    const counterPreset = screen.getByRole('button', { name: 'Counter Elevation D' });
    fireEvent.click(counterPreset);
    expect(screen.getByText('COUNTER ELEVATION D ONLY')).toBeInTheDocument();
  });

  it('deletes an item from the BOQ table', () => {
    render(
      <BOQStudio
        selectedPRId="PR-2026-0005"
        onNavigateToCommercial={mockOnNavigateToCommercial}
      />
    );

    expect(screen.getByText('CNT-TOP-GRN20')).toBeInTheDocument();
    const deleteButtons = screen.getAllByRole('button').filter(b => b.className.includes('text-rose-500'));
    expect(deleteButtons.length).toBeGreaterThan(0);

    fireEvent.click(deleteButtons[0]);
    expect(screen.queryByText('CNT-TOP-GRN20')).not.toBeInTheDocument();
  });

  it('opens and closes the technical specs sheet modal', () => {
    render(
      <BOQStudio
        selectedPRId="PR-2026-0005"
        onNavigateToCommercial={mockOnNavigateToCommercial}
      />
    );

    const specsButtons = screen.getAllByRole('button', { name: /Specs/i });
    fireEvent.click(specsButtons[0]);

    expect(screen.getByText(/Technical Specifications/i)).toBeInTheDocument();

    // Close via close button
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Technical Specifications/i)).not.toBeInTheDocument();

    // Reopen and close via ✕ button
    fireEvent.click(specsButtons[0]);
    const xBtn = screen.getByRole('button', { name: '✕' });
    fireEvent.click(xBtn);
    expect(screen.queryByText(/Technical Specifications/i)).not.toBeInTheDocument();

    // Switch to Foundation Raft and open specs on unpriced item (FND-FRM-PLY12)
    const raftPreset = screen.getByRole('button', { name: 'Foundation Raft Reinforcement' });
    fireEvent.click(raftPreset);
    const raftSpecsButtons = screen.getAllByRole('button', { name: /Specs/i });
    fireEvent.click(raftSpecsButtons[raftSpecsButtons.length - 1]);
    expect(screen.getByText(/Technical Specifications/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  });

  it('triggers commercial check navigation', () => {
    render(
      <BOQStudio
        selectedPRId="PR-2026-0005"
        onNavigateToCommercial={mockOnNavigateToCommercial}
      />
    );

    const navBtn = screen.getByRole('button', { name: /Validate & Start Commercial Check/i });
    fireEvent.click(navBtn);
    expect(mockOnNavigateToCommercial).toHaveBeenCalled();
  });
});
