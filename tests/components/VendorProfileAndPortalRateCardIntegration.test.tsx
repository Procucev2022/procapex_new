import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VendorCategoryBadge } from '@/components/vendor-management/VendorCategoryBadge';
import { VendorCredibilityDrawer } from '@/components/vendor-management/VendorCredibilityDrawer';
import { VendorPortal } from '@/components/VendorPortal';
import { ProcurementContext } from '@/context/ProcurementContext';
import { SEED_RATE_CARD_AGREEMENTS } from '@/constants/rate-cards';
import { INITIAL_PROJECT_CATEGORIES } from '@/constants/budget';
import { calculateVendorCategoryRateCardCoverage } from '@/lib/rate-card-utils';
import type { ManagedVendor } from '@/types';

describe('Vendor Profile and Portal Rate Card Integration', () => {
  const mockGetCoverage = jest.fn((vendorId: string, category?: string) =>
    calculateVendorCategoryRateCardCoverage(
      vendorId,
      category,
      INITIAL_PROJECT_CATEGORIES,
      SEED_RATE_CARD_AGREEMENTS
    )
  );

  const mockVendor: ManagedVendor = {
    id: 'VND-001',
    name: 'DesignCraft Millworks & Interiors Pvt Ltd',
    category: 'INTERIOR',
    categories: ['INTERIOR'],
    subCategory: 'Custom joinery, counters & millwork',
    region: 'WEST',
    regionLabel: 'West (Mumbai / Pune / Gujarat)',
    rating: 4.9,
    reviewsCount: 28,
    isRateCard: true,
    rateCardCode: 'RC-2026-DES-01',
    rateCardStatus: 'Active Rate Card',
    contactPerson: 'Karan Mehra',
    gstin: '27AABCD1234F1Z5',
    city: 'Mumbai',
    leadTime: '12-15 Days',
    badgeText: 'Rate Card Partner',
    capacity: 'Enterprise',
    source: 'PROCAPX_PLATFORM',
    evaluationStatus: 'VERIFIED',
    ppoRatings: [],
    compositeRating: 4.9,
    totalPPOsCompleted: 12,
  };

  const mockContextValue: any = {
    rateCards: SEED_RATE_CARD_AGREEMENTS,
    projectCategories: INITIAL_PROJECT_CATEGORIES,
    getVendorCategoryRateCardCoverage: mockGetCoverage,
    managedVendors: [mockVendor],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('VendorCategoryBadge displays % of Rate Card coverage out of Standard BOQ for Rate Card suppliers', () => {
    render(
      <ProcurementContext.Provider value={mockContextValue}>
        <VendorCategoryBadge vendor={mockVendor} />
      </ProcurementContext.Provider>
    );

    // Shows 100% Std BOQ (6/6)
    expect(screen.getByText(/Rate Card: 100% Std BOQ/i)).toBeInTheDocument();
    expect(screen.getByText(/\(6\/6\)/i)).toBeInTheDocument();
  });

  it('VendorCredibilityDrawer renders Rate Card & Agreements tab and switches to it', () => {
    render(
      <ProcurementContext.Provider value={mockContextValue}>
        <VendorCredibilityDrawer
          isOpen={true}
          vendor={mockVendor}
          onClose={jest.fn()}
        />
      </ProcurementContext.Provider>
    );

    // Header displays coverage badge
    expect(screen.getByText(/Rate Card: 100% Std BOQ/i)).toBeInTheDocument();

    // Tab switcher contains Rate Card & Agreements
    const rateCardTabBtn = screen.getByRole('button', { name: /Rate Card & Agreements/i });
    expect(rateCardTabBtn).toBeInTheDocument();

    // Click tab to open Rate Card view
    fireEvent.click(rateCardTabBtn);

    // Verifies VendorProfileRateCardTab is rendered
    expect(screen.getByText(/Rate Card Reference & Contract Schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Fast-Track PPO Ready/i)).toBeInTheDocument();
  });

  it('VendorPortal renders Rate Card & Agreements tab for logged-in vendor', () => {
    render(
      <ProcurementContext.Provider value={mockContextValue}>
        <VendorPortal initialAuthenticated={true} />
      </ProcurementContext.Provider>
    );

    // Portal navigation tab bar contains Rate Card & Agreements
    const rateCardTabBtn = screen.getByRole('button', { name: /Rate Card & Agreements/i });
    expect(rateCardTabBtn).toBeInTheDocument();

    // Click tab to view rate cards
    fireEvent.click(rateCardTabBtn);

    // Verifies rate card reference schedule is displayed
    expect(screen.getByText(/Rate Card Reference & Contract Schedule/i)).toBeInTheDocument();
  });
});
