import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TenantOverview } from '@/components/TenantOverview';
import { useProcurement, TENANTS } from '@/context/ProcurementContext';

jest.mock('@/context/ProcurementContext', () => {
  const actualTenants = {
    TNT_LNT: {
      id: 'TNT-LNT-001',
      name: 'Larsen & Toubro ECC',
      short: 'L&T',
      project: 'Noida International Airport Terminal 1',
      team: {
        PROJECT_TEAM: { name: 'Amitabh Sen', title: 'Senior Project Engineer' },
        PROJECT_HEAD_PR: { name: 'Capt. R. K. Nair', title: 'Project Director' },
        CATEGORY_MANAGER: { name: 'Divya Nair', title: 'Category Manager' },
        FINANCE_HEAD: { name: 'K. Venkatraman', title: 'VP Commercial' },
      },
    },
    TNT_TATA: {
      id: 'TNT-TATA-002',
      name: 'Tata Projects Global',
      short: 'Tata',
      project: 'Mumbai Coastal Road Project Package 2',
      team: {
        PROJECT_TEAM: { name: 'Rahul Joshi', title: 'Lead Site Engineer' },
        PROJECT_HEAD_PR: { name: 'Sanjay Deshmukh', title: 'Chief Project Manager' },
        CATEGORY_MANAGER: { name: 'Priya Sharma', title: 'Category Manager' },
        FINANCE_HEAD: { name: 'Nilesh Parekh', title: 'Head of Finance' },
      },
    },
  };
  return {
    useProcurement: jest.fn(),
    TENANTS: actualTenants,
  };
});

describe('TenantOverview Component', () => {
  const mockChangeTenant = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useProcurement as jest.Mock).mockReturnValue({
      activeTenantKey: 'TNT_LNT',
      changeTenant: mockChangeTenant,
    });
  });

  it('renders enterprise client roster cards and allows switching client', () => {
    render(<TenantOverview />);

    expect(screen.getByText('Multi-Tenancy Architecture & Corporate Roster')).toBeInTheDocument();
    expect(screen.getByText('Larsen & Toubro ECC')).toBeInTheDocument();
    expect(screen.getByText('Tata Projects Global')).toBeInTheDocument();

    expect(screen.getByText('Current Active Client')).toBeInTheDocument();

    const switchButtons = screen.getAllByRole('button', { name: /Switch to this Client/i });
    expect(switchButtons.length).toBeGreaterThan(0);

    fireEvent.click(switchButtons[0]);
    expect(mockChangeTenant).toHaveBeenCalledWith('TNT_TATA');
  });
});
