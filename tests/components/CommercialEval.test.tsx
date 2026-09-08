import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommercialEval } from '@/components/CommercialEval';
import { UI_STRINGS } from '@/constants';

describe('CommercialEval Component', () => {
  const mockOnNavigateToAICost = jest.fn();
  const mockOnNavigateToPPO = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders 4-way commercial evaluation cards and matrix table', () => {
    render(
      <CommercialEval
        onNavigateToAICost={mockOnNavigateToAICost}
        onNavigateToPPO={mockOnNavigateToPPO}
      />
    );

    expect(screen.getByText(UI_STRINGS.commercialEval.title)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.commercialEval.card1)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.commercialEval.card2)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.commercialEval.card3)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.commercialEval.card4)).toBeInTheDocument();

    expect(screen.getByText('CNT-TOP-GRN20')).toBeInTheDocument();
    expect(screen.getByText('CNT-SKT-SS304')).toBeInTheDocument();
  });

  it('handles navigation to PPO for acceptable variance items', () => {
    render(
      <CommercialEval
        onNavigateToAICost={mockOnNavigateToAICost}
        onNavigateToPPO={mockOnNavigateToPPO}
      />
    );

    const ppoBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.commercialEval.proceedToPPO, 'i') });
    expect(ppoBtn).toBeInTheDocument();
    fireEvent.click(ppoBtn);

    expect(mockOnNavigateToPPO).toHaveBeenCalled();
  });

  it('handles navigation to AI Costing for high-variance items, footer, and decision banner', () => {
    render(
      <CommercialEval
        onNavigateToAICost={mockOnNavigateToAICost}
        onNavigateToPPO={mockOnNavigateToPPO}
      />
    );

    // Row button
    const invokeAiButtons = screen.getAllByRole('button', { name: new RegExp(UI_STRINGS.commercialEval.invokeAICosting, 'i') });
    expect(invokeAiButtons.length).toBeGreaterThan(0);
    fireEvent.click(invokeAiButtons[0]);
    expect(mockOnNavigateToAICost).toHaveBeenCalledTimes(1);

    // Footer button
    const footerBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.commercialEval.detailedAnalysis, 'i') });
    fireEvent.click(footerBtn);
    expect(mockOnNavigateToAICost).toHaveBeenCalledTimes(2);

    // Banner button
    const bannerBtn = screen.getByRole('button', { name: /Open AI Cost Analysis & MLEO/i });
    fireEvent.click(bannerBtn);
    expect(mockOnNavigateToAICost).toHaveBeenCalledTimes(3);
  });
});
