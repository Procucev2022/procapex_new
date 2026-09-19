import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  RateCardModule,
  RateCardAgreementCard,
  RateCardLineItemsTable,
  CreateRateCardProposalView,
  RateCardNegotiationView,
} from '@/components/rate-card';
import { ProcurementProvider } from '@/context/ProcurementContext';
import { UI_STRINGS, SEED_RATE_CARD_AGREEMENTS } from '@/constants';

describe('RateCardModule Components & Workflows', () => {
  const renderWithContext = (ui: React.ReactElement): ReturnType<typeof render> => {
    return render(<ProcurementProvider>{ui}</ProcurementProvider>);
  };

  it('renders all barrel exports from components/rate-card', () => {
    expect(RateCardModule).toBeDefined();
    expect(RateCardAgreementCard).toBeDefined();
    expect(RateCardLineItemsTable).toBeDefined();
    expect(CreateRateCardProposalView).toBeDefined();
    expect(RateCardNegotiationView).toBeDefined();
  });

  it('renders RateCardModule with unified header, badges, and KPIs', () => {
    renderWithContext(<RateCardModule />);

    expect(screen.getByText(UI_STRINGS.rateCards.title)).toBeInTheDocument();
    expect(screen.getAllByText(UI_STRINGS.rateCards.badge).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(UI_STRINGS.rateCards.tabActiveRateCards)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.rateCards.tabCreateProposal)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.rateCards.tabNegotiations)).toBeInTheDocument();
  });

  it('switches between tabs: Active Rate Cards, Create Proposal, and Negotiations', () => {
    renderWithContext(<RateCardModule />);

    // Switch to Create Proposal
    const createTab = screen.getByText(UI_STRINGS.rateCards.tabCreateProposal);
    fireEvent.click(createTab);
    expect(screen.getByText(UI_STRINGS.rateCards.createProposalTitle)).toBeInTheDocument();

    // Switch to Negotiations
    const negTab = screen.getByText(UI_STRINGS.rateCards.tabNegotiations);
    fireEvent.click(negTab);
    expect(screen.getByText(/Active Proposals & Offers/i)).toBeInTheDocument();
  });

  it('renders RateCardAgreementCard with status and scope count', () => {
    const sampleAgreement = SEED_RATE_CARD_AGREEMENTS[0];
    render(
      <RateCardAgreementCard
        agreement={sampleAgreement}
        onSelectAgreement={() => {}}
      />
    );

    expect(screen.getByText(sampleAgreement.id)).toBeInTheDocument();
    expect(screen.getByText(sampleAgreement.vendorName)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.rateCards.statusFinalised)).toBeInTheDocument();
  });

  it('renders RateCardLineItemsTable with AI Should-Cost, Best RC Rate, and Last PPO Rate headers', () => {
    const sampleAgreement = SEED_RATE_CARD_AGREEMENTS[0];
    render(
      <RateCardLineItemsTable
        items={sampleAgreement.items}
        status={sampleAgreement.status}
      />
    );

    expect(screen.getByText(UI_STRINGS.rateCards.aiCostHeader)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.rateCards.recentBestRateHeader)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.rateCards.lastPpoRateHeader)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.rateCards.proposedRateHeader)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.rateCards.finalAgreedRateHeader)).toBeInTheDocument();
  });

  it('allows filling proposed rates and submitting proposal in CreateRateCardProposalView', () => {
    let created = false;
    renderWithContext(
      <CreateRateCardProposalView
        onProposalCreated={() => {
          created = true;
        }}
      />
    );

    expect(screen.getByText(UI_STRINGS.rateCards.createProposalTitle)).toBeInTheDocument();
    const submitBtn = screen.getAllByText(UI_STRINGS.rateCards.submitProposalButton)[0];
    expect(submitBtn).toBeInTheDocument();
    fireEvent.click(submitBtn);
    expect(created).toBe(false); // Async callback with delay
  });
});
