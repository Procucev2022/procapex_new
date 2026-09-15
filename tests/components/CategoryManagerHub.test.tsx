import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  CategoryManagerHub,
  getMasterVendor,
  getItemRateCard,
  getItemVendorQuote,
  syncPRsToPRData,
} from '@/components/CategoryManagerHub';
import type { BOQItemWithMLEO, PurchaseRequest } from '@/types';
import { useProcurement } from '@/context/ProcurementContext';
import { UI_STRINGS } from '@/constants';

jest.mock('@/context/ProcurementContext', () => ({
  useProcurement: jest.fn(),
}));

describe('CategoryManagerHub Component', () => {
  const mockOnRouteToPPO = jest.fn();
  const mockCreatePPO = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useProcurement as jest.Mock).mockReturnValue({
      prs: [],
      createPPO: mockCreatePPO,
    });
    window.alert = jest.fn();
  });

  it('renders top banner, switches PRs in the queue, and uses banner shortcuts', () => {
    render(<CategoryManagerHub onRouteToPPO={mockOnRouteToPPO} />);

    expect(screen.getByText(UI_STRINGS.categoryManagerHub.roleBadge)).toBeInTheDocument();

    // Top banner shortcut buttons
    const cbaShortcut = screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.cbaMatrix });
    fireEvent.click(cbaShortcut);
    expect(screen.getByText(/Direct PPO Generation & Vendor Award Console/i)).toBeInTheDocument();

    const rfqShortcut = screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.raiseRFQ });
    fireEvent.click(rfqShortcut);
    expect(screen.getByText(/Active RFQ: RFQ-2026-0005/i)).toBeInTheDocument();

    // Switch PR to PR-2026-0003 (Method 2 Rate Card)
    fireEvent.click(screen.getByText('PR-2026-0003'));
    expect(screen.getAllByText(/PR-2026-0003/i).length).toBeGreaterThan(0);

    // Switch PR to PR-2026-0002 (Method 1)
    fireEvent.click(screen.getByText('PR-2026-0002'));
    expect(screen.getAllByText(/PR-2026-0002/i).length).toBeGreaterThan(0);

    // Switch PR to PR-2026-0004 (Method 4)
    fireEvent.click(screen.getByText('PR-2026-0004'));
    expect(screen.getAllByText(/PR-2026-0004/i).length).toBeGreaterThan(0);

    // Switch back to PR-2026-0005
    fireEvent.click(screen.getByText('PR-2026-0005'));
    expect(screen.getAllByText(/PR-2026-0005/i).length).toBeGreaterThan(0);
  });

  it('interacts with Tab 1 (RFQ Management), sets closure date, toggles vendors, and submits RFQ', () => {
    const { container } = render(<CategoryManagerHub onRouteToPPO={mockOnRouteToPPO} />);

    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.tabRFQ }));

    // RFQ closure date input
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(dateInput).toBeInTheDocument();
    fireEvent.change(dateInput, { target: { value: '2026-10-15' } });
    expect(dateInput.value).toBe('2026-10-15');

    // Reset to raiser selection
    const resetBtn = screen.getByRole('button', { name: /Reset to Raiser Selection/i });
    fireEvent.click(resetBtn);

    // Add all rate card vendors
    const addRateCardBtn = screen.getByRole('button', { name: /\+ Add All Rate Card Vendors/i });
    fireEvent.click(addRateCardBtn);

    // Open/close vendor multi-select dropdown
    const dropdownToggle = screen.getByText(/Vendors in RFQ Scope/i).closest('div')?.querySelector('button[type="button"]');
    if (dropdownToggle) {
      fireEvent.click(dropdownToggle);

      // Toggle a vendor in the dropdown list (uncheck then check)
      const vendorRows = container.querySelectorAll('.divide-y > div.cursor-pointer');
      if (vendorRows.length > 0) {
        fireEvent.click(vendorRows[0]);
        fireEvent.click(vendorRows[0]);
      }
    }

    // Remove a vendor chip
    const chipRemoveBtns = container.querySelectorAll('button.text-slate-500');
    if (chipRemoveBtns.length > 0) {
      fireEvent.click(chipRemoveBtns[0]);
    }

    // Submit RFQ button
    const submitRfqBtn = screen.getByRole('button', {
      name: new RegExp(UI_STRINGS.categoryManagerHub.rfqSubmitTender, 'i'),
    });
    expect(submitRfqBtn).toBeInTheDocument();
    fireEvent.click(submitRfqBtn);

    // Dispatched notice banner appears
    expect(
      screen.getByText(new RegExp(UI_STRINGS.categoryManagerHub.rfqSubmittedNotice, 'i'))
    ).toBeInTheDocument();

    // Link to 4-Way Commercial Matrix
    const openMatrixBtn = screen.getByRole('button', { name: /View 4-Way Commercial Matrix/i });
    fireEvent.click(openMatrixBtn);
    expect(screen.getByText(/Direct PPO Generation & Vendor Award Console/i)).toBeInTheDocument();
  });

  it('interacts with Tab 3 (4-Way Commercial Matrix), L1 award, and Non-L1 Governance Modal', () => {
    const { container } = render(<CategoryManagerHub onRouteToPPO={mockOnRouteToPPO} />);

    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.tabCommercial }));
    expect(screen.getByText(/Direct PPO Generation & Vendor Award Console/i)).toBeInTheDocument();

    // Click Non-L1 award button to open governance modal
    const nonL1AwardButtons = screen.getAllByRole('button', { name: /Award \(Non-L1 - Exception Note\)/i });
    if (nonL1AwardButtons.length > 0) {
      fireEvent.click(nonL1AwardButtons[0]);
      expect(screen.getByText(/Commercial Governance: Non-L1 Vendor Award/i)).toBeInTheDocument();

      // Try confirming without justification text
      const confirmBtn = screen.getByRole('button', { name: /Confirm & Generate Exception PPO/i });
      fireEvent.click(confirmBtn);
      expect(window.alert).toHaveBeenCalledWith('Please enter an operational justification note for Non-L1 award.');

      // Select exception category and enter justification
      const modalSelect = container.querySelector('.fixed select') as HTMLSelectElement;
      if (modalSelect) {
        fireEvent.change(modalSelect, { target: { value: 'Past Performance & Quality Audit Score Higher' } });
      }

      const justTextarea = screen.getByPlaceholderText(/Explain why this higher bidder is awarded/i);
      fireEvent.change(justTextarea, { target: { value: 'Demonstrated superior craftsmanship on Phase 1' } });

      // Cancel modal first to test cancel button
      const cancelBtn = screen.getByRole('button', { name: UI_STRINGS.common.cancel });
      fireEvent.click(cancelBtn);

      // Re-open and confirm
      fireEvent.click(nonL1AwardButtons[0]);
      const reJustTextarea = screen.getByPlaceholderText(/Explain why this higher bidder is awarded/i);
      fireEvent.change(reJustTextarea, { target: { value: 'Demonstrated superior craftsmanship' } });
      fireEvent.click(screen.getByRole('button', { name: /Confirm & Generate Exception PPO/i }));

      // Now should be on Tab 6 (ppogen) with Non-L1 PPO
      expect(screen.getByText(/Non-L1 Commercial Exception Award/i)).toBeInTheDocument();
    }

    // Return to commercial tab and award L1
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.backToCommercial }));

    const l1AwardBtn = screen.getByRole('button', { name: /Award & Generate PPO \(L1 Winner\)/i });
    fireEvent.click(l1AwardBtn);

    // Should be on Tab 6 (ppogen) with L1 PPO
    expect(screen.getByText(/L1 Award \(Lowest Bidder\)/i)).toBeInTheDocument();
  });

  it('interacts with MLEO Breakdown Modal on Tab 3 and Tab 4 and applies Should-Cost target', () => {
    render(<CategoryManagerHub onRouteToPPO={mockOnRouteToPPO} />);

    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.tabCommercial }));

    // Open MLEO modal from table button
    const mleoButtons = screen.getAllByRole('button', { name: UI_STRINGS.categoryManagerHub.mleoBreakdown });
    expect(mleoButtons.length).toBeGreaterThan(0);
    fireEvent.click(mleoButtons[0]);

    expect(screen.getByText(/AI Cost Model: Bottom-Up MLEO Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. Material \(M\)/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Labor \(L\)/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Equipment \(E\)/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Overheads \(O\)/i)).toBeInTheDocument();

    // Close via close button
    const closeBtn = screen.getByRole('button', { name: UI_STRINGS.common.close });
    fireEvent.click(closeBtn);

    // Re-open and apply Should-Cost to negotiation console
    fireEvent.click(mleoButtons[0]);
    const applyTargetBtn = screen.getByRole('button', { name: /Apply Target to Counter-Offer Console →/i });
    fireEvent.click(applyTargetBtn);

    // Open via Tab 4 (AI Cost)
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.tabAICost }));
    expect(screen.getAllByText(/AI Cost Benchmarking/i).length).toBeGreaterThan(0);

    const mleoCardButtons = screen.queryAllByRole('button', { name: /MLEO Breakdown/i });
    if (mleoCardButtons.length > 0) {
      fireEvent.click(mleoCardButtons[0]);
      // Close via top X button
      const closeXBtn = screen.getByRole('button', { name: '✕' });
      fireEvent.click(closeXBtn);
    }
  });

  it('renders Method 2 in 4-Way Commercial Matrix and tests openMLEOModal in table footer', () => {
    render(<CategoryManagerHub onRouteToPPO={mockOnRouteToPPO} />);

    // Select PR-2026-0003 (Method 2)
    fireEvent.click(screen.getByText('PR-2026-0003'));

    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.tabCommercial }));
    expect(screen.getByText(/Vendor 14 Rate Card Rate/i)).toBeInTheDocument();

    // Open MLEO Modal from row
    const rowMleoBtns = screen.getAllByRole('button', { name: UI_STRINGS.categoryManagerHub.mleoBreakdown });
    if (rowMleoBtns.length > 0) {
      fireEvent.click(rowMleoBtns[0]);
      fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.common.close }));
    }

    // Open MLEO Modal from table footer
    const footerMleoBtn = screen.getByRole('button', { name: /Open MLEO Modal/i });
    fireEvent.click(footerMleoBtn);
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.common.close }));

    // Award Method 2 PPO
    const awardButtons = screen.getAllByRole('button', { name: /Award/i });
    if (awardButtons.length > 0) {
      fireEvent.click(awardButtons[0]);
    }
  });

  it('interacts with Tab 5 (Vendor Negotiation Hub), line counter rates, and simulates BAFO', () => {
    const { container } = render(<CategoryManagerHub onRouteToPPO={mockOnRouteToPPO} />);

    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.tabNegotiation }));
    expect(screen.getByText(/Multi-round line-item negotiation workbench/i)).toBeInTheDocument();

    // Edit line counter rate
    const counterSpinInputs = container.querySelectorAll('input[type="number"]');
    if (counterSpinInputs.length > 0) {
      fireEvent.change(counterSpinInputs[0], { target: { value: '3400' } });
      fireEvent.change(counterSpinInputs[0], { target: { value: '' } });
      fireEvent.change(counterSpinInputs[0], { target: { value: '3350' } });
    }

    // Change table header target offer vendor and click Send Offer
    const tableHeaderSelect = container.querySelector('thead select') as HTMLSelectElement;
    if (tableHeaderSelect) {
      fireEvent.change(tableHeaderSelect, { target: { value: 'VND-001' } });
    }
    const sendOfferBtn = screen.getByRole('button', { name: /^Send Offer →$/i });
    fireEvent.click(sendOfferBtn);

    // Send row offer with default vendor (covers undefined rowOfferVendors branch)
    const rowOfferButtons = screen.getAllByRole('button', { name: /^Offer →$/i });
    if (rowOfferButtons.length > 0) {
      fireEvent.click(rowOfferButtons[0]);
    }

    // Send row offer with specific vendor
    const rowSelect = container.querySelector('#rowOfferVendorSelect_0') as HTMLSelectElement;
    if (rowSelect) {
      fireEvent.change(rowSelect, { target: { value: 'VND-001' } });
    }
    if (rowOfferButtons.length > 0) {
      fireEvent.click(rowOfferButtons[0]);
    }

    // Simulate BAFO with single vendor selected
    const receiveBafoBtn = screen.getByRole('button', { name: /Receive 2nd Quote \(BAFO\)/i });
    fireEvent.click(receiveBafoBtn);

    // Now change rowSelect to ALL and dispatch offer to ALL
    if (rowSelect) {
      fireEvent.change(rowSelect, { target: { value: 'ALL' } });
    }
    if (rowOfferButtons.length > 0) {
      fireEvent.click(rowOfferButtons[0]);
    }
    fireEvent.click(receiveBafoBtn);

    // Open MLEO breakdown from negotiation table
    const tableMleoBtns = screen.getAllByRole('button', { name: /MLEO Breakdown/i });
    if (tableMleoBtns.length > 0) {
      fireEvent.click(tableMleoBtns[0]);
      fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.common.close }));
    }

    // Lock and accept BAFO
    const lockBafoBtn = screen.getByRole('button', { name: /Lock & Accept BAFO/i });
    fireEvent.click(lockBafoBtn);
    expect(screen.getByText(/BAFO AGREED & LOCKED ✓/i)).toBeInTheDocument();

    // Proceed to PPO
    const proceedToPpoBtn = screen.getByRole('button', { name: /Proceed to PPO →/i });
    fireEvent.click(proceedToPpoBtn);
  });

  it('interacts with Tab 6 (PPO Proposal & Routing) and routes to PPO approval', () => {
    render(<CategoryManagerHub onRouteToPPO={mockOnRouteToPPO} />);

    // Initially Tab 6 has no awarded PPO
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.tabPPO }));
    expect(screen.getByText(/No Vendor Finalized Yet for PPO Drafting/i)).toBeInTheDocument();

    // Click link to commercial matrix
    const openMatrixBtn = screen.getByRole('button', { name: /Open 4-Way Commercial Matrix →/i });
    fireEvent.click(openMatrixBtn);

    // Award L1
    const l1AwardBtn = screen.getByRole('button', { name: /Award & Generate PPO \(L1 Winner\)/i });
    fireEvent.click(l1AwardBtn);

    // Route PPO to Tier 1
    const routePpoBtn = screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.routePPOToWorkflow });
    fireEvent.click(routePpoBtn);
    expect(mockOnRouteToPPO).toHaveBeenCalled();
  });

  it('tests PR-2026-0004 with default vendor commercial terms and Method 4 footer MLEO', () => {
    render(<CategoryManagerHub onRouteToPPO={mockOnRouteToPPO} />);
    fireEvent.click(screen.getByText('PR-2026-0004'));
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.tabCommercial }));
    expect(screen.getAllByText(/Standard Terms/i).length).toBeGreaterThan(0);

    // Open MLEO Modal from footer in Method 4
    const footerMleoBtn = screen.getByRole('button', { name: /Open MLEO Modal/i });
    fireEvent.click(footerMleoBtn);
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.common.close }));
  });

  describe('Helper Functions', () => {
    it('getMasterVendor returns matching vendor or first fallback', () => {
      const v1 = getMasterVendor('VND-001');
      expect(v1.id).toBe('VND-001');
      const vFallback = getMasterVendor('NON_EXISTENT_VENDOR');
      expect(vFallback).toBeDefined();
      expect(vFallback.id).toBe('VND-001');
    });

    it('getItemRateCard returns rate card or benchmark * 1.05', () => {
      const mockItem = {
        code: 'ITEM-01',
        desc: 'Test Item',
        qty: 10,
        uom: 'NOS',
        benchmark: 1000,
        vendorRateCards: { 'VND-001': 1050 },
      } as unknown as BOQItemWithMLEO;

      expect(getItemRateCard(mockItem, 'VND-001')).toBe(1050);
      expect(getItemRateCard(mockItem, 'VND-UNKNOWN')).toBe(1050);

      const mockItemNoRC = {
        code: 'ITEM-02',
        desc: 'Test Item 2',
        qty: 5,
        uom: 'NOS',
        benchmark: 2000,
      } as unknown as BOQItemWithMLEO;
      expect(getItemRateCard(mockItemNoRC, 'VND-001')).toBe(2100);
    });

    it('getItemVendorQuote returns quote or fallback', () => {
      const mockItem = {
        code: 'ITEM-01',
        desc: 'Test Item',
        qty: 10,
        uom: 'NOS',
        benchmark: 1000,
        vendorQuotes: {
          'VND-001': { initialRate: 1100, revisedRate: 1050 },
        },
      } as unknown as BOQItemWithMLEO;

      expect(getItemVendorQuote(mockItem, 'VND-001')).toEqual({
        initialRate: 1100,
        revisedRate: 1050,
      });
      expect(getItemVendorQuote(mockItem, 'VND-UNKNOWN')).toEqual({
        initialRate: 1150,
        revisedRate: null,
      });

      const mockItemNoQuotes = {
        code: 'ITEM-02',
        desc: 'Test Item 2',
        qty: 5,
        uom: 'NOS',
        benchmark: 2000,
      } as unknown as BOQItemWithMLEO;
      expect(getItemVendorQuote(mockItemNoQuotes, 'VND-001')).toEqual({
        initialRate: 2300,
        revisedRate: null,
      });
    });

    it('syncPRsToPRData merges context PRs and generates PRData for newly submitted PRs', () => {
      const mockContextPRs: PurchaseRequest[] = [
        {
          id: 'PR-2026-0005',
          title: 'Updated Reception Counter',
          projectName: 'Metro Station Depot',
          costCentre: 'CC-104',
          category: 'Interior & Fitouts',
          requester: 'Rahul Verma',
          reqDate: '2026-09-28',
          status: 'SUBMITTED',
          buyer: 'Unassigned',
          items: [
            { code: 'NEW-01', desc: 'Custom Counter Granite', uom: 'Sqm', qty: 15, benchmark: 3500 },
          ],
        },
        {
          id: 'PR-2026-0009',
          title: 'Brand New Civil Requisition',
          projectName: 'Metro Elevated Pier',
          costCentre: 'CC-101',
          category: 'Civil Materials',
          requester: 'Amit Sharma',
          reqDate: '2026-10-05',
          status: 'SUBMITTED',
          buyer: 'Unassigned',
          items: [
            { code: 'CIV-01', desc: 'High Strength Cement', uom: 'Bag', qty: 200, benchmark: 420 },
          ],
        },
      ];

      const result = syncPRsToPRData(mockContextPRs, {});
      expect(result['PR-2026-0005']).toBeDefined();
      expect(result['PR-2026-0005'].title).toBe('Updated Reception Counter');
      expect(result['PR-2026-0005'].items[0].code).toBe('NEW-01');

      expect(result['PR-2026-0009']).toBeDefined();
      expect(result['PR-2026-0009'].title).toBe('Brand New Civil Requisition');
      expect(result['PR-2026-0009'].categoryMajor).toBe('CIVIL');
      expect(result['PR-2026-0009'].items.length).toBe(1);
      expect(result['PR-2026-0009'].items[0].code).toBe('CIV-01');
    });

    it('displays newly submitted PR from useProcurement and selects it via initialPRId', () => {
      (useProcurement as jest.Mock).mockReturnValue({
        prs: [
          {
            id: 'PR-2026-0008',
            title: 'Steel Fabrication Requisition',
            projectName: 'Metro Line 4 Pier Cap',
            costCentre: 'CC-102',
            category: 'Structural Steel',
            requester: 'Rahul Verma',
            reqDate: '2026-09-30',
            status: 'SUBMITTED',
            buyer: 'Unassigned',
            items: [
              { code: 'STL-99', desc: 'Rebar Steel 32mm', uom: 'Ton', qty: 25, benchmark: 55000 },
            ],
          },
        ],
      });

      render(<CategoryManagerHub initialPRId="PR-2026-0008" />);

      // Queue bar and overview card should display the newly submitted PR
      expect(screen.getAllByText('PR-2026-0008').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Steel Fabrication Requisition').length).toBeGreaterThan(0);

      // Selected PR overview card should display PR-2026-0008 details
      expect(screen.getAllByText('SUBMITTED').length).toBeGreaterThan(0);
    });
  });
});
