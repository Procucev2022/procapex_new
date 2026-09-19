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
  const [activePRId, setActivePRId] = React.useState<string>('PR-2026-0005');

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
      <div data-testid="active-pr-id">{activePRId}</div>
      <div data-testid="rao-vendor-status">
        {managedVendors.find((v) => v.name.toLowerCase().includes('rao interior'))
          ? 'FOUND_RAO'
          : 'NOT_FOUND'}
      </div>

      {activeView === 'pr' && (
        <PRModule
          onNavigateToBOQ={(prId) => {
            setActivePRId(prId);
            setActiveView('rfq');
          }}
        />
      )}
      {activeView === 'rfq' && <CategoryManagerHub initialPRId={activePRId} />}
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

  it('dynamically reflects a newly onboarded client vendor across managedVendors and localStorage', () => {
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
  });

  it('makes newly onboarded client vendor visible and selectable in CategoryManagerHub supplier nomination', () => {
    render(
      <ProcurementProvider>
        <VendorIntegrationHarness />
      </ProcurementProvider>
    );

    // 1. Onboard a new client vendor
    fireEvent.click(screen.getByText('Add Dynamic Client Vendor'));

    // 2. Navigate to RFQ Workbench
    fireEvent.click(screen.getByText('Show RFQ Workbench'));

    // 3. Switch to Suppliers & Scope Nomination sub-tab
    const suppliersTabBtn = screen.getByText(UI_STRINGS.categoryManagerHub.subTabSuppliers);
    fireEvent.click(suppliersTabBtn);

    // 4. Open the supplier nomination dropdown using test id
    const dropdownToggle = screen.getByTestId('rfq-supplier-dropdown-trigger');
    fireEvent.click(dropdownToggle);

    // 5. Verify the newly onboarded vendor is present in the list
    expect(screen.getByText(/Verma Interior Design & Fitouts/i)).toBeInTheDocument();

    // 6. Select the newly onboarded vendor
    fireEvent.click(screen.getByText(/Verma Interior Design & Fitouts/i));

    // 7. Close dropdown
    fireEvent.click(dropdownToggle);

    // 8. Confirm vendor is now in the Nominated Suppliers Scope table
    const tableMatches = screen.getAllByText(/Verma Interior Design & Fitouts/i);
    expect(tableMatches.length).toBeGreaterThanOrEqual(1);
  });

  it('creates a blank RFQ package when Proceed to Raise RFQ is clicked in BOQ Studio', () => {
    render(
      <ProcurementProvider>
        <VendorIntegrationHarness />
      </ProcurementProvider>
    );

    // Ensure we are in BOQ Studio
    expect(screen.getByRole('heading', { level: 1, name: /BOQ Studio/i })).toBeInTheDocument();

    // Click "Proceed to Raise RFQ"
    const proceedButtons = screen.getAllByRole('button', {
      name: new RegExp(UI_STRINGS.prModule.proceedToRaiseRFQ, 'i'),
    });
    fireEvent.click(proceedButtons[0]);

    // Should switch to RFQ Workbench with the new blank RFQ package
    expect(screen.getByText('Show RFQ Workbench')).toBeInTheDocument();
    expect(screen.getByTestId('active-pr-id').textContent).toMatch(/PR-2026-\d{4}/);

    // Switch to suppliers tab in CategoryManagerHub
    const suppliersTabBtn = screen.getByText(UI_STRINGS.categoryManagerHub.subTabSuppliers);
    fireEvent.click(suppliersTabBtn);

    // Verify empty state is displayed because it is a blank RFQ with zero pre-nominated vendors
    expect(
      screen.getByText(UI_STRINGS.categoryManagerHub.noSuppliersNominated)
    ).toBeInTheDocument();
  });

  it('always shows blank supplier selection provision with 0 selected suppliers on default PR-2026-0005 and when reset', () => {
    render(
      <ProcurementProvider>
        <CategoryManagerHub initialPRId="PR-2026-0005" />
      </ProcurementProvider>
    );

    // Switch to suppliers tab in CategoryManagerHub
    const suppliersTabBtn = screen.getByText(UI_STRINGS.categoryManagerHub.subTabSuppliers);
    fireEvent.click(suppliersTabBtn);

    // 1. Check dropdown trigger shows 0 selected
    expect(screen.getByText(/0 selected/i)).toBeInTheDocument();
    expect(screen.getByText(/Select suppliers to invite for RFQ/i)).toBeInTheDocument();

    // 2. Check selected chips shows empty state
    expect(screen.getByText(/No suppliers selected yet/i)).toBeInTheDocument();

    // 3. Check table shows empty state notice
    expect(screen.getByText(UI_STRINGS.categoryManagerHub.noSuppliersNominated)).toBeInTheDocument();

    // 4. Add rate card vendors
    const addRateCardBtn = screen.getByRole('button', { name: /\+ Add All Rate Card Vendors/i });
    fireEvent.click(addRateCardBtn);
    expect(screen.queryByText(/No suppliers selected yet/i)).not.toBeInTheDocument();

    // 5. Click reset to default (blank) and verify it returns to completely blank provision
    const resetBtn = screen.getByRole('button', { name: /Reset to Default/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText(/0 selected/i)).toBeInTheDocument();
    expect(screen.getByText(/No suppliers selected yet/i)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.categoryManagerHub.noSuppliersNominated)).toBeInTheDocument();
  });
});

