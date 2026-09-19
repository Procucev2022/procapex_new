import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CategoryManagerHub } from '@/components/CategoryManagerHub';
import { VendorPortal } from '@/components/VendorPortal';
import { ProcurementContext } from '@/context/ProcurementContext';
import { SEED_EAUCTIONS } from '@/constants/eauction';
import { INITIAL_PRS } from '@/constants/procurement';
import { INITIAL_CLIENT_VENDORS } from '@/constants/vendor-management';
import { UI_STRINGS } from '@/constants';

describe('E-Auction Integration (Buyer Negotiation Hub & Vendor Portal)', () => {
  const mockContextValue: any = {
    prs: INITIAL_PRS,
    managedVendors: INITIAL_CLIENT_VENDORS,
    eauctions: SEED_EAUCTIONS,
    getEAuctionByPRId: jest.fn(() => SEED_EAUCTIONS[0]),
    startEAuction: jest.fn(),
    pauseEAuction: jest.fn(),
    resumeEAuction: jest.fn(),
    extendEAuction: jest.fn(),
    concludeEAuction: jest.fn(),
    submitEAuctionBid: jest.fn(() => ({ isValid: true })),
    setEAuctionProxyFloor: jest.fn(),
    simulateNextCompetitiveBid: jest.fn(),
    awardEAuctionToL1: jest.fn(() => ({ winnerVendorId: 'CLT-VND-003', winningPrice: 4620000 })),
    checkPRRateCardCoverage: jest.fn(() => ({
      coveredItems: [],
      deltaItems: [],
      coveragePct: 0,
      allCategoryItemsCovered: false,
    })),
    getVendorCategoryRateCardCoverage: jest.fn(() => ({
      categoryCode: 'CAT-INTERIOR',
      categoryName: 'Interior Works',
      totalStandardBOQItems: 6,
      coveredCount: 6,
      coveragePct: 100,
      isFullyCovered: true,
      coveredStandardBOQItems: [],
      missingStandardBOQItems: [],
    })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('CategoryManagerHub negotiation tab renders E-Auction launch option and opens separate E-Auction page', () => {
    render(
      <ProcurementContext.Provider value={mockContextValue}>
        <CategoryManagerHub initialPRId="PR-2026-0005" />
      </ProcurementContext.Provider>
    );

    // Switch to Negotiation Tab (Tab 4)
    const negTabBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.categoryManagerHub.tabNegotiation, 'i') });
    fireEvent.click(negTabBtn);

    // Verify Launch E-Auction button exists
    const launchBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.eauction.launchEAuctionButton, 'i') });
    expect(launchBtn).toBeInTheDocument();

    // Click Launch E-Auction
    fireEvent.click(launchBtn);

    // Verify separate Buyer E-Auction Page has loaded
    expect(screen.getByText(UI_STRINGS.eauction.buyerConsoleTitle)).toBeInTheDocument();
    expect(screen.getByText(/Auction ID: AUC-2026-0005/i)).toBeInTheDocument();

    // Click Back to return to Negotiation Hub
    const backBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.eauction.backToNegotiationButton, 'i') });
    fireEvent.click(backBtn);

    // Verify returned to Negotiation Hub
    expect(screen.getByText(/Active Negotiation: PR-2026-0005/i)).toBeInTheDocument();
  });

  it('VendorPortal contains dedicated E-Auction tab and renders vendor participation arena', () => {
    render(
      <ProcurementContext.Provider value={mockContextValue}>
        <VendorPortal initialAuthenticated={true} />
      </ProcurementContext.Provider>
    );

    // Verify E-Auction tab button exists in vendor portal
    const eauctionTabBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.eauction.tabEAuctionArena, 'i') });
    expect(eauctionTabBtn).toBeInTheDocument();

    // Click E-Auction tab
    fireEvent.click(eauctionTabBtn);

    // Verify Vendor E-Auction Arena is displayed
    expect(screen.getByText(UI_STRINGS.eauction.vendorArenaTitle)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.eauction.quickBidLabel)).toBeInTheDocument();
  });
});
