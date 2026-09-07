import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ProcurementProvider, useProcurement, TENANTS } from '@/context/ProcurementContext';

describe('ProcurementContext', () => {
  it('throws error when useProcurement is used outside of ProcurementProvider', () => {
    // Suppress console.error for expected thrown error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      renderHook(() => useProcurement());
    }).toThrow('useProcurement must be used within ProcurementProvider');

    consoleSpy.mockRestore();
  });

  it('provides initial state and tenant configurations', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProcurementProvider>{children}</ProcurementProvider>
    );
    const { result } = renderHook(() => useProcurement(), { wrapper });

    expect(result.current.activeTenantKey).toBe('TNT_LNT');
    expect(result.current.activeTenant.name).toBe('L&T Infra & Construction Ltd');
    expect(result.current.activeRole).toBe('PROJECT_TEAM');
    expect(result.current.prs.length).toBeGreaterThan(0);
    expect(result.current.ppos.length).toBeGreaterThan(0);
    expect(result.current.pos.length).toBeGreaterThan(0);
    expect(result.current.auditLogs.length).toBeGreaterThan(0);
    expect(result.current.tenants).toBe(TENANTS);
  });

  it('allows changing active tenant and active role', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProcurementProvider>{children}</ProcurementProvider>
    );
    const { result } = renderHook(() => useProcurement(), { wrapper });

    act(() => {
      result.current.changeTenant('TNT_TATA');
      result.current.setActiveRole('CATEGORY_MANAGER');
    });

    expect(result.current.activeTenantKey).toBe('TNT_TATA');
    expect(result.current.activeTenant.name).toBe('Tata Projects Global');
    expect(result.current.activeRole).toBe('CATEGORY_MANAGER');
  });

  it('progresses through 3-tier PPO approval workflow and resets tiers', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProcurementProvider>{children}</ProcurementProvider>
    );
    const { result } = renderHook(() => useProcurement(), { wrapper });

    expect(result.current.tier1Approved).toBe(false);
    expect(result.current.tier2Approved).toBe(false);
    expect(result.current.tier3Approved).toBe(false);
    expect(result.current.poReleased).toBe(false);

    // Tier 1
    act(() => {
      result.current.approveTier1();
    });
    expect(result.current.tier1Approved).toBe(true);
    expect(result.current.auditLogs[0].action).toBe('PPO Tier 1 Signed-off');

    // Tier 2
    act(() => {
      result.current.approveTier2();
    });
    expect(result.current.tier2Approved).toBe(true);
    expect(result.current.auditLogs[0].action).toBe('PPO Tier 2 Signed-off');

    // Tier 3 & Release PO
    act(() => {
      result.current.approveTier3AndReleasePO();
    });
    expect(result.current.tier3Approved).toBe(true);
    expect(result.current.poReleased).toBe(true);
    expect(result.current.auditLogs[0].action).toBe('PPO Tier 3 Signed & PO Released');

    const ppo15 = result.current.ppos.find(p => p.id === 'PPO-2026-0015');
    expect(ppo15?.status).toBe('APPROVED_PO_ISSUED');

    // Reset tiers
    act(() => {
      result.current.resetTiers();
    });
    expect(result.current.tier1Approved).toBe(false);
    expect(result.current.tier2Approved).toBe(false);
    expect(result.current.tier3Approved).toBe(false);
    expect(result.current.poReleased).toBe(false);
  });

  it('handles PR creation, status updates, and BOQ item updates', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProcurementProvider>{children}</ProcurementProvider>
    );
    const { result } = renderHook(() => useProcurement(), { wrapper });

    // Create PR
    act(() => {
      result.current.createPR({
        title: 'Electrical Substation Transformers',
        projectName: 'Terminal 1',
        costCentre: 'CC-ELEC-01',
        category: 'Electrical Works',
        requester: 'Amitabh Sen',
        reqDate: '2026-09-07',
        requiredDate: '2026-10-01',
        items: [{ code: 'TRF-01', desc: 'Transformer 1000kVA', uom: 'Nos', qty: 2 }],
      });
    });

    const newPR = result.current.prs[0];
    expect(newPR.title).toBe('Electrical Substation Transformers');
    expect(newPR.status).toBe('SUBMITTED');
    expect(newPR.buyer).toBe('Unassigned');

    // Approve by Project Head
    act(() => {
      result.current.approvePRByProjectHead(newPR.id);
    });
    const approvedPR = result.current.prs.find(p => p.id === newPR.id);
    expect(approvedPR?.status).toBe('APPROVED_BY_PROJECT_HEAD');

    // Update PR status to ACCEPTED
    act(() => {
      result.current.updatePRStatus(newPR.id, 'ACCEPTED');
    });
    const acceptedPR = result.current.prs.find(p => p.id === newPR.id);
    expect(acceptedPR?.buyer).toBe('Vikram Mehta (Category Mgr)');

    // Update PR status without comments
    act(() => {
      result.current.updatePRStatus(newPR.id, 'CANCELLED');
    });
    const cancelledPR = result.current.prs.find(p => p.id === newPR.id);
    expect(cancelledPR?.status).toBe('CANCELLED');

    // Update BOQ items
    act(() => {
      result.current.updateBOQItems(newPR.id, [
        { code: 'TRF-01', desc: 'Updated Transformer', uom: 'Nos', qty: 3 },
      ]);
    });
    const updatedBOQPR = result.current.prs.find(p => p.id === newPR.id);
    expect(updatedBOQPR?.items[0].qty).toBe(3);
  });

  it('handles adding negotiation rounds for existing and new PRs', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProcurementProvider>{children}</ProcurementProvider>
    );
    const { result } = renderHook(() => useProcurement(), { wrapper });

    // Buyer counter
    act(() => {
      result.current.addNegotiationRound('PR-2026-0005', 145000, 'Volume offer', 'BUYER_COUNTER');
    });
    const pr5Nego = result.current.negotiations['PR-2026-0005'];
    expect(pr5Nego[pr5Nego.length - 1].user).toBe('Vikram Mehta (Category Mgr)');
    expect(pr5Nego[pr5Nego.length - 1].rate).toBe(145000);

    // Vendor counter on a brand new PR
    act(() => {
      result.current.addNegotiationRound('PR-NEW-999', 200000, 'Vendor quote', 'VENDOR_REVISION');
    });
    const newNego = result.current.negotiations['PR-NEW-999'];
    expect(newNego.length).toBe(1);
    expect(newNego[0].user).toBe('Vendor Representative');
  });

  it('handles PPO creation, PPO approval with PO release, and sample reset', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProcurementProvider>{children}</ProcurementProvider>
    );
    const { result } = renderHook(() => useProcurement(), { wrapper });

    const initialPosCount = result.current.pos.length;

    // Create PPO
    act(() => {
      result.current.createPPO({
        prId: 'PR-2026-0005',
        vendor: 'Test Vendor Ltd',
        itemDesc: 'Custom Furniture',
        unitRate: 50000,
        qty: 1,
        totalVal: 50000,
        taxRate: 18,
        taxAmount: 9000,
        grandTotal: 59000,
      });
    });

    const newPPO = result.current.ppos[0];
    expect(newPPO.vendor).toBe('Test Vendor Ltd');
    expect(newPPO.status).toBe('PENDING_APPROVAL');

    // Approve PPO
    act(() => {
      result.current.approvePPO(newPPO.id);
    });

    const approvedPPO = result.current.ppos.find(p => p.id === newPPO.id);
    expect(approvedPPO?.status).toBe('APPROVED');
    expect(result.current.pos.length).toBe(initialPosCount + 1);

    // Approve non-existent PPO
    act(() => {
      result.current.approvePPO('NON-EXISTENT-PPO');
    });

    // Reset to sample data
    act(() => {
      result.current.resetToSampleData();
    });

    expect(result.current.pos.length).toBe(2);
    expect(result.current.tier1Approved).toBe(false);
  });

  it('rejects invalid inputs using schema validation', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProcurementProvider>{children}</ProcurementProvider>
    );
    const { result } = renderHook(() => useProcurement(), { wrapper });

    const initialPrCount = result.current.prs.length;
    // Invalid PR (title too short, items empty)
    act(() => {
      result.current.createPR({
        title: 'X',
        category: 'Civil',
        costCentre: 'CC-1',
        items: [],
      } as any);
    });
    expect(result.current.prs.length).toBe(initialPrCount);

    // Invalid BOQ update (empty items)
    const existingPr = result.current.prs[0];
    const originalItemsCount = existingPr.items.length;
    act(() => {
      result.current.updateBOQItems(existingPr.id, [] as any);
    });
    expect(result.current.prs[0].items.length).toBe(originalItemsCount);

    // Invalid negotiation round (empty remarks, invalid rate)
    const initialNegoCount = (result.current.negotiations['PR-2026-0005'] || []).length;
    act(() => {
      result.current.addNegotiationRound('PR-2026-0005', -100, '', 'BUYER_COUNTER');
    });
    expect((result.current.negotiations['PR-2026-0005'] || []).length).toBe(initialNegoCount);

    // Invalid PPO creation (missing vendor and negative grandTotal)
    const initialPpoCount = result.current.ppos.length;
    act(() => {
      result.current.createPPO({
        prId: 'PR-2026-0005',
        vendor: '',
        grandTotal: -500,
      } as any);
    });
    expect(result.current.ppos.length).toBe(initialPpoCount);
  });
});
