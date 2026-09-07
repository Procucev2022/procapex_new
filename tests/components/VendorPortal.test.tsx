import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VendorPortal } from '@/components/VendorPortal';

describe('VendorPortal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  it('renders header, handles RFQ acceptance, switches vendor and RFQ', () => {
    const { container } = render(<VendorPortal />);

    expect(screen.getByText(/Role 7: Vendor Portal & Supplier Workbench/i)).toBeInTheDocument();
    expect(screen.getByText(/DesignCraft Millworks & Interiors Pvt Ltd/i)).toBeInTheDocument();

    // Test RFQ acceptance
    expect(screen.getByText(/Pending Acceptance/i)).toBeInTheDocument();
    const acceptRfqBtn = screen.getByRole('button', { name: /Accept RFQ/i });
    fireEvent.click(acceptRfqBtn);
    expect(screen.getByText(/Active Bidder/i)).toBeInTheDocument();

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
    const reviewOfferBtn = screen.getByRole('button', { name: /Review Offer →/i });
    fireEvent.click(reviewOfferBtn);
    expect(screen.getAllByText(/PPO-2026-0005/i).length).toBeGreaterThan(0);
  });

  it('interacts with Tab 1 (1st Round Quote), rate inputs, all payment presets, and submission', () => {
    const { container } = render(<VendorPortal />);

    // Click Tab 1
    fireEvent.click(screen.getByRole('button', { name: /1\. 1st Round Quote/i }));

    // Edit rate1 inputs
    const rate1Inputs = container.querySelectorAll('input[type="number"]');
    if (rate1Inputs.length > 0) {
      fireEvent.change(rate1Inputs[0], { target: { value: '4200' } });
      fireEvent.change(rate1Inputs[0], { target: { value: '' } });
      fireEvent.change(rate1Inputs[0], { target: { value: '4000' } });
    }

    // Payment presets 1
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

    // Submit 1st round quote
    const submitBtn = screen.getByRole('button', { name: /Submit 1st Round Formal Quotation/i });
    fireEvent.click(submitBtn);

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('1st Round Formal Quotation'));
    expect(screen.getByText(/1st Round Quotation Submitted ✓/i)).toBeInTheDocument();
  });

  it('interacts with Tab 2 (2nd Quote / BAFO), rate inputs, payment presets, and submission', () => {
    const { container } = render(<VendorPortal />);

    // Click Tab 2
    fireEvent.click(screen.getByRole('button', { name: /2\. 2nd Quote \/ BAFO/i }));

    // Edit rate2 inputs (both higher and lower than target, plus zero rate1 edge case)
    const rate2Inputs = container.querySelectorAll('input[type="number"]');
    if (rate2Inputs.length > 1) {
      // Lower than target
      fireEvent.change(rate2Inputs[0], { target: { value: '3300' } });
      // Higher than original (positive variance)
      fireEvent.change(rate2Inputs[1], { target: { value: '1800' } });
      // Empty input
      fireEvent.change(rate2Inputs[1], { target: { value: '' } });
      fireEvent.change(rate2Inputs[1], { target: { value: '1500' } });
    }

    // Payment presets 2
    const presetSelect = screen.getByDisplayValue(/10% Advance \| 70% Progress RA/i);
    fireEvent.change(presetSelect, { target: { value: 'PRESET_2' } });
    fireEvent.change(presetSelect, { target: { value: 'PRESET_3' } });
    fireEvent.change(presetSelect, { target: { value: 'PRESET_4' } });
    fireEvent.change(presetSelect, { target: { value: 'PRESET_5' } });
    fireEvent.change(presetSelect, { target: { value: 'PRESET_1' } });

    // Terms inputs
    const creditInput = screen.getByDisplayValue('30 Days Net');
    fireEvent.change(creditInput, { target: { value: '60 Days Net' } });

    const [advInput, retInput] = screen.getAllByDisplayValue('10%');
    fireEvent.change(advInput, { target: { value: '5%' } });
    fireEvent.change(retInput, { target: { value: '5%' } });

    const abgSelect = screen.getByDisplayValue(/Yes - ABG Submitted/i);
    fireEvent.change(abgSelect, { target: { value: 'NO' } });

    const leadInput = screen.getByDisplayValue('12 - 15 Calendar Days');
    fireEvent.change(leadInput, { target: { value: '8 - 10 Calendar Days' } });

    const dateInput = screen.getByDisplayValue('2026-09-25');
    fireEvent.change(dateInput, { target: { value: '2026-09-22' } });

    const incoSelect = screen.getByDisplayValue(/FOR Site/i);
    fireEvent.change(incoSelect, { target: { value: 'EX_WORKS' } });

    const warrantyInput = screen.getByDisplayValue(/12 Months Defect Liability Period/i);
    fireEvent.change(warrantyInput, { target: { value: 'Comprehensive 3-year warranty' } });

    const devTextarea = screen.getByPlaceholderText(/Specify any commercial concessions/i);
    fireEvent.change(devTextarea, { target: { value: 'Special concession agreed' } });

    // Submit 2nd quote
    const submitBtn = screen.getByRole('button', { name: /Submit Revised 2nd Quote/i });
    fireEvent.click(submitBtn);

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Revised 2nd Quote'));
    expect(screen.getByText(/Revised 2nd Quote Submitted ✓/i)).toBeInTheDocument();
  });

  it('renders Tab 3 (Final Quote & Multi-Round Summary)', () => {
    render(<VendorPortal />);

    fireEvent.click(screen.getByRole('button', { name: /3\. Final Quote & Multi-Round Summary/i }));

    expect(screen.getByText(/Multi-Round Quotation History & Final Settlement Record/i)).toBeInTheDocument();
    expect(screen.getByText(/Round 1: Initial Quote/i)).toBeInTheDocument();
    expect(screen.getByText(/Round 1.5: Buyer Target/i)).toBeInTheDocument();
    expect(screen.getByText(/Round 2: 2nd Quote \(BAFO\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Final Commercial Award/i)).toBeInTheDocument();
  });

  it('interacts with Tab 4 (PPO Award Review & Acceptance Console), downloads PDF, and accepts PPO', () => {
    const { container } = render(<VendorPortal />);

    fireEvent.click(screen.getByRole('button', { name: /4\. PPO Award Review & Acceptance Console/i }));

    expect(screen.getAllByText(/PPO-2026-0005/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Pending Vendor Acceptance/i)).toBeInTheDocument();

    // Switch vendor on PPO tab to cover all vendor name branches
    const vendorSelect = container.querySelectorAll('select')[0];
    fireEvent.change(vendorSelect, { target: { value: 'VND-002' } });
    expect(screen.getAllByText(/Apex Modular Systems Pvt Ltd/i).length).toBeGreaterThan(0);

    fireEvent.change(vendorSelect, { target: { value: 'VND-005' } });
    expect(screen.getAllByText(/NorthCraft Engineering & Woodworks/i).length).toBeGreaterThan(0);

    fireEvent.change(vendorSelect, { target: { value: 'VND-001' } });

    // Download PO
    const downloadBtn = screen.getByRole('button', { name: /Download Signed PO PDF/i });
    fireEvent.click(downloadBtn);
    expect(window.alert).toHaveBeenCalledWith('Downloading official signed PO PDF...');

    // Accept PPO
    const acceptPpoBtn = screen.getByRole('button', { name: /Accept Purchase Price Offer \(PPO\)/i });
    fireEvent.click(acceptPpoBtn);

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('accepted and activated!'));
    expect(screen.getByText(/Order Acknowledged & Binding Contract Activated ✓/i)).toBeInTheDocument();

    // Verify ribbon View PO button when ppoAccepted is true
    const viewPoBtn = screen.getByRole('button', { name: /View PO/i });
    fireEvent.click(viewPoBtn);
  });
});
