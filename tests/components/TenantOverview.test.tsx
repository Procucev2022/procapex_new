import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TenantOverview } from '@/components/TenantOverview';
import { useProcurement } from '@/context/ProcurementContext';
import { TENANTS } from '@/constants';

jest.mock('@/context/ProcurementContext', () => ({
  useProcurement: jest.fn(),
}));

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
    expect(screen.getByText(TENANTS.TNT_LNT.name)).toBeInTheDocument();
    expect(screen.getByText(TENANTS.TNT_TATA.name)).toBeInTheDocument();

    expect(screen.getByText('Current Active Client')).toBeInTheDocument();

    const switchButtons = screen.getAllByRole('button', { name: /Switch to this Client/i });
    expect(switchButtons.length).toBeGreaterThan(0);

    fireEvent.click(switchButtons[0]);
    expect(mockChangeTenant).toHaveBeenCalledWith('TNT_TATA');
  });
});
