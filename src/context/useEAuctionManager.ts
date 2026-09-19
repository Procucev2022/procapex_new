import { useState, useCallback, useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';
import type {
  EAuctionSession,
  SubmitBidInput,
  SetProxyFloorInput,
  BidValidationResult,
  EAuctionBid,
} from '@/types';
import { SEED_EAUCTIONS } from '@/constants/eauction';
import {
  validateBidSubmission,
  calculateAuctionRanks,
  calculateAuctionSavings,
  generateSimulatedVendorBid,
  shouldTriggerOvertimeExtension,
} from '@/lib/eauction-utils';

export interface UseEAuctionManagerReturn {
  eauctions: EAuctionSession[];
  activeEAuctionId: string | null;
  setActiveEAuctionId: (id: string | null) => void;
  getEAuctionByPRId: (prId: string) => EAuctionSession | undefined;
  startEAuction: (auctionId: string) => void;
  pauseEAuction: (auctionId: string) => void;
  resumeEAuction: (auctionId: string) => void;
  extendEAuction: (auctionId: string, extensionSeconds?: number) => void;
  concludeEAuction: (auctionId: string) => void;
  submitEAuctionBid: (input: SubmitBidInput) => BidValidationResult;
  setEAuctionProxyFloor: (input: SetProxyFloorInput) => void;
  simulateNextCompetitiveBid: (auctionId: string) => boolean;
  awardEAuctionToL1: (
    auctionId: string
  ) => { winnerVendorId: string; winningPrice: number } | null;
}

export function useEAuctionManager(): UseEAuctionManagerReturn {
  const [eauctions, setEAuctionListState] = useState<EAuctionSession[]>(SEED_EAUCTIONS);
  const [activeEAuctionId, setActiveEAuctionId] = useState<string | null>('AUC-2026-0005');
  const eauctionsRef = useRef<EAuctionSession[]>(SEED_EAUCTIONS);

  const updateEAuctionList = useCallback((updater: (prev: EAuctionSession[]) => EAuctionSession[]) => {
    setEAuctionListState((prev) => {
      const next = updater(prev);
      eauctionsRef.current = next;
      return next;
    });
  }, []);

  const getEAuctionByPRId = useCallback(
    (prId: string): EAuctionSession | undefined => {
      return eauctions.find((a) => a.prId === prId);
    },
    [eauctions]
  );

  const startEAuction = useCallback((auctionId: string): void => {
    updateEAuctionList((prev) =>
      prev.map((auc) => {
        if (auc.id !== auctionId) return auc;
        logger.info('context/useEAuctionManager', 'Started Live E-Auction', { auctionId });
        return {
          ...auc,
          status: 'LIVE',
          startTime: new Date().toISOString(),
        };
      })
    );
  }, [updateEAuctionList]);

  const pauseEAuction = useCallback((auctionId: string): void => {
    updateEAuctionList((prev) =>
      prev.map((auc) => {
        if (auc.id !== auctionId) return auc;
        logger.info('context/useEAuctionManager', 'Paused E-Auction', { auctionId });
        return { ...auc, status: 'PAUSED' };
      })
    );
  }, [updateEAuctionList]);

  const resumeEAuction = useCallback((auctionId: string): void => {
    updateEAuctionList((prev) =>
      prev.map((auc) => {
        if (auc.id !== auctionId) return auc;
        logger.info('context/useEAuctionManager', 'Resumed E-Auction', { auctionId });
        return { ...auc, status: 'LIVE' };
      })
    );
  }, [updateEAuctionList]);

  const extendEAuction = useCallback(
    (auctionId: string, extensionSeconds = 300): void => {
      updateEAuctionList((prev) =>
        prev.map((auc) => {
          if (auc.id !== auctionId) return auc;
          const newRemaining = auc.remainingSeconds + extensionSeconds;
          logger.info('context/useEAuctionManager', 'Extended E-Auction Duration', {
            auctionId,
            extensionSeconds,
            newRemaining,
          });
          return {
            ...auc,
            remainingSeconds: newRemaining,
            status: auc.status === 'CONCLUDED' ? 'LIVE' : auc.status,
          };
        })
      );
    },
    [updateEAuctionList]
  );

  const concludeEAuction = useCallback((auctionId: string): void => {
    updateEAuctionList((prev) =>
      prev.map((auc) => {
        if (auc.id !== auctionId) return auc;
        logger.info('context/useEAuctionManager', 'Concluded E-Auction Bidding', {
          auctionId,
          winningVendor: auc.currentL1VendorName,
          finalL1Price: auc.currentL1Price,
        });
        return { ...auc, status: 'CONCLUDED' };
      })
    );
  }, [updateEAuctionList]);

  const setEAuctionProxyFloor = useCallback(
    (input: SetProxyFloorInput): void => {
      updateEAuctionList((prev) =>
        prev.map((auc) => {
          if (auc.id !== input.auctionId) return auc;
          const updatedParticipants = auc.participants.map((p) =>
            p.vendorId === input.vendorId
              ? { ...p, proxyFloorPrice: input.floorPrice }
              : p
          );
          logger.info('context/useEAuctionManager', 'Set Auto-Bid Proxy Floor', {
            auctionId: input.auctionId,
            vendorId: input.vendorId,
            floorPrice: input.floorPrice,
          });
          return { ...auc, participants: updatedParticipants };
        })
      );
    },
    [updateEAuctionList]
  );

  const submitEAuctionBid = useCallback(
    (input: SubmitBidInput): BidValidationResult => {
      const target = eauctionsRef.current.find((a) => a.id === input.auctionId);
      if (!target) {
        return { isValid: false, errorMessage: 'Auction not found' };
      }

      const participant = target.participants.find((p) => p.vendorId === input.vendorId);
      if (!participant) {
        return { isValid: false, errorMessage: 'Participant is not registered in this auction.' };
      }

      const validation = validateBidSubmission(input.bidAmount, participant, target);
      if (!validation.isValid) {
        return validation;
      }

      const now = new Date().toISOString();
      const decrement = participant.currentBid - input.bidAmount;

      // Update participant details
      const updatedParticipants = target.participants.map((p) => {
        if (p.vendorId !== input.vendorId) return p;
        return {
          ...p,
          currentBid: input.bidAmount,
          bidsPlacedCount: p.bidsPlacedCount + 1,
          lastBidTimestamp: now,
        };
      });

      // Recalculate ranks across participants
      const rankedParticipants = calculateAuctionRanks(updatedParticipants);
      const newL1 = rankedParticipants[0];

      // Recalculate savings
      const { savings, pct } = calculateAuctionSavings(target.ceilingPrice, newL1.currentBid);

      // Check overtime extension
      const isOvertime = shouldTriggerOvertimeExtension(
        target.remainingSeconds,
        target.rules.overtimeTriggerSeconds
      );
      const additionalSeconds = isOvertime ? target.rules.autoExtensionSeconds : 0;
      const newStatus = isOvertime ? 'EXTENDED' : target.status;

      const newBid: EAuctionBid = {
        id: `BID-${String(target.bids.length + 1).padStart(3, '0')}`,
        auctionId: target.id,
        vendorId: participant.vendorId,
        vendorName: participant.vendorName,
        maskedVendorName: participant.maskedName,
        bidAmount: input.bidAmount,
        previousBidAmount: participant.currentBid,
        decrementAmount: decrement,
        rank: rankedParticipants.find((p) => p.vendorId === input.vendorId)?.currentRank || 1,
        timestamp: now,
        isProxyBid: input.isProxy,
      };

      logger.info('context/useEAuctionManager', 'New E-Auction Bid Submitted', {
        auctionId: target.id,
        vendor: participant.vendorName,
        bidAmount: input.bidAmount,
        decrement,
        newRank: newBid.rank,
        overtimeExtended: isOvertime,
      });

      updateEAuctionList((prev) =>
        prev.map((auc) => {
          if (auc.id !== target.id) return auc;
          return {
            ...auc,
            currentL1Price: newL1.currentBid,
            currentL1VendorId: newL1.vendorId,
            currentL1VendorName: newL1.vendorName,
            status: newStatus,
            remainingSeconds: auc.remainingSeconds + additionalSeconds,
            totalSavings: savings,
            savingsPct: pct,
            totalBidsCount: auc.totalBidsCount + 1,
            participants: rankedParticipants,
            bids: [newBid, ...auc.bids],
          };
        })
      );

      return { isValid: true };
    },
    [updateEAuctionList]
  );

  const simulateNextCompetitiveBid = useCallback(
    (auctionId: string): boolean => {
      const target = eauctionsRef.current.find((a) => a.id === auctionId);
      if (!target) return false;

      const sim = generateSimulatedVendorBid(target);
      if (!sim) return false;

      const res = submitEAuctionBid({
        auctionId,
        vendorId: sim.vendorId,
        bidAmount: sim.bidAmount,
      });

      return res.isValid;
    },
    [submitEAuctionBid]
  );

  const awardEAuctionToL1 = useCallback(
    (
      auctionId: string
    ): { winnerVendorId: string; winningPrice: number } | null => {
      const target = eauctionsRef.current.find((a) => a.id === auctionId);
      if (!target) return null;

      const awardResult = {
        winnerVendorId: target.currentL1VendorId,
        winningPrice: target.currentL1Price,
      };

      updateEAuctionList((prev) =>
        prev.map((auc) => {
          if (auc.id !== auctionId) return auc;
          logger.info('context/useEAuctionManager', 'Awarded E-Auction to L1 Bidder', {
            auctionId,
            winnerVendorId: target.currentL1VendorId,
            winningPrice: target.currentL1Price,
          });
          return {
            ...auc,
            status: 'AWARDED',
            winningVendorId: target.currentL1VendorId,
            winningBidAmount: target.currentL1Price,
            awardedAt: new Date().toISOString(),
          };
        })
      );

      return awardResult;
    },
    [updateEAuctionList]
  );

  // Countdown timer effect: ticks every second for LIVE or EXTENDED auctions
  useEffect(() => {
    const timer = setInterval(() => {
      updateEAuctionList((prev: EAuctionSession[]) => {
        const hasLive = prev.some((a: EAuctionSession) => a.status === 'LIVE' || a.status === 'EXTENDED');
        if (!hasLive) return prev;

        return prev.map((auc: EAuctionSession) => {
          if (auc.status !== 'LIVE' && auc.status !== 'EXTENDED') return auc;
          if (auc.remainingSeconds <= 1) {
            return {
              ...auc,
              remainingSeconds: 0,
              status: 'CONCLUDED',
            };
          }
          return {
            ...auc,
            remainingSeconds: auc.remainingSeconds - 1,
          };
        });
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [updateEAuctionList]);

  return {
    eauctions,
    activeEAuctionId,
    setActiveEAuctionId,
    getEAuctionByPRId,
    startEAuction,
    pauseEAuction,
    resumeEAuction,
    extendEAuction,
    concludeEAuction,
    submitEAuctionBid,
    setEAuctionProxyFloor,
    simulateNextCompetitiveBid,
    awardEAuctionToL1,
  };
}
