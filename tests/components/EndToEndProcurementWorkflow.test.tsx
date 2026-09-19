import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProcurementProvider, useProcurement } from '@/context/ProcurementContext';
import { PRModule } from '@/components/PRModule';
import { CategoryManagerHub } from '@/components/CategoryManagerHub';
import { PPOModule } from '@/components/PPOModule';
import { VendorManagementModule } from '@/components/vendor-management';
import { UI_STRINGS } from '@/constants';

// Test Harness linking PR, RFQ Hub, PPO, and Vendor Management
const EndToEndTestHarness: React.FC = () => {
  const { prs, ppos } = useProcurement();
  const [activeView, setActiveView] = useState<'pr' | 'rfq' | 'ppo' | 'vendor'>('pr');
  const [selectedPRId, setSelectedPRId] = useState<string>('PR-2026-0005');

  return (
    <div>
      <div data-testid="workflow-nav">
        <button onClick={() => setActiveView('pr')}>View PR</button>
        <button onClick={() => setActiveView('rfq')}>View RFQ Hub</button>
        <button onClick={() => setActiveView('ppo')}>View PPO</button>
        <button onClick={() => setActiveView('vendor')}>View Vendor</button>
      </div>

      <div data-testid="prs-count">{prs.length}</div>
      <div data-testid="ppos-count">{ppos.length}</div>

      {activeView === 'pr' && (
        <PRModule
          onNavigateToBOQ={(prId) => {
            if (prId) setSelectedPRId(prId);
            setActiveView('rfq');
          }}
          onSelectPRForBOQ={(prId) => {
            if (prId) setSelectedPRId(prId);
          }}
        />
      )}

      {activeView === 'rfq' && (
        <CategoryManagerHub
          initialPRId={selectedPRId}
          onRouteToPPO={() => setActiveView('ppo')}
        />
      )}

      {activeView === 'ppo' && <PPOModule />}

      {activeView === 'vendor' && <VendorManagementModule />}
    </div>
  );
};

describe('End-to-End Procurement Workflow: PR to PPO and Vendor Profile Reflection', () => {
  beforeEach(() => {
    window.alert = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('completes the full flow: raise PR -> RFQ tender -> Commercial CBA -> Award PPO -> Tier Approvals -> PO release -> Vendor Rating', () => {
    render(
      <ProcurementProvider>
        <EndToEndTestHarness />
      </ProcurementProvider>
    );

    // =========================================================================
    // 1. BOQ STUDIO: Verify Draft BOQ and Proceed to Raise RFQ
    // =========================================================================
    expect(screen.getByText(UI_STRINGS.prModule.title)).toBeInTheDocument();

    // Click Proceed to Raise RFQ directly from BOQ Studio
    const proceedToRfqBtns = screen.getAllByRole('button', {
      name: new RegExp(UI_STRINGS.prModule.proceedToRaiseRFQ, 'i'),
    });
    fireEvent.click(proceedToRfqBtns[0]);

    // =========================================================================
    // 2. RFQ & COMMERCIAL COMMAND CENTER: Ingestion, RFQ tender, Commercial Matrix
    // =========================================================================
    expect(screen.getByText(UI_STRINGS.categoryManagerHub.title)).toBeInTheDocument();

    // Select PR-2026-0005 package to evaluate the commercial quotation matrix and L1 award
    const pr5Btn = screen.queryByRole('button', { name: 'PR-2026-0005' });
    if (pr5Btn) {
      fireEvent.click(pr5Btn);
    }

    // Verify PR-2026-0005 is active in RFQ Hub
    expect(
      screen.getAllByText(/Fabrication & Installation of Reception Counter/i).length
    ).toBeGreaterThan(0);

    // Publish RFQ to nominated vendors
    const publishRfqBtn =
      screen.queryByRole('button', {
        name: /Submit RFQ to Nominated Vendors/i,
      }) ??
      screen.getByRole('button', {
        name: /Tender Published|RFQ Published/i,
      });
    fireEvent.click(publishRfqBtn);
    expect(screen.getByText(UI_STRINGS.categoryManagerHub.rfqSubmittedNotice)).toBeInTheDocument();

    // Move to Tab 2: 4-Way Commercial Matrix & CBA
    const commercialTabBtn = screen.getByRole('button', {
      name: UI_STRINGS.categoryManagerHub.tabCommercial,
    });
    fireEvent.click(commercialTabBtn);

    // Award L1 Vendor to generate PPO
    const awardL1Btn = screen.getByRole('button', {
      name: /Award & Generate PPO \(L1 Winner\)/i,
    });
    fireEvent.click(awardL1Btn);

    // Tab 5 (PPO Proposal & Routing) should now be active
    expect(screen.getByText(UI_STRINGS.categoryManagerHub.backToCommercial)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.categoryManagerHub.routePPOToWorkflow)).toBeInTheDocument();

    // Click "Route PPO to Workflow Approvals ->"
    const routePpoBtn = screen.getByRole('button', {
      name: UI_STRINGS.categoryManagerHub.routePPOToWorkflow,
    });
    fireEvent.click(routePpoBtn);

    // =========================================================================
    // 3. PPO MODULE: PPO Review, Sign-offs, PO Release
    // =========================================================================
    expect(screen.getByText(UI_STRINGS.ppoModule.title)).toBeInTheDocument();

    // Check All PPOs tab to confirm the PPO is registered in context
    const allPposTab = screen.getByRole('button', { name: /All PPOs/i });
    fireEvent.click(allPposTab);
    expect(screen.getAllByText(/PR-2026-0005/i).length).toBeGreaterThan(0);

    // Switch back to Workflow tab for 3-Tier sign-off
    const workflowTab = screen.getByRole('button', { name: UI_STRINGS.ppoModule.tabWorkflow });
    fireEvent.click(workflowTab);

    // Sign-off Tier 1
    const tier1Btn = screen.getByRole('button', { name: UI_STRINGS.ppoModule.tier1SignOff });
    fireEvent.click(tier1Btn);

    // Sign-off Tier 2 (budget clearance and PO release)
    const tier2Btn = screen.getByRole('button', { name: UI_STRINGS.ppoModule.tier2SignOff });
    fireEvent.click(tier2Btn);

    // Verify PO Released banner appears
    expect(screen.getByText(UI_STRINGS.ppoModule.badgePoReleased)).toBeInTheDocument();
    expect(screen.getByText(/Officially Issued/i)).toBeInTheDocument();

    // =========================================================================
    // 4. VENDOR MANAGEMENT & PROFILE REFLECTION
    // =========================================================================
    fireEvent.click(screen.getByText('View Vendor'));

    // Verify Vendor Directory renders
    expect(screen.getByText(UI_STRINGS.vendorManagement.title)).toBeInTheDocument();

    // Find vendor row and click "Rate PPO"
    const rateBtns = screen.getAllByRole('button', {
      name: new RegExp(UI_STRINGS.vendorManagement.actionRatePPO, 'i'),
    });
    expect(rateBtns.length).toBeGreaterThan(0);
    fireEvent.click(rateBtns[0]);

    // PPORatingModal should open and list PPO options
    expect(screen.getByText(UI_STRINGS.vendorManagement.ppoRatingModalTitle)).toBeInTheDocument();

    // Submit PPO performance rating
    const submitRatingBtn = screen.getByRole('button', {
      name: new RegExp(UI_STRINGS.vendorManagement.submitRatingButton, 'i'),
    });
    fireEvent.click(submitRatingBtn);

    // Verify modal closed and directory is back in view
    expect(screen.queryByText(UI_STRINGS.vendorManagement.ppoRatingModalTitle)).not.toBeInTheDocument();
  });
});
