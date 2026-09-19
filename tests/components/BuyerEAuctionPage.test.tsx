import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BuyerEAuctionPage } from '@/components/eauction/BuyerEAuctionPage';
import { ProcurementContext } from '@/context/ProcurementContext';
import { SEED_EAUCTIONS } from '@/constants/eauction';
import { UI_STRINGS } from '@/constants';

describe('BuyerEAuctionPage Component', () => {
  const mockStart = jest.fn();
  const mockPause = jest.fn();
  const mockResume = jest.fn();
  const mockExtend = jest.fn();
  const mockConclude = jest.fn();
  const mockSimulate = jest.fn();
  const mockAward = jest.fn(() => ({ winnerVendorId: 'CLT-VND-003', winningPrice: 4620000 }));
  const mockBack = jest.fn();
  const mockAwardToPPO = jest.fn();

  const mockContextValue: any = {
    eauctions: SEED_EAUCTIONS,
    getEAuctionByPRId: jest.fn(() => SEED_EAUCTIONS[0]),
    startEAuction: mockStart,
    pauseEAuction: mockPause,
    resumeEAuction: mockResume,
    extendEAuction: mockExtend,
    concludeEAuction: mockConclude,
    simulateNextCompetitiveBid: mockSimulate,
    awardEAuctionToL1: mockAward,
  };

  const renderComponent = () => {
    return render(
      <ProcurementContext.Provider value={mockContextValue}>
        <BuyerEAuctionPage
          prId="PR-2026-0005"
          onBackToNegotiation={mockBack}
          onAwardToPPO={mockAwardToPPO}
        />
      </ProcurementContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Buyer Command Center with header, countdown timer, and KPIs', () => {
    renderComponent();

    expect(screen.getByText(UI_STRINGS.eauction.buyerConsoleTitle)).toBeInTheDocument();
    expect(screen.getByText(/Auction ID: AUC-2026-0005/i)).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.eauction.kpiBaselineBudget)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.eauction.kpiCurrentL1)).toBeInTheDocument();
  });

  it('triggers Start Live Auction and Back navigation', () => {
    renderComponent();

    const startBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.eauction.startAuctionButton, 'i') });
    fireEvent.click(startBtn);
    expect(mockStart).toHaveBeenCalledWith('AUC-2026-0005');

    const backBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.eauction.backToNegotiationButton, 'i') });
    fireEvent.click(backBtn);
    expect(mockBack).toHaveBeenCalled();
  });

  it('renders leaderboard with all participating vendors and ranks', () => {
    renderComponent();

    expect(screen.getByText(UI_STRINGS.eauction.leaderboardTitle)).toBeInTheDocument();
    expect(screen.getAllByText('Rao Interior works')[0]).toBeInTheDocument();
    expect(screen.getAllByText('DesignCraft Millworks & Interiors Pvt Ltd')[0]).toBeInTheDocument();
    expect(screen.getByText('L1 LEADER')).toBeInTheDocument();
  });
});
