import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProcurementProvider, useProcurement } from '@/context/ProcurementContext';
import { CategoryManagerHub } from '@/components/CategoryManagerHub';
import { VendorPortal } from '@/components/VendorPortal';
import { UI_STRINGS } from '@/constants';

describe('Vendor vs Category Manager Quote & Counter-Offer Synchronization Workflow', () => {
  beforeEach(() => {
    window.localStorage?.clear();
    window.sessionStorage?.clear();
  });

  const SyncHarness: React.FC = () => {
    const [view, setView] = React.useState<'vendor' | 'cm'>('vendor');
    const { prs, submitVendorQuote, submitBuyerCounterOffer, negotiations } = useProcurement();

    return (
      <div>
        <div data-testid="harness-controls">
          <button type="button" onClick={() => setView('vendor')}>
            Open Vendor Portal
          </button>
          <button type="button" onClick={() => setView('cm')}>
            Open Category Manager
          </button>
          <button
            type="button"
            data-testid="programmatic-vendor-q1"
            onClick={() => {
              submitVendorQuote?.(
                'PR-2026-0005',
                'VND-001',
                1,
                195000,
                'Vendor 1 Custom 1st Quote',
                {
                  'CNT-TOP-GRN20': 4200,
                  'CNT-PLY-BWP18': 1750,
                  'CNT-LAM-1MM': 1050,
                  'CNT-HDW-SOFT': 2250,
                  'CNT-LED-PROF': 450,
                  'CNT-SKT-SS304': 850,
                }
              );
            }}
          >
            Submit Custom Vendor Q1
          </button>
          <button
            type="button"
            data-testid="programmatic-cm-offer1"
            onClick={() => {
              submitBuyerCounterOffer?.(
                'PR-2026-0005',
                'VND-001',
                1,
                152000,
                'CM Custom Counter Offer 1',
                {
                  'CNT-TOP-GRN20': 3350,
                  'CNT-PLY-BWP18': 1410,
                  'CNT-LAM-1MM': 830,
                  'CNT-HDW-SOFT': 1690,
                  'CNT-LED-PROF': 370,
                  'CNT-SKT-SS304': 710,
                }
              );
            }}
          >
            Submit Custom CM Offer 1
          </button>
          <button
            type="button"
            data-testid="programmatic-vendor-q2"
            onClick={() => {
              submitVendorQuote?.(
                'PR-2026-0005',
                'VND-001',
                2,
                175000,
                'Vendor 1 Custom 2nd Quote (BAFO)',
                {
                  'CNT-TOP-GRN20': 3700,
                  'CNT-PLY-BWP18': 1580,
                  'CNT-LAM-1MM': 930,
                  'CNT-HDW-SOFT': 1980,
                  'CNT-LED-PROF': 410,
                  'CNT-SKT-SS304': 780,
                }
              );
            }}
          >
            Submit Custom Vendor Q2 BAFO
          </button>
        </div>

        <div data-testid="prs-count">{prs.length}</div>
        <div data-testid="neg-count">{negotiations['PR-2026-0005']?.length || 0}</div>

        {view === 'vendor' ? (
          <VendorPortal initialAuthenticated={true} />
        ) : (
          <CategoryManagerHub initialPRId="PR-2026-0005" />
        )}
      </div>
    );
  };

  it('transmits customized Quote 1 from Vendor to Category Manager with matching line item prices', () => {
    render(
      <ProcurementProvider>
        <SyncHarness />
      </ProcurementProvider>
    );

    // 1. Submit custom Vendor Quote 1 programmatically
    fireEvent.click(screen.getByTestId('programmatic-vendor-q1'));

    // 2. Switch to Category Manager view
    fireEvent.click(screen.getByText('Open Category Manager'));

    // Verify Category Manager Hub is mounted
    expect(screen.getByText(UI_STRINGS.categoryManagerHub.title)).toBeInTheDocument();

    // 3. Navigate to Tab 4 (Vendor Negotiation Hub)
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.tabNegotiation }));

    // Verify that the Granite rate is ₹ 4,200 under Vendor 1 1st Quote
    expect(screen.getByText('₹ 4,200')).toBeInTheDocument();

    // 4. Navigate to Tab 2 (4-Way Commercial Matrix & CBA)
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.tabCommercial }));

    // Verify Commercial Matrix also displays ₹ 4,200
    expect(screen.getAllByText(/4,200/i).length).toBeGreaterThan(0);
  });

  it('transmits Counter-Offer 1 from Category Manager to Vendor Portal with matching line item prices', () => {
    render(
      <ProcurementProvider>
        <SyncHarness />
      </ProcurementProvider>
    );

    // 1. Dispatch custom CM Counter-Offer 1
    fireEvent.click(screen.getByTestId('programmatic-cm-offer1'));

    // 2. Switch to Vendor Portal view
    fireEvent.click(screen.getByText('Open Vendor Portal'));

    // Navigate to Quotation Summary Tab
    const quoteTabBtn = screen.getByRole('button', { name: UI_STRINGS.vendorPortal.tabQuotationSummary });
    fireEvent.click(quoteTabBtn);

    // Switch to Round 2 (which displays Buyer Offer 1 column)
    const round2Btn = screen.getByRole('button', {
      name: (content) => content.includes(UI_STRINGS.vendorPortal.round2Header),
    });
    fireEvent.click(round2Btn);

    // Verify that Buyer Offer 1 displays ₹ 3,350 for Granite
    expect(screen.getByText('₹ 3,350')).toBeInTheDocument();
  });

  it('transmits Quote 2 (BAFO) from Vendor to Category Manager and persists all transactions', () => {
    render(
      <ProcurementProvider>
        <SyncHarness />
      </ProcurementProvider>
    );

    // 1. Submit Q1, Offer 1, and Q2 BAFO
    fireEvent.click(screen.getByTestId('programmatic-vendor-q1'));
    fireEvent.click(screen.getByTestId('programmatic-cm-offer1'));
    fireEvent.click(screen.getByTestId('programmatic-vendor-q2'));

    // 2. Switch to Category Manager view
    fireEvent.click(screen.getByText('Open Category Manager'));

    // Go to Tab 4 (Negotiation Hub)
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.tabNegotiation }));

    // Verify Revised BAFO Granite rate is ₹ 3,700
    expect(screen.getByText('₹ 3,700')).toBeInTheDocument();

    // Verify localStorage holds the updated PRs and negotiations
    const storedPRs = window.localStorage?.getItem('procapex_prs_v1');
    expect(storedPRs).toBeTruthy();
    expect(storedPRs).toContain('3700');

    const storedNego = window.localStorage?.getItem('procapex_negotiations_v1');
    expect(storedNego).toBeTruthy();
    expect(storedNego).toContain('Vendor 1 Custom 2nd Quote (BAFO)');
  });

  it('properly renders Quote 1 and Quote 2 in tabular form in Vendor Portal', () => {
    render(
      <ProcurementProvider>
        <SyncHarness />
      </ProcurementProvider>
    );

    // Open Vendor Portal Quotation tab
    const quoteTabBtn = screen.getByRole('button', { name: UI_STRINGS.vendorPortal.tabQuotationSummary });
    fireEvent.click(quoteTabBtn);

    // Switch to "All Rounds Matrix"
    const allRoundsBtn = screen.getByRole('button', { name: /All Rounds Matrix/i });
    fireEvent.click(allRoundsBtn);

    // Verify table headers for Quote 1 and Quote 2
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.round1Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.round2Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.buyerOffer1Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.buyerOffer2Header).length).toBeGreaterThan(0);
  });
});
