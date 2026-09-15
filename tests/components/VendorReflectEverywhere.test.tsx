import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProcurementProvider, useProcurement } from '@/context/ProcurementContext';
import { PRModule } from '@/components/PRModule';
import { CategoryManagerHub } from '@/components/CategoryManagerHub';
import { getStoredVendors } from '@/context/useVendorManager';
import { UI_STRINGS } from '@/constants';

// Test wrapper harness exposing PRModule, CategoryManagerHub, and a direct onboarding trigger
const VendorIntegrationHarness: React.FC = () => {
  const { managedVendors, addSingleClientVendor } = useProcurement();
  const [activeView, setActiveView] = React.useState<'pr' | 'rfq'>('pr');

  return (
    <div>
      <div data-testid="view-switcher">
        <button onClick={() => setActiveView('pr')}>Show PR Module</button>
        <button onClick={() => setActiveView('rfq')}>Show RFQ Workbench</button>
        <button
          onClick={() => {
            addSingleClientVendor({
              name: 'Verma Interior Design & Fitouts',
              category: 'Interior & Fitouts',
              subCategory: 'Turnkey Commercial Fitouts',
              region: 'WEST',
              regionLabel: 'West (Mumbai / Pune)',
              rating: 4.7,
              reviewsCount: 15,
              isRateCard: true,
              rateCardCode: 'RC-CLT-INT-05',
              rateCardStatus: 'Active Client Contract',
              contactPerson: 'Arun Verma',
              gstin: '27AABCV7711M1Z8',
              city: 'Mumbai, Maharashtra',
              leadTime: '5-7 Days',
              badgeText: 'Client Boarded Vendor',
              capacity: 'Enterprise',
              tenantKey: 'TNT_LNT',
              tenantName: 'L&T Construction',
              email: 'verma@example.com',
              phone: '+91 98200 11223',
            });
          }}
        >
          Add Dynamic Client Vendor
        </button>
      </div>

      <div data-testid="managed-vendors-count">{managedVendors.length}</div>
      <div data-testid="rao-vendor-status">
        {managedVendors.find((v) => v.name.toLowerCase().includes('rao interior'))
          ? 'FOUND_RAO'
          : 'NOT_FOUND'}
      </div>

      {activeView === 'pr' && <PRModule />}
      {activeView === 'rfq' && <CategoryManagerHub />}
    </div>
  );
};

describe('Client-Onboarded Vendors Reflect Everywhere Integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.alert = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('verifies Rao Interior works is pre-seeded as a Client Boarded vendor in managedVendors', () => {
    render(
      <ProcurementProvider>
        <VendorIntegrationHarness />
      </ProcurementProvider>
    );

    expect(screen.getByTestId('rao-vendor-status')).toHaveTextContent('FOUND_RAO');
  });

  it('displays Rao Interior works with Client Boarded badge in PR Module Step 4 Supplier Selection', () => {
    render(
      <ProcurementProvider>
        <VendorIntegrationHarness />
      </ProcurementProvider>
    );

    // Navigate to Step 4 (Supplier Selection) in PR Module
    const step4Btn = screen.getByRole('button', {
      name: new RegExp(UI_STRINGS.prModule.stepSuppliers, 'i'),
    });
    fireEvent.click(step4Btn);

    // Open the dropdown menu via data-testid
    const dropdownTrigger = screen.getByTestId('pr-supplier-dropdown-trigger');
    fireEvent.click(dropdownTrigger);

    // Verify "Rao Interior works" is listed in dropdown options
    expect(screen.getByText(/Rao Interior works \(CLT-VND-003\)/i)).toBeInTheDocument();

    // Verify "Client Boarded" badge is rendered
    const clientBoardedBadges = screen.getAllByText(/Client Boarded/i);
    expect(clientBoardedBadges.length).toBeGreaterThan(0);
  });

  it('allows selecting Rao Interior works in PR and submitting with nominated vendor', () => {
    render(
      <ProcurementProvider>
        <VendorIntegrationHarness />
      </ProcurementProvider>
    );

    // Go to Step 4
    fireEvent.click(
      screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.prModule.stepSuppliers, 'i'),
      })
    );

    // Open dropdown
    fireEvent.click(screen.getByTestId('pr-supplier-dropdown-trigger'));

    // Click on Rao Interior works option to select it
    const raoOption = screen.getByText(/Rao Interior works \(CLT-VND-003\)/i);
    fireEvent.click(raoOption);

    // Close dropdown
    fireEvent.click(screen.getByRole('button', { name: /Done \/ Apply Selection/i }));

    // Verify Rao Interior works is shown in the selected chips below dropdown
    expect(screen.getAllByText(/Rao Interior works \(CLT-VND-003\)/i).length).toBeGreaterThan(0);

    // Navigate to Step 7 (Attachments & Submit)
    fireEvent.click(
      screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.prModule.stepDocuments, 'i'),
      })
    );

    // Submit PR
    const submitPRBtn = screen.getByRole('button', {
      name: new RegExp(UI_STRINGS.prModule.submitPR, 'i'),
    });
    fireEvent.click(submitPRBtn);

    // Check PR is submitted
    expect(
      screen.getAllByText(new RegExp(UI_STRINGS.prModule.prSuccessfullySubmitted, 'i')).length
    ).toBeGreaterThan(0);
  });

  it('displays Rao Interior works in CategoryManagerHub RFQ circulation vendor dropdown', () => {
    render(
      <ProcurementProvider>
        <VendorIntegrationHarness />
      </ProcurementProvider>
    );

    // Switch to RFQ Workbench
    fireEvent.click(screen.getByText('Show RFQ Workbench'));

    // Open the supplier dropdown in Step 1 via data-testid
    const dropdownToggle = screen.getByTestId('rfq-supplier-dropdown-trigger');
    fireEvent.click(dropdownToggle);

    // Verify "Rao Interior works" is available in the dropdown with "Client Boarded" badge
    expect(screen.getAllByText(/Rao Interior works \(CLT-VND-003\)/i).length).toBeGreaterThan(0);
  });

  it('dynamically reflects a newly onboarded client vendor across both PR and RFQ modules and localStorage', () => {
    render(
      <ProcurementProvider>
        <VendorIntegrationHarness />
      </ProcurementProvider>
    );

    // Click button to add dynamic client vendor
    fireEvent.click(screen.getByText('Add Dynamic Client Vendor'));

    // Check that localStorage was populated
    const stored = getStoredVendors();
    const hasVerma = stored.some((v) => v.name.includes('Verma Interior'));
    expect(hasVerma).toBe(true);

    // Check in PR Module: navigate to Step 4
    fireEvent.click(
      screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.prModule.stepSuppliers, 'i'),
      })
    );
    fireEvent.click(screen.getByTestId('pr-supplier-dropdown-trigger'));

    // Verma Interior should be in PR Module dropdown
    expect(screen.getByText(/Verma Interior Design & Fitouts/i)).toBeInTheDocument();

    // Switch to RFQ Workbench
    fireEvent.click(screen.getByText('Show RFQ Workbench'));

    // In RFQ Workbench: open dropdown
    fireEvent.click(screen.getByTestId('rfq-supplier-dropdown-trigger'));

    // Verma Interior should be selectable in RFQ Workbench dropdown
    expect(screen.getByText(/Verma Interior Design & Fitouts/i)).toBeInTheDocument();
  });
});
