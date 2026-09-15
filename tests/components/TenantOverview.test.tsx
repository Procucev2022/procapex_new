import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TenantOverview } from '@/components/TenantOverview';
import { useProcurement } from '@/context/ProcurementContext';
import { TENANTS, UI_STRINGS } from '@/constants';

jest.mock('@/context/ProcurementContext', () => ({
  useProcurement: jest.fn(),
}));

describe('TenantOverview Component', () => {
  const mockChangeTenant = jest.fn();
  const mockChangeTenantTier = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useProcurement as jest.Mock).mockReturnValue({
      activeTenantKey: 'TNT_LNT',
      changeTenant: mockChangeTenant,
      changeTenantTier: mockChangeTenantTier,
      tenantTiers: {
        TNT_LNT: 'MODULE_3',
        TNT_TATA: 'MODULE_2',
        TNT_GODREJ: 'MODULE_1',
        TNT_SHAPOORJI: 'MODULE_3',
      },
      activeTenantTier: 'MODULE_3',
    });
  });

  it('renders enterprise client roster cards and allows switching client', () => {
    render(<TenantOverview />);

    expect(screen.getByText(UI_STRINGS.tenantOverview.title)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.pricingTiers.title)).toBeInTheDocument();
    expect(screen.getAllByText(/\$2,000/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/\$4,000/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/\$6,000/i).length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText(TENANTS.TNT_LNT.name)).toBeInTheDocument();
    expect(screen.getByText(TENANTS.TNT_TATA.name)).toBeInTheDocument();

    expect(screen.getByText(UI_STRINGS.tenantOverview.currentActiveClient)).toBeInTheDocument();

    const switchButtons = screen.getAllByRole('button', { name: new RegExp(UI_STRINGS.tenantOverview.switchToClient, 'i') });
    expect(switchButtons.length).toBeGreaterThan(0);

    fireEvent.click(switchButtons[0]);
    expect(mockChangeTenant).toHaveBeenCalledWith('TNT_TATA');
  });

  it('allows changing subscription tier for a client tenant', () => {
    render(<TenantOverview />);

    const selectElements = screen.getAllByLabelText(/change subscription tier/i);
    expect(selectElements.length).toBeGreaterThan(0);

    fireEvent.change(selectElements[0], { target: { value: 'MODULE_1' } });
    expect(mockChangeTenantTier).toHaveBeenCalledWith('TNT_LNT', 'MODULE_1');
  });
});
