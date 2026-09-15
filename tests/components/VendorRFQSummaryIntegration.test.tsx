import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ProcurementProvider, useProcurement } from '@/context/ProcurementContext';
import { VendorPortal } from '@/components/VendorPortal';
import { UI_STRINGS } from '@/constants';

// Helper component that triggers circulateRFQ programmatically to test dynamic updates
const RFQDispatchTrigger: React.FC<{
  prId: string;
  vendors: string[];
  closureDate?: string;
}> = ({ prId, vendors, closureDate }) => {
  const { circulateRFQ } = useProcurement();
  return (
    <button
      data-testid="trigger-circulate-rfq"
      onClick={() => circulateRFQ(prId, vendors, closureDate)}
    >
      Circulate Tender
    </button>
  );
};

describe('Vendor RFQ Summary Integration - Rao Interiors and Dynamic Tender Circulation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    window.sessionStorage.setItem('procapex_vendor_authenticated', 'true');
    window.localStorage.clear();
  });

  it('displays RFQ-2026-0005 immediately in Rao Interiors (CLT-VND-003) RFQ Summary without fail', () => {
    const { container } = render(
      <ProcurementProvider>
        <VendorPortal initialAuthenticated={true} />
      </ProcurementProvider>
    );

    // Switch vendor to Rao Interior works (CLT-VND-003)
    const vendorSelects = container.querySelectorAll('select');
    const vendorSelect = vendorSelects[0];
    fireEvent.change(vendorSelect, { target: { value: 'CLT-VND-003' } });

    // Verify vendor identity displays Rao Interior works
    expect(screen.getAllByText(/Rao Interior works/i).length).toBeGreaterThan(0);

    // Verify RFQ Summary tab displays RFQ-2026-0005 for Rao Interiors
    expect(screen.getAllByText('RFQ-2026-0005').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Reception Counter/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Godrej Woods, Tower C/i).length).toBeGreaterThan(0);

    // Verify Pending Acceptance status and Accept button exist
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.pendingAcceptance).length).toBeGreaterThan(0);
    const acceptBtn = screen.getAllByRole('button', { name: UI_STRINGS.vendorPortal.acceptRfq })[0];
    expect(acceptBtn).toBeInTheDocument();

    // Accept RFQ
    fireEvent.click(acceptBtn);

    // Verification: status changes to Active Bidder
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.activeBidder).length).toBeGreaterThan(0);
  });

  it('immediately updates RFQ summary when a new RFQ is circulated for any vendor dynamically', async () => {
    const { container } = render(
      <ProcurementProvider>
        <RFQDispatchTrigger
          prId="PR-2026-0003"
          vendors={['CLT-VND-003', 'VND-002']}
          closureDate="2026-10-15"
        />
        <VendorPortal initialAuthenticated={true} />
      </ProcurementProvider>
    );

    // Switch to Rao Interior works
    const vendorSelect = container.querySelectorAll('select')[0];
    fireEvent.change(vendorSelect, { target: { value: 'CLT-VND-003' } });

    // Initially RFQ-2026-0005 is visible
    expect(screen.getAllByText('RFQ-2026-0005').length).toBeGreaterThan(0);

    // Trigger RFQ circulation for PR-2026-0003 nominating Rao Interior works
    const triggerBtn = screen.getByTestId('trigger-circulate-rfq');
    await act(async () => {
      fireEvent.click(triggerBtn);
    });

    // The newly circulated RFQ (RFQ-2026-0003) immediately appears in Rao Interiors RFQ Summary table
    expect(screen.getAllByText('RFQ-2026-0003').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Central HVAC Water-Cooled Chillers/i).length).toBeGreaterThan(0);
  });

  it('allows clicking Quote Now in summary table to navigate to Tab 2 for that RFQ', () => {
    const { container } = render(
      <ProcurementProvider>
        <VendorPortal initialAuthenticated={true} />
      </ProcurementProvider>
    );

    // Switch vendor to Rao Interior works
    const vendorSelect = container.querySelectorAll('select')[0];
    fireEvent.change(vendorSelect, { target: { value: 'CLT-VND-003' } });

    // Accept RFQ first
    const acceptBtn = screen.getAllByRole('button', { name: UI_STRINGS.vendorPortal.acceptRfq })[0];
    fireEvent.click(acceptBtn);

    // Find and click Quote Now button in summary table
    const quoteNowBtns = screen.getAllByRole('button', { name: UI_STRINGS.vendorPortal.quoteNowAction });
    expect(quoteNowBtns.length).toBeGreaterThan(0);
    fireEvent.click(quoteNowBtns[0]);

    // Navigates directly to Quotation Summary Tab
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.tabQuotationSummary).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.round1Header).length).toBeGreaterThan(0);
  });
});
