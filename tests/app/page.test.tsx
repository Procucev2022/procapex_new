import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../../src/app/page';
import { ProcurementProvider } from '../../src/context/ProcurementContext';

// Mock child components for isolated testing of Home page routing, modals, and callbacks
jest.mock('../../src/components/Header', () => ({
  Header: ({ currentTab, setCurrentTab, onOpenNewPR }: any) => (
    <header data-testid="header">
      <span data-testid="active-tab">{currentTab}</span>
      <button onClick={() => setCurrentTab('dashboard')}>Tab Dashboard</button>
      <button onClick={() => setCurrentTab('boq_raiser_studio')}>Tab BOQ</button>
      <button onClick={() => setCurrentTab('prs')}>Tab PRS</button>
      <button onClick={() => setCurrentTab('boq')}>Tab BOQ Alias</button>
      <button onClick={() => setCurrentTab('pr_approval_queue')}>Tab PR Queue</button>
      <button onClick={() => setCurrentTab('category_manager_hub')}>Tab CM</button>
      <button onClick={() => setCurrentTab('commercial')}>Tab Commercial</button>
      <button onClick={() => setCurrentTab('ai-cost')}>Tab AICost</button>
      <button onClick={() => setCurrentTab('negotiation')}>Tab Negotiation</button>
      <button onClick={() => setCurrentTab('ppo_workorders')}>Tab PPO</button>
      <button onClick={() => setCurrentTab('ppo')}>Tab PPO Alias</button>
      <button onClick={() => setCurrentTab('vendor_portal')}>Tab Vendor</button>
      <button onClick={() => setCurrentTab('tenant_overview')}>Tab Tenant</button>
      <button onClick={() => setCurrentTab('masters')}>Tab Masters</button>
      <button onClick={onOpenNewPR}>Open New PR Header</button>
    </header>
  )
}));

jest.mock('../../src/components/Dashboard', () => ({
  Dashboard: ({ onNavigate }: any) => (
    <div data-testid="dashboard">
      <button onClick={() => onNavigate('prs')}>Dash Nav PRS</button>
      <button onClick={() => onNavigate('commercial')}>Dash Nav Commercial</button>
      <button onClick={() => onNavigate('ai-cost')}>Dash Nav AICost</button>
      <button onClick={() => onNavigate('negotiation')}>Dash Nav Negotiation</button>
      <button onClick={() => onNavigate('ppo')}>Dash Nav PPO</button>
      <button onClick={() => onNavigate('custom_tab')}>Dash Nav Other</button>
    </div>
  )
}));

jest.mock('../../src/components/PRModule', () => ({
  PRModule: ({ onNavigateToBOQ, onOpenNewPRModal }: any) => (
    <div data-testid="pr-module">
      <button onClick={() => onNavigateToBOQ('PR-2026-0005')}>PR Module Nav to BOQ</button>
      <button onClick={onOpenNewPRModal}>PR Module Open PR Modal</button>
    </div>
  )
}));

jest.mock('../../src/components/PRApprovalQueue', () => ({
  PRApprovalQueue: ({ onRouteToCategoryManager }: any) => (
    <div data-testid="pr-approval-queue">
      <button onClick={onRouteToCategoryManager}>Queue Route to CM</button>
    </div>
  )
}));

jest.mock('../../src/components/CategoryManagerHub', () => ({
  CategoryManagerHub: ({ onRouteToPPO }: any) => (
    <div data-testid="cm-hub">
      <button onClick={onRouteToPPO}>CM Route to PPO</button>
    </div>
  )
}));

jest.mock('../../src/components/PPOModule', () => ({
  PPOModule: ({ onOpenCreatePPO }: any) => (
    <div data-testid="ppo-module">
      <button onClick={onOpenCreatePPO}>PPO Open Create Modal</button>
    </div>
  )
}));

jest.mock('../../src/components/VendorPortal', () => ({
  VendorPortal: () => <div data-testid="vendor-portal">Vendor Portal</div>
}));

jest.mock('../../src/components/TenantOverview', () => ({
  TenantOverview: () => <div data-testid="tenant-overview">Tenant Overview</div>
}));

jest.mock('../../src/components/MastersAudit', () => ({
  MastersAudit: () => <div data-testid="masters-audit">Masters Audit</div>
}));

describe('Home Page (src/app/page.tsx)', () => {
  it('renders dashboard by default and navigates across all view tabs', () => {
    render(
      <ProcurementProvider>
        <Home />
      </ProcurementProvider>
    );

    // Initial view: dashboard
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('active-tab').textContent).toBe('dashboard');

    // Dashboard navigation callbacks
    fireEvent.click(screen.getByText('Dash Nav PRS'));
    expect(screen.getByTestId('pr-module')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab Dashboard'));
    fireEvent.click(screen.getByText('Dash Nav Commercial'));
    expect(screen.getByTestId('cm-hub')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab Dashboard'));
    fireEvent.click(screen.getByText('Dash Nav AICost'));
    expect(screen.getByTestId('cm-hub')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab Dashboard'));
    fireEvent.click(screen.getByText('Dash Nav Negotiation'));
    expect(screen.getByTestId('cm-hub')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab Dashboard'));
    fireEvent.click(screen.getByText('Dash Nav PPO'));
    expect(screen.getByTestId('ppo-module')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab Dashboard'));
    fireEvent.click(screen.getByText('Dash Nav Other'));
    expect(screen.getByTestId('active-tab').textContent).toBe('custom_tab');

    // Test tab switching via Header
    fireEvent.click(screen.getByText('Tab BOQ'));
    expect(screen.getByTestId('pr-module')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab PRS'));
    expect(screen.getByTestId('pr-module')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab BOQ Alias'));
    expect(screen.getByTestId('pr-module')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab PR Queue'));
    expect(screen.getByTestId('pr-approval-queue')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab CM'));
    expect(screen.getByTestId('cm-hub')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab Commercial'));
    expect(screen.getByTestId('cm-hub')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab AICost'));
    expect(screen.getByTestId('cm-hub')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab Negotiation'));
    expect(screen.getByTestId('cm-hub')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab PPO'));
    expect(screen.getByTestId('ppo-module')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab PPO Alias'));
    expect(screen.getByTestId('ppo-module')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab Vendor'));
    expect(screen.getByTestId('vendor-portal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab Tenant'));
    expect(screen.getByTestId('tenant-overview')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab Masters'));
    expect(screen.getByTestId('masters-audit')).toBeInTheDocument();
  });

  it('tests PRModule and PRApprovalQueue callbacks', () => {
    render(
      <ProcurementProvider>
        <Home />
      </ProcurementProvider>
    );

    // Switch to PR Module
    fireEvent.click(screen.getByText('Tab BOQ'));
    fireEvent.click(screen.getByText('PR Module Nav to BOQ'));
    expect(screen.getByTestId('pr-approval-queue')).toBeInTheDocument();

    // From Queue to CM
    fireEvent.click(screen.getByText('Queue Route to CM'));
    expect(screen.getByTestId('cm-hub')).toBeInTheDocument();

    // From CM to PPO
    fireEvent.click(screen.getByText('CM Route to PPO'));
    expect(screen.getByTestId('ppo-module')).toBeInTheDocument();
  });

  it('interacts with New PR Modal, inputs, cancel, X button, and form submit with/without custom fields', () => {
    render(
      <ProcurementProvider>
        <Home />
      </ProcurementProvider>
    );

    // Open via header button
    fireEvent.click(screen.getByText('Open New PR Header'));
    expect(screen.getByText(/Create New Purchase Request \(PR\)/i)).toBeInTheDocument();

    // Close via Cancel
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByText(/Create New Purchase Request \(PR\)/i)).not.toBeInTheDocument();

    // Open via PRModule button
    fireEvent.click(screen.getByText('Tab BOQ'));
    fireEvent.click(screen.getByText('PR Module Open PR Modal'));
    expect(screen.getByText(/Create New Purchase Request \(PR\)/i)).toBeInTheDocument();

    // Close via X button
    const xButtons = screen.getAllByRole('button');
    const xBtn = xButtons.find(b => b.querySelector('svg.lucide-x') !== null);
    if (xBtn) {
      fireEvent.click(xBtn);
    }
    expect(screen.queryByText(/Create New Purchase Request \(PR\)/i)).not.toBeInTheDocument();

    // Reopen and fill inputs first
    fireEvent.click(screen.getByText('Open New PR Header'));
    const titleInput = screen.getByPlaceholderText(/Supply of Ready Mix Concrete M30/i);
    const projectInput = screen.getByPlaceholderText(/Metro Line 4 Station/i);
    const remarksInput = screen.getByPlaceholderText(/Additional specifications/i);

    fireEvent.change(titleInput, { target: { value: 'Custom Steel Package' } });
    fireEvent.change(projectInput, { target: { value: 'Skyline Tower 1' } });
    fireEvent.change(remarksInput, { target: { value: 'Urgent procurement required' } });

    // Select dropdowns
    const selects = screen.getAllByRole('combobox');
    if (selects.length >= 2) {
      fireEvent.change(selects[0], { target: { value: 'CC-102 (Structural Steel)' } });
      fireEvent.change(selects[1], { target: { value: 'Structural Steel' } });
    }

    // Change date input
    const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    fireEvent.change(dateInput, { target: { value: '2026-10-15' } });

    const submitBtn = screen.getByRole('button', { name: /Submit PR Requisition/i });
    fireEvent.submit(submitBtn.closest('form')!);
    expect(screen.getByTestId('pr-approval-queue')).toBeInTheDocument();

    // Reopen and submit with empty title/project using fireEvent.submit to test fallback strings
    fireEvent.click(screen.getByText('Open New PR Header'));
    const submitBtn2 = screen.getByRole('button', { name: /Submit PR Requisition/i });
    fireEvent.submit(submitBtn2.closest('form')!);
    expect(screen.getByTestId('pr-approval-queue')).toBeInTheDocument();
  });

  it('interacts with New PPO Modal, inputs, cancel, X button, and form submit', () => {
    render(
      <ProcurementProvider>
        <Home />
      </ProcurementProvider>
    );

    // Navigate to PPO Module and open modal
    fireEvent.click(screen.getByText('Tab PPO'));
    fireEvent.click(screen.getByText('PPO Open Create Modal'));
    expect(screen.getByText(/Create Purchase Price Offer \(PPO\)/i)).toBeInTheDocument();

    // Close via Cancel
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByText(/Create Purchase Price Offer \(PPO\)/i)).not.toBeInTheDocument();

    // Reopen and close via X button
    fireEvent.click(screen.getByText('PPO Open Create Modal'));
    const xButtons = screen.getAllByRole('button');
    const xBtn = xButtons.find(b => b.querySelector('svg.lucide-x') !== null);
    if (xBtn) {
      fireEvent.click(xBtn);
    }
    expect(screen.queryByText(/Create Purchase Price Offer \(PPO\)/i)).not.toBeInTheDocument();

    // Reopen and fill inputs
    fireEvent.click(screen.getByText('PPO Open Create Modal'));

    // Target PR select
    const prSelect = screen.getByRole('combobox');
    fireEvent.change(prSelect, { target: { value: 'PR-2026-0005' } });

    // Inputs: vendor, rate, tax, payment terms, lead time
    const vendorInput = screen.getByDisplayValue('DesignCraft Millworks & Interiors Pvt Ltd');
    fireEvent.change(vendorInput, { target: { value: 'Apex Precast Solutions' } });

    const numberInputs = screen.getAllByRole('spinbutton');
    if (numberInputs.length >= 2) {
      fireEvent.change(numberInputs[0], { target: { value: '155000' } });
      fireEvent.change(numberInputs[0], { target: { value: '' } }); // test parseFloat || 0
      fireEvent.change(numberInputs[0], { target: { value: '150000' } });

      fireEvent.change(numberInputs[1], { target: { value: '12' } });
      fireEvent.change(numberInputs[1], { target: { value: '' } }); // test parseFloat || 0
      fireEvent.change(numberInputs[1], { target: { value: '18' } });
    }

    const paymentTermsInput = screen.getByDisplayValue('30 Days Net from delivery & QC signoff');
    fireEvent.change(paymentTermsInput, { target: { value: '45 Days Net Credit' } });

    const leadTimeInput = screen.getByDisplayValue('12 Calendar Days');
    fireEvent.change(leadTimeInput, { target: { value: '10 Calendar Days' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Issue PPO to Approval Queue/i }));
    expect(screen.getByTestId('ppo-module')).toBeInTheDocument();
  });
});
