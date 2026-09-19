import {
  validateBidSubmission,
  calculateAuctionRanks,
  calculateAuctionSavings,
  generateSimulatedVendorBid,
  shouldTriggerOvertimeExtension,
  formatAuctionTimer,
} from '@/lib/eauction-utils';
import { SEED_EAUCTIONS } from '@/constants/eauction';
import type { EAuctionParticipant, EAuctionSession } from '@/types';

describe('E-Auction Utilities (eauction-utils)', () => {
  const baseSession: EAuctionSession = { ...SEED_EAUCTIONS[0], status: 'LIVE' };
  const participant: EAuctionParticipant = baseSession.participants[1]; // VND-001 (4,780,000)

  describe('validateBidSubmission', () => {
    it('rejects bids if auction is not LIVE or EXTENDED', () => {
      const scheduledSession = { ...baseSession, status: 'SCHEDULED' as const };
      const res = validateBidSubmission(4500000, participant, scheduledSession);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toContain('LIVE or EXTENDED');
    });

    it('rejects non-positive numeric bid amounts', () => {
      const resZero = validateBidSubmission(0, participant, baseSession);
      expect(resZero.isValid).toBe(false);
      const resNeg = validateBidSubmission(-5000, participant, baseSession);
      expect(resNeg.isValid).toBe(false);
    });

    it('rejects bids that do not satisfy minimum decrement from current bid', () => {
      // currentBid is 4,780,000. Min decrement is 25,000. Max allowable is 4,755,000.
      const invalidBid = 4770000;
      const res = validateBidSubmission(invalidBid, participant, baseSession);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toContain('lower than your current bid');
    });

    it('accepts bids meeting or exceeding minimum decrement', () => {
      const validBid = 4750000;
      const res = validateBidSubmission(validBid, participant, baseSession);
      expect(res.isValid).toBe(true);
      expect(res.maxAllowedBid).toBe(4755000);
    });
  });

  describe('calculateAuctionRanks', () => {
    it('sorts participants by bid amount ascending and assigns 1-based ranks', () => {
      const testParticipants: EAuctionParticipant[] = [
        { ...participant, vendorId: 'V1', currentBid: 5000000, currentRank: 3 },
        { ...participant, vendorId: 'V2', currentBid: 4200000, currentRank: 2 },
        { ...participant, vendorId: 'V3', currentBid: 4600000, currentRank: 1 },
      ];

      const ranked = calculateAuctionRanks(testParticipants);
      expect(ranked[0].vendorId).toBe('V2');
      expect(ranked[0].currentRank).toBe(1);
      expect(ranked[1].vendorId).toBe('V3');
      expect(ranked[1].currentRank).toBe(2);
      expect(ranked[2].vendorId).toBe('V1');
      expect(ranked[2].currentRank).toBe(3);
    });

    it('resolves equal bids by earliest timestamp', () => {
      const testParticipants: EAuctionParticipant[] = [
        {
          ...participant,
          vendorId: 'V_LATE',
          currentBid: 4500000,
          lastBidTimestamp: '2026-09-19T10:05:00.000Z',
        },
        {
          ...participant,
          vendorId: 'V_EARLY',
          currentBid: 4500000,
          lastBidTimestamp: '2026-09-19T10:02:00.000Z',
        },
      ];

      const ranked = calculateAuctionRanks(testParticipants);
      expect(ranked[0].vendorId).toBe('V_EARLY');
      expect(ranked[0].currentRank).toBe(1);
      expect(ranked[1].vendorId).toBe('V_LATE');
      expect(ranked[1].currentRank).toBe(2);
    });
  });

  describe('calculateAuctionSavings', () => {
    it('calculates amount and percentage correctly', () => {
      const { savings, pct } = calculateAuctionSavings(5000000, 4500000);
      expect(savings).toBe(500000);
      expect(pct).toBe('10.00');
    });

    it('handles zero or negative savings safely', () => {
      const { savings, pct } = calculateAuctionSavings(4000000, 4200000);
      expect(savings).toBe(0);
      expect(pct).toBe('0.00');
    });
  });

  describe('shouldTriggerOvertimeExtension', () => {
    it('returns true when remainingSeconds is within overtime threshold', () => {
      expect(shouldTriggerOvertimeExtension(90, 120)).toBe(true);
      expect(shouldTriggerOvertimeExtension(120, 120)).toBe(true);
    });

    it('returns false when remainingSeconds is above threshold or zero', () => {
      expect(shouldTriggerOvertimeExtension(150, 120)).toBe(false);
      expect(shouldTriggerOvertimeExtension(0, 120)).toBe(false);
    });
  });

  describe('formatAuctionTimer', () => {
    it('formats seconds into MM:SS format correctly', () => {
      expect(formatAuctionTimer(900)).toBe('15:00');
      expect(formatAuctionTimer(75)).toBe('01:15');
      expect(formatAuctionTimer(9)).toBe('00:09');
      expect(formatAuctionTimer(-5)).toBe('00:00');
    });
  });

  describe('generateSimulatedVendorBid', () => {
    it('generates a valid lower bid from an outbid participant', () => {
      const sim = generateSimulatedVendorBid(baseSession);
      expect(sim).not.toBeNull();
      if (sim) {
        expect(sim.bidAmount).toBeLessThan(baseSession.currentL1Price);
        expect(sim.vendorId).not.toBe(baseSession.currentL1VendorId);
      }
    });

    it('returns null if auction is not live', () => {
      const pausedSession = { ...baseSession, status: 'PAUSED' as const };
      const sim = generateSimulatedVendorBid(pausedSession);
      expect(sim).toBeNull();
    });
  });
});
