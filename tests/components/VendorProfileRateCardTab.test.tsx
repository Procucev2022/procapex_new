import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VendorProfileRateCardTab } from '@/components/rate-card/VendorProfileRateCardTab';
import { ProcurementContext } from '@/context/ProcurementContext';
import { SEED_RATE_CARD_AGREEMENTS } from '@/constants/rate-cards';
import { INITIAL_PROJECT_CATEGORIES } from '@/constants/budget';
import { calculateVendorCategoryRateCardCoverage } from '@/lib/rate-card-utils';

describe('VendorProfileRateCardTab Component', () => {
  const mockSellerRespond = jest.fn();
  const mockFinalize = jest.fn();
  const mockAddItem = jest.fn();
  const mockGetCoverage = jest.fn((vendorId: string, category?: string) =>
    calculateVendorCategoryRateCardCoverage(
      vendorId,
      category,
      INITIAL_PROJECT_CATEGORIES,
      SEED_RATE_CARD_AGREEMENTS
    )
  );

  const mockContextValue: any = {
    rateCards: SEED_RATE_CARD_AGREEMENTS,
    projectCategories: INITIAL_PROJECT_CATEGORIES,
    getVendorCategoryRateCardCoverage: mockGetCoverage,
    sellerRespondRateCardProposal: mockSellerRespond,
    finalizeRateCard: mockFinalize,
    addItemToRateCard: mockAddItem,
  };

  const renderComponent = (props: {
    vendorId: string;
    vendorName: string;
    vendorCategory: string;
    isVendorPortal?: boolean;
    onConfirmRateCard?: (id: string) => void;
  }) => {
    return render(
      <ProcurementContext.Provider value={mockContextValue}>
        <VendorProfileRateCardTab {...props} />
      </ProcurementContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Standard BOQ Coverage Hero Card with 100% for VND-001', () => {
    renderComponent({
      vendorId: 'VND-001',
      vendorName: 'DesignCraft Millworks',
      vendorCategory: 'INTERIOR',
    });

    // Coverage percentage out of Standard BOQ
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Rate Card Coverage')).toBeInTheDocument();
    expect(screen.getByText(/100% Fast-Track PPO Ready/i)).toBeInTheDocument();
    expect(screen.getByText(/Empanelled 6 of 6 Standard BOQ items/i)).toBeInTheDocument();
  });

  it('renders Rate Card Reference line items and finalized agreement details', () => {
    renderComponent({
      vendorId: 'VND-001',
      vendorName: 'DesignCraft Millworks',
      vendorCategory: 'INTERIOR',
    });

    // Reference table
    expect(screen.getByText(/Rate Card Reference & Contract Schedule/i)).toBeInTheDocument();
    expect(screen.getByText('CNT-TOP-GRN20')).toBeInTheDocument();
    expect(screen.getByText('CNT-PLY-BWP18')).toBeInTheDocument();

    // Finalized confirmation banner
    expect(screen.getByText(/Active & Ratified/i)).toBeInTheDocument();
    expect(screen.getByText(/has been formally confirmed and ratified/i)).toBeInTheDocument();
  });

  it('renders acceptance confirmation form and triggers confirmation for pending/counter-offered rate cards', () => {
    const onConfirmMock = jest.fn();
    renderComponent({
      vendorId: 'VND-002',
      vendorName: 'Apex Modular Systems',
      vendorCategory: 'INTERIOR',
      onConfirmRateCard: onConfirmMock,
    });

    // Coverage should be 50% (3/6 items)
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText(/3 Item\(s\) Remaining/i)).toBeInTheDocument();

    // Confirmation action button
    const confirmBtn = screen.getByRole('button', { name: /Accept & Confirm Rate Card/i });
    expect(confirmBtn).toBeInTheDocument();

    fireEvent.click(confirmBtn);
    expect(onConfirmMock).toHaveBeenCalledWith('RC-2026-PROP-002');
  });

  it('renders missing Standard BOQ items and allows adding them into Rate Card', () => {
    renderComponent({
      vendorId: 'VND-002',
      vendorName: 'Apex Modular Systems',
      vendorCategory: 'INTERIOR',
    });

    // Missing Standard BOQ items title
    expect(screen.getByText(/Missing Standard BOQ Items in Category/i)).toBeInTheDocument();

    // Click "+ Empanel into Rate Card"
    const empanelButtons = screen.getAllByRole('button', { name: /\+ Empanel into Rate Card/i });
    expect(empanelButtons.length).toBeGreaterThan(0);

    fireEvent.click(empanelButtons[0]);
    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        vendorId: 'VND-002',
        itemCode: expect.any(String),
        agreedRate: expect.any(Number),
      })
    );
  });
});
