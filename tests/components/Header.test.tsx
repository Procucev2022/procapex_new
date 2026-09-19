import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/Header';
import { useProcurement } from '@/context/ProcurementContext';
import { UI_STRINGS } from '@/constants';

jest.mock('@/context/ProcurementContext', () => ({
  useProcurement: jest.fn(),
  TENANTS: {},
}));

describe('Header Component', () => {
  const mockSetActiveRole = jest.fn();
  const mockChangeTenant = jest.fn();
  const mockSetCurrentTab = jest.fn();
  const mockOnOpenNewPR = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useProcurement as jest.Mock).mockReturnValue({
      activeRole: 'PROJECT_TEAM',
      setActiveRole: mockSetActiveRole,
      activeTenantKey: 'TNT_LNT',
      changeTenant: mockChangeTenant,
      activeTenant: { name: 'L&T Infra & Construction' },
      activeTenantTier: 'MODULE_3',
      isModuleAllowed: jest.fn(() => true),
      isRoleAllowed: jest.fn(() => true),
    });
  });

  it('renders brand logo and title, and clicking logo navigates to budget_planning', () => {
    render(
      <Header
        currentTab="boq_raiser_studio"
        setCurrentTab={mockSetCurrentTab}
        onOpenNewPR={mockOnOpenNewPR}
      />
    );

    expect(screen.getByText(UI_STRINGS.header.brandName)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.header.brandBadge)).toBeInTheDocument();

    const logo = screen.getByText(UI_STRINGS.header.brandName).closest('div');
    fireEvent.click(logo!);
    expect(mockSetCurrentTab).toHaveBeenCalledWith('budget_planning');
  });

  it('changes tenant when selecting client from dropdown', () => {
    render(
      <Header
        currentTab="dashboard"
        setCurrentTab={mockSetCurrentTab}
        onOpenNewPR={mockOnOpenNewPR}
      />
    );

    const clientSelect = screen.getByDisplayValue('🏢 L&T Infra & Construction');
    fireEvent.change(clientSelect, { target: { value: 'TNT_TATA' } });
    expect(mockChangeTenant).toHaveBeenCalledWith('TNT_TATA');
  });

  it('switches tabs properly for each governance role change', () => {
    const { rerender } = render(
      <Header
        currentTab="dashboard"
        setCurrentTab={mockSetCurrentTab}
        onOpenNewPR={mockOnOpenNewPR}
      />
    );

    const roleSelect = screen.getByDisplayValue(UI_STRINGS.header.roleOptionBOQRFQManager);

    // 1. BOQ_RFQ_MANAGER
    fireEvent.change(roleSelect, { target: { value: 'BOQ_RFQ_MANAGER' } });
    expect(mockSetActiveRole).toHaveBeenCalledWith('BOQ_RFQ_MANAGER');
    expect(mockSetCurrentTab).toHaveBeenCalledWith('boq_rfq_management');

    // 2. VENDOR_NEGOTIATION_HUB
    fireEvent.change(roleSelect, { target: { value: 'VENDOR_NEGOTIATION_HUB' } });
    expect(mockSetActiveRole).toHaveBeenCalledWith('VENDOR_NEGOTIATION_HUB');
    expect(mockSetCurrentTab).toHaveBeenCalledWith('boq_rfq_management');

    // 3. CATEGORY_MANAGER_2
    fireEvent.change(roleSelect, { target: { value: 'CATEGORY_MANAGER_2' } });
    expect(mockSetCurrentTab).toHaveBeenCalledWith('ppo_workorders');

    // 4. PROJECT_HEAD_PPO
    fireEvent.change(roleSelect, { target: { value: 'PROJECT_HEAD_PPO' } });
    expect(mockSetCurrentTab).toHaveBeenCalledWith('ppo_workorders');

    // 5. FINANCE_HEAD
    fireEvent.change(roleSelect, { target: { value: 'FINANCE_HEAD' } });
    expect(mockSetCurrentTab).toHaveBeenCalledWith('budget_planning');

    // 6. VENDOR
    fireEvent.change(roleSelect, { target: { value: 'VENDOR' } });
    expect(mockSetActiveRole).toHaveBeenLastCalledWith('VENDOR');
    expect(mockSetCurrentTab).toHaveBeenCalledWith('vendor_portal');
  });

  it('handles Finance Manager Login button click and active state', () => {
    const { rerender } = render(
      <Header
        currentTab="dashboard"
        setCurrentTab={mockSetCurrentTab}
      />
    );

    const financeLoginBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.header.financeManagerLoginButton, 'i') });
    expect(financeLoginBtn).toBeInTheDocument();
    fireEvent.click(financeLoginBtn);

    expect(mockSetActiveRole).toHaveBeenCalledWith('FINANCE_HEAD');
    expect(mockSetCurrentTab).toHaveBeenCalledWith('budget_planning');

    // Rerender as FINANCE_HEAD on budget_planning tab
    (useProcurement as jest.Mock).mockReturnValue({
      activeRole: 'FINANCE_HEAD',
      setActiveRole: mockSetActiveRole,
      activeTenantKey: 'TNT_LNT',
      changeTenant: mockChangeTenant,
      activeTenant: { name: 'L&T Infra & Construction' },
    });

    rerender(
      <Header
        currentTab="budget_planning"
        setCurrentTab={mockSetCurrentTab}
      />
    );

    expect(screen.getByText(UI_STRINGS.header.financeManagerActiveLabel)).toBeInTheDocument();
  });

  it('renders all nav tab items and switches active tab on click', () => {
    render(
      <Header
        currentTab="dashboard"
        setCurrentTab={mockSetCurrentTab}
      />
    );

    const tabLabels = [
      'BOQ Studio & RFQ Management',
      'PPO Approvals',
      'Vendor Portal (Bidding)',
      'Tenant Hierarchy',
      'Masters & Audit',
    ];

    tabLabels.forEach((label) => {
      const tabBtn = screen.getByRole('button', { name: label });
      expect(tabBtn).toBeInTheDocument();
      fireEvent.click(tabBtn);
    });

    // Also click Budget Planning tab
    const budgetTabBtn = screen.getByRole('button', { name: /Project Cost Budget Planning/i });
    expect(budgetTabBtn).toBeInTheDocument();
    fireEvent.click(budgetTabBtn);
    expect(mockSetCurrentTab).toHaveBeenCalledWith('budget_planning');

    // Also click PPO Approvals tab
    const ppoTabBtn = screen.getByRole('button', { name: /PPO Approvals/i });
    expect(ppoTabBtn).toBeInTheDocument();
    fireEvent.click(ppoTabBtn);
    expect(mockSetCurrentTab).toHaveBeenCalledWith('ppo_workorders');
  });
});
