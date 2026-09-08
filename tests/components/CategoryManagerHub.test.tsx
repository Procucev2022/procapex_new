import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  CategoryManagerHub,
  getMasterVendor,
  getItemRateCard,
  getItemVendorQuote,
} from '@/components/CategoryManagerHub';
import type { BOQItemWithMLEO } from '@/types';
import { useProcurement } from '@/context/ProcurementContext';
import { UI_STRINGS } from '@/constants';

jest.mock('@/context/ProcurementContext', () => ({
  useProcurement: jest.fn(),
}));

describe('CategoryManagerHub Component', () => {
  const mockOnRouteToPPO = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useProcurement as jest.Mock).mockReturnValue({
      prs: [],
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

  it('interacts with Tab 1 (RFQ Management), adds rate cards, toggles dropdown and chips', () => {
    const { container } = render(<CategoryManagerHub onRouteToPPO={mockOnRouteToPPO} />);

    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.tabRFQ }));

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

    // Tab 1 Non-L1 award button & modal close
    const tab1NonL1Btns = screen.getAllByRole('button', { name: /Award PPO \(Non-L1\) →/i });
    if (tab1NonL1Btns.length > 0) {
      fireEvent.click(tab1NonL1Btns[0]);
      const closeX = screen.getByRole('button', { name: 'Close Non-L1 Modal' });
      fireEvent.click(closeX);
    }

    // Tab 1 CBA Matrix button
    const cbaMatrixBtns = screen.getAllByRole('button', { name: /CBA Matrix →/i });
    if (cbaMatrixBtns.length > 0) {
      fireEvent.click(cbaMatrixBtns[0]);
      expect(screen.getByText(/4-Way Commercial Matrix/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.tabRFQ }));
    }

    // Award PPO L1 from Tab 1 table
    const tab1AwardBtns = screen.getAllByRole('button', { name: /Award PPO \(L1\) →/i });
    if (tab1AwardBtns.length > 0) {
      fireEvent.click(tab1AwardBtns[0]);
      expect(screen.getAllByText(/L1 Award \(Lowest Bidder\)/i).length).toBeGreaterThan(0);
    }
  });

  it('interacts with Tab 2 (Master Rate Card Studio) in both Method 2 and Standard modes', () => {
    const { container } = render(<CategoryManagerHub onRouteToPPO={mockOnRouteToPPO} />);

    // Standard mode (PR-2026-0005)
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.tabRateCard }));
    expect(screen.getAllByText(/Master Rate Card/i).length).toBeGreaterThan(0);

    // Switch to PR-2026-0003 (Method 2)
    fireEvent.click(screen.getByText('PR-2026-0003'));
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.categoryManagerHub.tabRateCard }));
    expect(screen.getByText(/Multi-Vendor Contracted Rate Card Comparison Matrix/i)).toBeInTheDocument();

    // Direct Award L1 from Method 2 Rate Card view
    const directAwardBtn = screen.getByRole('button', { name: /Direct Award L1 →/i });
    fireEvent.click(directAwardBtn);
    expect(screen.getAllByText(/L1 Award \(Lowest Bidder\)/i).length).toBeGreaterThan(0);
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
  });
});
