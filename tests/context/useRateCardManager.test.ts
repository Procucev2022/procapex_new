import { renderHook, act } from '@testing-library/react';
import { useRateCardManager } from '@/context/useRateCardManager';
import type { BOQItem } from '@/types';

describe('useRateCardManager', () => {
  it('should initialize with seed rate card agreements', () => {
    const { result } = renderHook(() => useRateCardManager());
    expect(result.current.rateCards.length).toBeGreaterThan(0);
    const finalized = result.current.rateCards.filter((rc) => rc.status === 'FINALISED');
    expect(finalized.length).toBeGreaterThan(0);
  });

  it('should fetch correct line pricing references including AI should-cost, best RC rate, and last PPO rate', () => {
    const { result } = renderHook(() => useRateCardManager());
    const refs = result.current.getLinePricingReferences('CNT-TOP-GRN20');
    expect(refs.aiCost).toBe(3500);
    expect(refs.recentBestRate).toBe(3450);
    expect(refs.lastPpoRate).toBe(3550);
  });

  it('should create a new rate card proposal with status PROPOSAL_SENT', () => {
    const { result } = renderHook(() => useRateCardManager());
    let createdId = '';

    act(() => {
      const agreement = result.current.createRateCardProposal({
        vendorId: 'VND-001',
        vendorName: 'DesignCraft Millworks',
        categoryCode: 'INTERIOR',
        categoryName: 'Interior Fitouts & Millwork',
        items: [
          {
            itemCode: 'INT-PLY-BWP18',
            desc: 'Marine Plywood 18mm',
            uom: 'Sqm',
            aiShouldCost: 1420,
            recentBestRate: 1400,
            lastPpoRate: 1410,
            proposedRate: 1400,
          },
        ],
      });
      createdId = agreement.id;
    });

    const proposal = result.current.rateCards.find((r) => r.id === createdId);
    expect(proposal).toBeDefined();
    expect(proposal?.status).toBe('PROPOSAL_SENT');
    expect(proposal?.items[0].proposedRate).toBe(1400);
  });

  it('should handle seller response ACCEPT and finalize rate card', () => {
    const { result } = renderHook(() => useRateCardManager());
    let proposalId = '';

    act(() => {
      const agreement = result.current.createRateCardProposal({
        vendorId: 'VND-002',
        vendorName: 'Apex Structural Systems',
        categoryCode: 'CIVIL',
        categoryName: 'Civil Works',
        items: [
          {
            itemCode: 'CIV-CONC-M35',
            desc: 'M35 Concrete',
            uom: 'Cum',
            aiShouldCost: 5200,
            proposedRate: 5180,
          },
        ],
      });
      proposalId = agreement.id;
    });

    // Seller accepts
    act(() => {
      result.current.sellerRespondRateCardProposal(proposalId, 'ACCEPT');
    });

    let agreement = result.current.rateCards.find((r) => r.id === proposalId);
    expect(agreement?.status).toBe('ACCEPTED');
    expect(agreement?.items[0].finalAgreedRate).toBe(5180);

    // Finalize
    act(() => {
      result.current.finalizeRateCard(proposalId);
    });

    agreement = result.current.rateCards.find((r) => r.id === proposalId);
    expect(agreement?.status).toBe('FINALISED');
  });

  it('should handle seller response COUNTER with counter rates', () => {
    const { result } = renderHook(() => useRateCardManager());
    let proposalId = '';

    act(() => {
      const agreement = result.current.createRateCardProposal({
        vendorId: 'VND-003',
        vendorName: 'VoltCorp Electricals',
        categoryCode: 'MEP',
        categoryName: 'MEP Services',
        items: [
          {
            itemCode: 'MEP-CBL-4CX16',
            desc: '4 Core 16 sq.mm XLPE Armoured Cable',
            uom: 'Rmt',
            aiShouldCost: 480,
            proposedRate: 460,
          },
        ],
      });
      proposalId = agreement.id;
    });

    // Seller counters
    act(() => {
      result.current.sellerRespondRateCardProposal(proposalId, 'COUNTER', {
        'MEP-CBL-4CX16': 470,
      });
    });

    const agreement = result.current.rateCards.find((r) => r.id === proposalId);
    expect(agreement?.status).toBe('COUNTER_OFFERED');
    expect(agreement?.items[0].sellerCounterRate).toBe(470);
    expect(agreement?.items[0].finalAgreedRate).toBe(470);
  });

  it('should correctly calculate PR rate card coverage (full vs partial coverage)', () => {
    const { result } = renderHook(() => useRateCardManager());

    // Test vendor with interior rate card RC-2026-INT-001 (has CNT-TOP-GRN20, CNT-PLY-BWP18, CNT-LAM-1MM, CNT-HDW-SOFT, CNT-LED-PROF, CNT-SKT-SS304)
    const prItemsFull: BOQItem[] = [
      { code: 'CNT-TOP-GRN20', desc: 'Granite Countertop', uom: 'Sqm', qty: 10, benchmark: 3300 },
      { code: 'CNT-PLY-BWP18', desc: 'Plywood 18mm', uom: 'Sqm', qty: 20, benchmark: 1400 },
    ];

    const coverageFull = result.current.checkPRRateCardCoverage(prItemsFull, 'VND-001');
    expect(coverageFull.isFullyCovered).toBe(true);
    expect(coverageFull.coveredItemsCount).toBe(2);
    expect(coverageFull.deltaItemsCount).toBe(0);

    // Test vendor with partial items
    const prItemsPartial: BOQItem[] = [
      { code: 'CNT-TOP-GRN20', desc: 'Granite Countertop', uom: 'Sqm', qty: 10, benchmark: 3300 },
      { code: 'NEW-SPECIAL-ITEM-99', desc: 'Custom Brass Inlay', uom: 'Rmt', qty: 5, benchmark: 2200 },
    ];

    const coveragePartial = result.current.checkPRRateCardCoverage(prItemsPartial, 'VND-001');
    expect(coveragePartial.isFullyCovered).toBe(false);
    expect(coveragePartial.coveredItemsCount).toBe(1);
    expect(coveragePartial.deltaItemsCount).toBe(1);
    expect(coveragePartial.deltaItems[0].code).toBe('NEW-SPECIAL-ITEM-99');
  });

  it('should append a new item to an existing finalized rate card', () => {
    const { result } = renderHook(() => useRateCardManager());

    act(() => {
      result.current.addItemToRateCard({
        vendorId: 'VND-001',
        categoryCode: 'INTERIOR',
        itemCode: 'CNT-BRASS-INLAY',
        desc: 'Brass Inlay Strips 10mm',
        uom: 'Rmt',
        agreedRate: 1850,
        notes: 'Added from PPO fast-track scope',
      });
    });

    const agreement = result.current.rateCards.find((r) => r.vendorId === 'VND-001');
    const addedItem = agreement?.items.find((it) => it.itemCode === 'CNT-BRASS-INLAY');
    expect(addedItem).toBeDefined();
    expect(addedItem?.finalAgreedRate).toBe(1850);
  });
});
