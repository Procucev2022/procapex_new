import React from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { ModuleAccessGate } from '@/components/pricing';
import { ProcurementProvider, useProcurement } from '@/context/ProcurementContext';
import { UI_STRINGS, PRICING_TIERS } from '@/constants';

describe('ModuleAccessGate Component & Multi-Tenant Feature Gating', () => {
  it('renders children directly when module is allowed in active tenant tier', () => {
    render(
      <ProcurementProvider>
        <ModuleAccessGate moduleId="budget_planning">
          <div data-testid="allowed-content">Budget Planning Content Visible</div>
        </ModuleAccessGate>
      </ProcurementProvider>,
    );

    expect(screen.getByTestId('allowed-content')).toBeInTheDocument();
    expect(screen.queryByText(UI_STRINGS.pricingTiers.lockedFeatureNotice)).not.toBeInTheDocument();
  });

  it('renders locked upgrade card with required tier details when module is restricted for active tenant', () => {
    // Switch active tenant to TNT_GODREJ (Tier 1: $2,000)
    const { result } = renderHook(() => useProcurement(), {
      wrapper: ProcurementProvider,
    });

    act(() => {
      result.current.changeTenant('TNT_GODREJ');
    });

    render(
      <ProcurementProvider>
        {/* Helper wrapper to force TNT_GODREJ in context */}
        <TestTenantContextConsumer tenantKey="TNT_GODREJ" moduleId="boq_rfq_management" />
      </ProcurementProvider>,
    );

    expect(screen.getByText(UI_STRINGS.pricingTiers.lockedFeatureNotice)).toBeInTheDocument();
    expect(screen.getByText(PRICING_TIERS.MODULE_2.name)).toBeInTheDocument();
    expect(screen.getAllByText(/\$4,000/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: new RegExp(UI_STRINGS.pricingTiers.upgradeButton, 'i') })).toBeInTheDocument();
  });

  it('allows 1-click tenant plan upgrade directly from the locked card to unlock access', () => {
    render(
      <ProcurementProvider>
        <TestTenantContextConsumer tenantKey="TNT_GODREJ" moduleId="boq_rfq_management" />
      </ProcurementProvider>,
    );

    // Initial state: locked
    expect(screen.getByText(UI_STRINGS.pricingTiers.lockedFeatureNotice)).toBeInTheDocument();

    // Click upgrade button
    const upgradeBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.pricingTiers.upgradeButton, 'i') });
    fireEvent.click(upgradeBtn);

    // Unlocked: child content now rendered!
    expect(screen.getByTestId('gated-child-content')).toBeInTheDocument();
    expect(screen.queryByText(UI_STRINGS.pricingTiers.lockedFeatureNotice)).not.toBeInTheDocument();
  });
});

/**
 * Helper component that switches tenant on mount and renders ModuleAccessGate
 */
const TestTenantContextConsumer: React.FC<{ tenantKey: 'TNT_GODREJ' | 'TNT_LNT'; moduleId: string }> = ({
  tenantKey,
  moduleId,
}) => {
  const { changeTenant, activeTenantKey } = useProcurement();

  React.useEffect(() => {
    if (activeTenantKey !== tenantKey) {
      changeTenant(tenantKey);
    }
  }, [changeTenant, activeTenantKey, tenantKey]);

  return (
    <ModuleAccessGate moduleId={moduleId}>
      <div data-testid="gated-child-content">Unlocked Gated Content</div>
    </ModuleAccessGate>
  );
};
