import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VendorEAuctionPage } from '@/components/eauction/VendorEAuctionPage';
import { ProcurementContext } from '@/context/ProcurementContext';
import { SEED_EAUCTIONS } from '@/constants/eauction';
import { UI_STRINGS } from '@/constants';

describe('VendorEAuctionPage Component', () => {
  const liveSession = {
    ...SEED_EAUCTIONS[0],
    status: 'LIVE' as const,
  };

  const mockSubmitBid = jest.fn(() => ({ isValid: true }));
  const mockSetProxy = jest.fn();

  const mockContextValue: any = {
    eauctions: [liveSession],
    getEAuctionByPRId: jest.fn(() => liveSession),
    submitEAuctionBid: mockSubmitBid,
    setEAuctionProxyFloor: mockSetProxy,
  };

  const renderComponent = (vendorId: string, vendorName: string) => {
    return render(
      <ProcurementContext.Provider value={mockContextValue}>
        <VendorEAuctionPage
          vendorId={vendorId}
          vendorName={vendorName}
          prId="PR-2026-0005"
        />
      </ProcurementContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders L1 leading banner when vendor is Rank 1', () => {
    renderComponent('CLT-VND-003', 'Rao Interior works');

    expect(screen.getByText(UI_STRINGS.eauction.vendorStandingLeading)).toBeInTheDocument();
    expect(screen.getByText('Rao Interior works (CLT-VND-003)')).toBeInTheDocument();
  });

  it('renders outbid banner when vendor is Rank 2+', () => {
    renderComponent('VND-001', 'DesignCraft Millworks & Interiors Pvt Ltd');

    expect(screen.getByText(/YOU ARE OUTBID \(RANK #2\)/i)).toBeInTheDocument();
    expect(screen.getByText('DesignCraft Millworks & Interiors Pvt Ltd (VND-001)')).toBeInTheDocument();
  });

  it('enforces legal declaration before submitting bid', () => {
    renderComponent('VND-001', 'DesignCraft Millworks & Interiors Pvt Ltd');

    // Click quick bid without checking declaration
    const minDecrementBtn = screen.getByRole('button', { name: /Min Decrement/i });
    fireEvent.click(minDecrementBtn);

    expect(
      screen.getByText(/Please confirm the legal declaration checkbox/i)
    ).toBeInTheDocument();
    expect(mockSubmitBid).not.toHaveBeenCalled();

    // Check declaration and click again
    const checkbox = screen.getByLabelText(UI_STRINGS.eauction.bidConfirmationDeclaration);
    fireEvent.click(checkbox);
    fireEvent.click(minDecrementBtn);

    expect(mockSubmitBid).toHaveBeenCalledWith({
      auctionId: 'AUC-2026-0005',
      vendorId: 'VND-001',
      bidAmount: 4755000,
    });
  });

  it('sets proxy auto-bid floor price', () => {
    renderComponent('VND-001', 'DesignCraft Millworks & Interiors Pvt Ltd');

    const floorInput = screen.getByPlaceholderText('e.g. 4200000');
    fireEvent.change(floorInput, { target: { value: '4300000' } });

    const saveBtn = screen.getByRole('button', { name: UI_STRINGS.eauction.saveAutoBidButton });
    fireEvent.click(saveBtn);

    expect(mockSetProxy).toHaveBeenCalledWith({
      auctionId: 'AUC-2026-0005',
      vendorId: 'VND-001',
      floorPrice: 4300000,
    });
  });
});
