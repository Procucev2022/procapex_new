import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VendorQuotationSummaryTab } from '@/components/vendor-portal/VendorQuotationSummaryTab';
import { VendorMultiRoundQuoteTable } from '@/components/vendor-portal/VendorMultiRoundQuoteTable';
import { INITIAL_VENDOR_QUOTE_ITEMS, UI_STRINGS } from '@/constants';
import type { VendorQuotedTerms } from '@/types';

const MOCK_TERMS: VendorQuotedTerms = {
  paymentStructure: 'PRESET_1',
  creditDays: '30 Days Net',
  advPct: '10%',
  retPct: '10%',
  abg: 'YES',
  leadTime: '12 - 15 Calendar Days',
  deliveryDate: '2026-09-25',
  incoterms: 'FOR_SITE',
  warranty: '12 Months DLP',
  deviations: 'None',
};

describe('VendorQuotationSummaryTab & VendorMultiRoundQuoteTable', () => {
  it('renders multi-round quotation table with Round 1 columns and column-anchored submission', () => {
    const handleRate1 = jest.fn();
    const handleRate2 = jest.fn();
    const handleRate3 = jest.fn();
    const handleSubmit1 = jest.fn();
    const handleSubmit2 = jest.fn();
    const handleSubmit3 = jest.fn();
    const handleUpdateTerms = jest.fn();

    const { container } = render(
      <VendorQuotationSummaryTab
        items={INITIAL_VENDOR_QUOTE_ITEMS}
        rfqAccepted={true}
        onRate1Change={handleRate1}
        onRate2Change={handleRate2}
        onRate3Change={handleRate3}
        quote1Submitted={false}
        quote2Submitted={false}
        quote3Submitted={false}
        onSubmitQuote1={handleSubmit1}
        onSubmitQuote2={handleSubmit2}
        onSubmitQuote3={handleSubmit3}
        terms={MOCK_TERMS}
        onUpdateTerms={handleUpdateTerms}
        onProceedToPPO={jest.fn()}
        activeRound={1}
      />
    );

    // Verify Round 1 table columns
    expect(screen.getByText(UI_STRINGS.vendorPortal.tabQuotationSummary)).toBeInTheDocument();
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.round1Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.editableRateHeader).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.calculatedAmtHeader).length).toBeGreaterThan(0);

    // Verify editable input on the last two columns
    const numberInputs = container.querySelectorAll('input[type="number"]');
    expect(numberInputs.length).toBeGreaterThan(0);
    fireEvent.change(numberInputs[0], { target: { value: '4500' } });
    expect(handleRate1).toHaveBeenCalledWith(0, '4500');

    // Verify quote submission button placed directly under the column in tfoot
    const submitBtn = screen.getByRole('button', { name: UI_STRINGS.vendorPortal.submitQuote1 });
    expect(submitBtn).toBeInTheDocument();
    fireEvent.click(submitBtn);
    expect(handleSubmit1).toHaveBeenCalled();
  });

  it('renders Round 2 (BAFO) displaying 1st quote, Buyer Offer 1, and editable 2nd quote as last columns', () => {
    const handleRate2 = jest.fn();
    const handleSubmit2 = jest.fn();

    render(
      <VendorMultiRoundQuoteTable
        items={INITIAL_VENDOR_QUOTE_ITEMS}
        activeRound={2}
        onRate1Change={jest.fn()}
        onRate2Change={handleRate2}
        onRate3Change={jest.fn()}
        quote1Submitted={true}
        quote2Submitted={false}
        quote3Submitted={false}
        onSubmitActiveRound={handleSubmit2}
      />
    );

    // Columns visible in Round 2
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.round1Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.buyerOffer1Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.round2Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.rateCol).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.amtCol).length).toBeGreaterThan(0);

    // Submit 2nd quote
    const submitBtn = screen.getByRole('button', { name: UI_STRINGS.vendorPortal.submitQuote2 });
    expect(submitBtn).toBeInTheDocument();
    fireEvent.click(submitBtn);
    expect(handleSubmit2).toHaveBeenCalled();
  });

  it('renders Round 3 (Final Settlement) displaying 2nd quote, Buyer Offer 2, and editable 3rd quote as last columns', () => {
    const handleRate3 = jest.fn();
    const handleSubmit3 = jest.fn();

    render(
      <VendorMultiRoundQuoteTable
        items={INITIAL_VENDOR_QUOTE_ITEMS}
        activeRound={3}
        onRate1Change={jest.fn()}
        onRate2Change={jest.fn()}
        onRate3Change={handleRate3}
        quote1Submitted={true}
        quote2Submitted={true}
        quote3Submitted={false}
        onSubmitActiveRound={handleSubmit3}
      />
    );

    // Columns visible in Round 3
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.round2Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.buyerOffer2Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.round3Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.rateCol).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.amtCol).length).toBeGreaterThan(0);

    // Submit 3rd quote
    const submitBtn = screen.getByRole('button', { name: UI_STRINGS.vendorPortal.submitQuote3 });
    expect(submitBtn).toBeInTheDocument();
    fireEvent.click(submitBtn);
    expect(handleSubmit3).toHaveBeenCalled();
  });

  it('renders All Rounds Matrix view showing full comparison history across all 3 rounds and 2 buyer offers', () => {
    render(
      <VendorMultiRoundQuoteTable
        items={INITIAL_VENDOR_QUOTE_ITEMS}
        activeRound="all"
        onRate1Change={jest.fn()}
        onRate2Change={jest.fn()}
        onRate3Change={jest.fn()}
        quote1Submitted={true}
        quote2Submitted={true}
        quote3Submitted={true}
        onSubmitActiveRound={jest.fn()}
      />
    );

    // All columns visible in All Rounds Matrix
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.round1Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.buyerOffer1Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.round2Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.buyerOffer2Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.round3Header).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.rateCol).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorPortal.amtCol).length).toBeGreaterThan(0);
  });
});
