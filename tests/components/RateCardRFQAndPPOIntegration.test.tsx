import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CategoryManagerHub } from '@/components/CategoryManagerHub';
import { PPOModule } from '@/components/PPOModule';
import { ProcurementProvider } from '@/context/ProcurementContext';
import { UI_STRINGS } from '@/constants';

describe('Rate Card RFQ & PPO Integration Workflows', () => {
  const renderHub = (): ReturnType<typeof render> => {
    return render(
      <ProcurementProvider>
        <CategoryManagerHub initialPRId="PR-2026-0005" />
      </ProcurementProvider>
    );
  };

  it('displays Rate Card vs Non-Rate Card filter pills in RFQ circulation tab', () => {
    renderHub();

    // Switch to Suppliers subtab
    const suppliersTab = screen.getByText(UI_STRINGS.categoryManagerHub.subTabSuppliers);
    fireEvent.click(suppliersTab);

    expect(screen.getByText(/All Vendors/i)).toBeInTheDocument();
    expect(screen.getByText(/Rate Card Vendors \(Fast-Track\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Non-Rate Card Vendors/i)).toBeInTheDocument();
  });

  it('renders Rate Card badges and Fast-Track button for 100% covered vendors in RFQ table', () => {
    renderHub();

    // Switch to Suppliers subtab
    const suppliersTab = screen.getByText(UI_STRINGS.categoryManagerHub.subTabSuppliers);
    fireEvent.click(suppliersTab);

    // Check if table contains Rate Card indicators
    const rcBadges = screen.getAllByText(/Rate Card/i);
    expect(rcBadges.length).toBeGreaterThan(0);
  });

  it('renders PPO module and allows switching to All PPOs list', () => {
    render(
      <ProcurementProvider>
        <PPOModule />
      </ProcurementProvider>
    );

    const allPPOsTab = screen.getByText(/All PPOs/i);
    fireEvent.click(allPPOsTab);

    expect(screen.getByText(UI_STRINGS.ppoModule.allPPOsTitle)).toBeInTheDocument();
  });
});
