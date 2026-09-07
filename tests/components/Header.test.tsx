import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/Header';
import { useProcurement } from '@/context/ProcurementContext';

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
    });
  });

  it('renders brand logo and title, and clicking logo navigates to dashboard', () => {
    render(
      <Header
        currentTab="boq_raiser_studio"
        setCurrentTab={mockSetCurrentTab}
        onOpenNewPR={mockOnOpenNewPR}
      />
    );

    expect(screen.getByText('ProCPX')).toBeInTheDocument();
    expect(screen.getByText('Multi-Tenant SaaS')).toBeInTheDocument();

    const logo = screen.getByText('ProCPX').closest('div');
    fireEvent.click(logo!);
    expect(mockSetCurrentTab).toHaveBeenCalledWith('dashboard');
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

    const roleSelect = screen.getByDisplayValue('1. Project Team (PR Raiser & BOQ Studio)');

    // 1. PROJECT_TEAM
    fireEvent.change(roleSelect, { target: { value: 'PROJECT_TEAM' } });
    expect(mockSetActiveRole).toHaveBeenCalledWith('PROJECT_TEAM');
    expect(mockSetCurrentTab).toHaveBeenCalledWith('boq_raiser_studio');

    // 2. PROJECT_HEAD_PR
    fireEvent.change(roleSelect, { target: { value: 'PROJECT_HEAD_PR' } });
    expect(mockSetCurrentTab).toHaveBeenCalledWith('pr_approval_queue');

    // 3. CATEGORY_MANAGER
    fireEvent.change(roleSelect, { target: { value: 'CATEGORY_MANAGER' } });
    expect(mockSetCurrentTab).toHaveBeenCalledWith('category_manager_hub');

    // 4. CATEGORY_MANAGER_2
    fireEvent.change(roleSelect, { target: { value: 'CATEGORY_MANAGER_2' } });
    expect(mockSetCurrentTab).toHaveBeenCalledWith('ppo_workorders');

    // 5. PROJECT_HEAD_PPO
    fireEvent.change(roleSelect, { target: { value: 'PROJECT_HEAD_PPO' } });
    expect(mockSetCurrentTab).toHaveBeenCalledWith('ppo_workorders');

    // 6. FINANCE_HEAD
    fireEvent.change(roleSelect, { target: { value: 'FINANCE_HEAD' } });
    expect(mockSetCurrentTab).toHaveBeenCalledWith('ppo_workorders');

    // 7. VENDOR
    fireEvent.change(roleSelect, { target: { value: 'VENDOR' } });
    expect(mockSetActiveRole).toHaveBeenLastCalledWith('VENDOR');
    expect(mockSetCurrentTab).toHaveBeenCalledWith('vendor_portal');
  });

  it('handles "Raise New PR" button click', () => {
    render(
      <Header
        currentTab="dashboard"
        setCurrentTab={mockSetCurrentTab}
        onOpenNewPR={mockOnOpenNewPR}
      />
    );

    const raiseBtn = screen.getByRole('button', { name: /Raise New PR/i });
    fireEvent.click(raiseBtn);

    expect(mockSetActiveRole).toHaveBeenCalledWith('PROJECT_TEAM');
    expect(mockSetCurrentTab).toHaveBeenCalledWith('boq_raiser_studio');
    expect(mockOnOpenNewPR).toHaveBeenCalled();
  });

  it('renders all nav tab items and switches active tab on click', () => {
    render(
      <Header
        currentTab="dashboard"
        setCurrentTab={mockSetCurrentTab}
        onOpenNewPR={mockOnOpenNewPR}
      />
    );

    const tabLabels = [
      'Dashboard',
      '1. Create PR & BOQ Studio',
      '2. PR Approvals',
      '3. Category Manager (Buyer Hub)',
      '4-6. PPO Approval & PO Release',
      '7. Vendor Portal (Bidding)',
      'Tenant Hierarchy',
      'Masters & Audit',
    ];

    tabLabels.forEach((label) => {
      const tabBtn = screen.getByRole('button', { name: label });
      expect(tabBtn).toBeInTheDocument();
      fireEvent.click(tabBtn);
    });

    expect(mockSetCurrentTab).toHaveBeenCalledWith('masters');
  });
});
