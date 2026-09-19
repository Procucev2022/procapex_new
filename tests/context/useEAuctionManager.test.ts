import { renderHook, act } from '@testing-library/react';
import { useEAuctionManager } from '@/context/useEAuctionManager';

describe('useEAuctionManager Hook', () => {
  it('initializes with seed auctions and default active auction', () => {
    const { result } = renderHook(() => useEAuctionManager());
    expect(result.current.eauctions.length).toBeGreaterThan(0);
    expect(result.current.activeEAuctionId).toBe('AUC-2026-0005');
    const auc = result.current.getEAuctionByPRId('PR-2026-0005');
    expect(auc).toBeDefined();
    expect(auc?.status).toBe('SCHEDULED');
  });

  it('handles auction lifecycle state transitions: start, pause, resume, extend, conclude', () => {
    const { result } = renderHook(() => useEAuctionManager());
    const auctionId = 'AUC-2026-0005';

    // Start
    act(() => {
      result.current.startEAuction(auctionId);
    });
    let auc = result.current.eauctions.find((a) => a.id === auctionId);
    expect(auc?.status).toBe('LIVE');

    // Pause
    act(() => {
      result.current.pauseEAuction(auctionId);
    });
    auc = result.current.eauctions.find((a) => a.id === auctionId);
    expect(auc?.status).toBe('PAUSED');

    // Resume
    act(() => {
      result.current.resumeEAuction(auctionId);
    });
    auc = result.current.eauctions.find((a) => a.id === auctionId);
    expect(auc?.status).toBe('LIVE');

    // Extend
    const prevRemaining = auc?.remainingSeconds || 0;
    act(() => {
      result.current.extendEAuction(auctionId, 300);
    });
    auc = result.current.eauctions.find((a) => a.id === auctionId);
    expect(auc?.remainingSeconds).toBe(prevRemaining + 300);

    // Conclude
    act(() => {
      result.current.concludeEAuction(auctionId);
    });
    auc = result.current.eauctions.find((a) => a.id === auctionId);
    expect(auc?.status).toBe('CONCLUDED');
  });

  it('submits a valid bid and updates L1, leaderboard, and savings', () => {
    const { result } = renderHook(() => useEAuctionManager());
    const auctionId = 'AUC-2026-0005';

    act(() => {
      result.current.startEAuction(auctionId);
    });

    // VND-001 places a new L1 bid of 4,500,000 (below current 4,620,000)
    let bidRes: any;
    act(() => {
      bidRes = result.current.submitEAuctionBid({
        auctionId,
        vendorId: 'VND-001',
        bidAmount: 4500000,
      });
    });

    expect(bidRes?.isValid).toBe(true);

    const auc = result.current.eauctions.find((a) => a.id === auctionId);
    expect(auc?.currentL1Price).toBe(4500000);
    expect(auc?.currentL1VendorId).toBe('VND-001');
    expect(auc?.participants.find((p) => p.vendorId === 'VND-001')?.currentRank).toBe(1);
    expect(auc?.bids[0].bidAmount).toBe(4500000);
  });

  it('sets proxy floor price and simulates competitive bids', () => {
    const { result } = renderHook(() => useEAuctionManager());
    const auctionId = 'AUC-2026-0005';

    act(() => {
      result.current.startEAuction(auctionId);
      result.current.setEAuctionProxyFloor({
        auctionId,
        vendorId: 'VND-005',
        floorPrice: 4200000,
      });
    });

    const auc = result.current.eauctions.find((a) => a.id === auctionId);
    expect(auc?.participants.find((p) => p.vendorId === 'VND-005')?.proxyFloorPrice).toBe(4200000);

    // Simulate next competitive bid
    let simSuccess = false;
    act(() => {
      simSuccess = result.current.simulateNextCompetitiveBid(auctionId);
    });
    expect(simSuccess).toBe(true);
  });

  it('awards e-auction to L1 winner and transitions status to AWARDED', () => {
    const { result } = renderHook(() => useEAuctionManager());
    const auctionId = 'AUC-2026-0005';

    act(() => {
      result.current.startEAuction(auctionId);
    });

    let awardResult: any = null;
    act(() => {
      awardResult = result.current.awardEAuctionToL1(auctionId);
    });

    expect(awardResult).not.toBeNull();
    const auc = result.current.eauctions.find((a) => a.id === auctionId);
    expect(auc?.status).toBe('AWARDED');
    expect(auc?.winningVendorId).toBe(awardResult?.winnerVendorId);
  });
});
