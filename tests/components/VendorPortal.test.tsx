import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VendorPortal } from '@/components/VendorPortal';
import { UI_STRINGS } from '@/constants';

describe('VendorPortal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    window.sessionStorage.setItem('procapex_vendor_authenticated', 'true');
  });

  it('renders header, handles RFQ acceptance, switches vendor and RFQ', () => {
    const { container } = render(<VendorPortal initialAuthenticated={true} />);

    expect(screen.getByText(UI_STRINGS.vendorPortal.roleBadge)).toBeInTheDocument();
    expect(screen.getByText(/DesignCraft Millworks & Interiors Pvt Ltd/i)).toBeInTheDocument();

    // Test RFQ acceptance
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.pendingAcceptance).length).toBeGreaterThan(0);
    const acceptRfqBtn = screen.getAllByRole('button', { name: UI_STRINGS.vendorPortal.acceptRfq })[0];
    fireEvent.click(acceptRfqBtn);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.activeBidder).length).toBeGreaterThan(0);

    // Switch Vendor to VND-002 and VND-005
    const vendorSelects = container.querySelectorAll('select');
    const vendorSelect = vendorSelects[0];
    fireEvent.change(vendorSelect, { target: { value: 'VND-002' } });
    expect(screen.getByText(/Apex Modular Systems Pvt Ltd \(VND-002\)/i)).toBeInTheDocument();

    fireEvent.change(vendorSelect, { target: { value: 'VND-005' } });
    expect(screen.getByText(/NorthCraft Engineering & Woodworks \(VND-005\)/i)).toBeInTheDocument();

    // Switch RFQ
    const rfqSelect = vendorSelects[1];
    fireEvent.change(rfqSelect, { target: { value: 'PR-2026-0003' } });

    // Review Offer button in ribbon navigates to ppo tab
    const reviewOfferBtn = screen.getByRole('button', { name: UI_STRINGS.vendorPortal.reviewOffer });
    fireEvent.click(reviewOfferBtn);
    expect(screen.getAllByText(/PPO-2026-0005/i).length).toBeGreaterThan(0);
  });

  it('renders Tab 1 (RFQ Wise Summary) and allows accepting RFQ and proceeding to quotation', () => {
    render(<VendorPortal initialAuthenticated={true} />);

    // Click Tab 1: RFQ Wise Summary & Acceptance
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.vendorPortal.tabRfqSummary }));

    expect(screen.getByText(UI_STRINGS.vendorPortal.scopeSpecTitle)).toBeInTheDocument();
    expect(screen.getAllByText(/Reception Counter Fabrication/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Godrej Woods, Tower C/i).length).toBeGreaterThan(0);

    // Accept RFQ
    const acceptBtn = screen.getAllByRole('button', { name: UI_STRINGS.vendorPortal.acceptRfq })[0];
    fireEvent.click(acceptBtn);

    // Proceed to Quotation button appears
    const proceedBtn = screen.getByRole('button', { name: UI_STRINGS.vendorPortal.proceedToQuotation });
    expect(proceedBtn).toBeInTheDocument();
    fireEvent.click(proceedBtn);

    // Automatically navigates to Quotation Summary Tab
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.tabQuotationSummary).length).toBeGreaterThan(0);
  });

  it('interacts with Tab 2 (Quotation Summary - Round 1), rate inputs, payment presets, and column submission', () => {
    const { container } = render(<VendorPortal initialAuthenticated={true} />);

    // Click Tab 2: Quotation Summary
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.vendorPortal.tabQuotationSummary }));

    // Edit rate1 inputs (last two columns in Round 1)
    const rateInputs = container.querySelectorAll('input[type="number"]');
    if (rateInputs.length > 0) {
      fireEvent.change(rateInputs[0], { target: { value: '4200' } });
      fireEvent.change(rateInputs[0], { target: { value: '' } });
      fireEvent.change(rateInputs[0], { target: { value: '4000' } });
    }

    // Payment presets
    const presetSelect = screen.getByDisplayValue(/10% Advance \| 70% Progress RA/i);
    fireEvent.change(presetSelect, { target: { value: 'PRESET_2' } });
    fireEvent.change(presetSelect, { target: { value: 'PRESET_3' } });
    fireEvent.change(presetSelect, { target: { value: 'PRESET_4' } });
    fireEvent.change(presetSelect, { target: { value: 'PRESET_5' } });
    fireEvent.change(presetSelect, { target: { value: 'PRESET_1' } });

    // Terms inputs
    const creditInput = screen.getByDisplayValue('30 Days Net');
    fireEvent.change(creditInput, { target: { value: '45 Days Net' } });

    const [advInput, retInput] = screen.getAllByDisplayValue('10%');
    fireEvent.change(advInput, { target: { value: '12%' } });
    fireEvent.change(retInput, { target: { value: '8%' } });

    const abgSelect = screen.getByDisplayValue(/Yes - ABG Submitted/i);
    fireEvent.change(abgSelect, { target: { value: 'NO' } });

    const leadInput = screen.getByDisplayValue('12 - 15 Calendar Days');
    fireEvent.change(leadInput, { target: { value: '10 - 12 Calendar Days' } });

    const dateInput = screen.getByDisplayValue('2026-09-25');
    fireEvent.change(dateInput, { target: { value: '2026-09-28' } });

    const incoSelect = screen.getByDisplayValue(/FOR Site/i);
    fireEvent.change(incoSelect, { target: { value: 'EX_WORKS' } });

    const warrantyInput = screen.getByDisplayValue(/12 Months Defect Liability Period/i);
    fireEvent.change(warrantyInput, { target: { value: '24 Months Warranty' } });

    const devTextarea = screen.getByPlaceholderText(/Specify any technical exceptions/i);
    fireEvent.change(devTextarea, { target: { value: 'No major deviations' } });

    // Submit 1st round quote directly under column
    const submitBtn = screen.getByRole('button', { name: UI_STRINGS.vendorPortal.submitQuote1 });
    fireEvent.click(submitBtn);

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('1st Round Formal Quotation'));
    expect(screen.getByText(UI_STRINGS.vendorPortal.quote1Submitted)).toBeInTheDocument();
  });

  it('interacts with Tab 2 Round 2 (BAFO), multi-round columns, rate inputs, and column submission', () => {
    const { container } = render(<VendorPortal initialAuthenticated={true} />);

    // Click Tab 2
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.vendorPortal.tabQuotationSummary }));

    // Switch to Round 2
    fireEvent.click(screen.getByRole('button', { name: /2nd Quote \(BAFO\)/i }));

    // Verifies 1st quote and Buyer Offer 1 columns are displayed
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.round1Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.buyerOffer1Header).length).toBeGreaterThan(0);

    // Edit rate2 inputs (last two columns in Round 2)
    const rateInputs = container.querySelectorAll('input[type="number"]');
    if (rateInputs.length > 1) {
      fireEvent.change(rateInputs[0], { target: { value: '3300' } });
      fireEvent.change(rateInputs[1], { target: { value: '1800' } });
      fireEvent.change(rateInputs[1], { target: { value: '' } });
      fireEvent.change(rateInputs[1], { target: { value: '1500' } });
    }

    // Submit 2nd quote directly under column
    const submitBtn = screen.getByRole('button', { name: UI_STRINGS.vendorPortal.submitQuote2 });
    fireEvent.click(submitBtn);

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Revised 2nd Quote'));
    expect(screen.getByText(UI_STRINGS.vendorPortal.quote2Submitted)).toBeInTheDocument();
  });

  it('interacts with Tab 2 Round 3 (Final Settlement) and All Rounds Matrix', () => {
    const { container } = render(<VendorPortal initialAuthenticated={true} />);

    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.vendorPortal.tabQuotationSummary }));

    // Switch to Round 3
    fireEvent.click(screen.getByRole('button', { name: /3rd Quote \(Final\)/i }));

    // In Round 3, Buyer Offer 2 is visible
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.buyerOffer2Header).length).toBeGreaterThan(0);

    // Edit rate3
    const rateInputs = container.querySelectorAll('input[type="number"]');
    if (rateInputs.length > 0) {
      fireEvent.change(rateInputs[0], { target: { value: '3400' } });
    }

    // Submit 3rd quote
    const submitBtn = screen.getByRole('button', { name: UI_STRINGS.vendorPortal.submitQuote3 });
    fireEvent.click(submitBtn);

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('3rd & Final Settlement Quote'));
    expect(screen.getByText(UI_STRINGS.vendorPortal.quote3Submitted)).toBeInTheDocument();

    // Test All Rounds Matrix view
    fireEvent.click(screen.getByRole('button', { name: /All Rounds Matrix/i }));
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.round1Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.round2Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.buyerOffer1Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.buyerOffer2Header).length).toBeGreaterThan(0);
  });

  it('interacts with Tab 3 (PPO Award & Acceptance), downloads PDF, and accepts PPO', () => {
    const { container } = render(<VendorPortal initialAuthenticated={true} />);

    // Click Tab 3: PPO Award & Acceptance
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.vendorPortal.tabPPOAward }));

    expect(screen.getAllByText(/PPO-2026-0005/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Pending Vendor Acceptance/i)).toBeInTheDocument();

    // Switch vendor on PPO tab
    const vendorSelect = container.querySelectorAll('select')[0];
    fireEvent.change(vendorSelect, { target: { value: 'VND-002' } });
    expect(screen.getAllByText(/Apex Modular Systems Pvt Ltd/i).length).toBeGreaterThan(0);

    fireEvent.change(vendorSelect, { target: { value: 'VND-005' } });
    expect(screen.getAllByText(/NorthCraft Engineering & Woodworks/i).length).toBeGreaterThan(0);

    fireEvent.change(vendorSelect, { target: { value: 'VND-001' } });

    // Download PO
    const downloadBtn = screen.getByRole('button', { name: UI_STRINGS.vendorPortal.downloadPO });
    fireEvent.click(downloadBtn);
    expect(window.alert).toHaveBeenCalledWith('Downloading official signed PO PDF...');

    // Accept PPO
    const acceptPpoBtn = screen.getByRole('button', { name: UI_STRINGS.vendorPortal.acceptPPO });
    fireEvent.click(acceptPpoBtn);

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('accepted and activated!'));
    expect(screen.getByText(UI_STRINGS.vendorPortal.orderAcknowledged)).toBeInTheDocument();

    // Verify ribbon View PO button when ppoAccepted is true
    const viewPoBtn = screen.getByRole('button', { name: UI_STRINGS.vendorPortal.viewPO });
    fireEvent.click(viewPoBtn);
  });

  // =========================================================================
  // VENDOR LOGIN GATE TESTS (User: welcome / Pass: welcome)
  // =========================================================================
  it('displays Vendor Login Gate when unauthenticated', () => {
    window.sessionStorage.clear();
    render(<VendorPortal initialAuthenticated={false} />);

    expect(screen.getByText(UI_STRINGS.vendorPortal.loginTitle)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.vendorPortal.loginSubtitle)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.vendorPortal.loginHint)).toBeInTheDocument();
    expect(screen.getByTestId('vendor-userid-input')).toBeInTheDocument();
    expect(screen.getByTestId('vendor-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('vendor-login-submit')).toBeInTheDocument();
  });

  it('rejects invalid credentials with error message', () => {
    render(<VendorPortal initialAuthenticated={false} />);

    fireEvent.change(screen.getByTestId('vendor-userid-input'), {
      target: { value: 'wronguser' },
    });
    fireEvent.change(screen.getByTestId('vendor-password-input'), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByTestId('vendor-login-submit'));

    expect(screen.getByTestId('vendor-login-error')).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.vendorPortal.loginError)).toBeInTheDocument();
  });

  it('authenticates successfully with welcome / welcome and accesses portal', () => {
    render(<VendorPortal initialAuthenticated={false} />);

    fireEvent.change(screen.getByTestId('vendor-userid-input'), {
      target: { value: 'welcome' },
    });
    fireEvent.change(screen.getByTestId('vendor-password-input'), {
      target: { value: 'welcome' },
    });

    fireEvent.click(screen.getByTestId('vendor-login-submit'));

    // Accesses portal dashboard upon successful authentication
    expect(screen.getByText(UI_STRINGS.vendorPortal.roleBadge)).toBeInTheDocument();
    expect(screen.getByTestId('vendor-session-active-badge')).toBeInTheDocument();
  });

  it('supports quick-fill demo credentials button', () => {
    render(<VendorPortal initialAuthenticated={false} />);

    const quickFillBtn = screen.getByTestId('vendor-quickfill-credentials');
    fireEvent.click(quickFillBtn);

    const userInput = screen.getByTestId('vendor-userid-input') as HTMLInputElement;
    const passInput = screen.getByTestId('vendor-password-input') as HTMLInputElement;

    expect(userInput.value).toBe('welcome');
    expect(passInput.value).toBe('welcome');
  });

  it('allows logging out and returning to login page', () => {
    render(<VendorPortal initialAuthenticated={true} />);

    expect(screen.getByText(UI_STRINGS.vendorPortal.roleBadge)).toBeInTheDocument();

    const logoutBtn = screen.getByTestId('vendor-logout-button');
    fireEvent.click(logoutBtn);

    expect(screen.getByText(UI_STRINGS.vendorPortal.loginTitle)).toBeInTheDocument();
  });
});

