import type {
  EAuctionSession,
  EAuctionParticipant,
  BidValidationResult,
} from '@/types';

/**
 * Validates a proposed bid amount against auction rules and participant standing.
 */
export function validateBidSubmission(
  bidAmount: number,
  participant: EAuctionParticipant,
  session: EAuctionSession
): BidValidationResult {
  if (session.status !== 'LIVE' && session.status !== 'EXTENDED') {
    return {
      isValid: false,
      errorMessage: 'Bids can only be submitted when auction status is LIVE or EXTENDED.',
    };
  }

  if (bidAmount <= 0 || !Number.isFinite(bidAmount)) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid positive numeric bid amount.',
    };
  }

  const minDecrement = session.rules.minDecrementAmount;
  // Maximum allowed bid must be at least minDecrement lower than participant's current bid
  const maxAllowedByOwnBid = participant.currentBid - minDecrement;

  if (bidAmount > maxAllowedByOwnBid) {
    return {
      isValid: false,
      maxAllowedBid: maxAllowedByOwnBid,
      errorMessage: `Bid must be at least ₹${minDecrement.toLocaleString()} lower than your current bid of ₹${participant.currentBid.toLocaleString()} (Max eligible bid: ₹${maxAllowedByOwnBid.toLocaleString()}).`,
    };
  }

  return {
    isValid: true,
    maxAllowedBid: maxAllowedByOwnBid,
  };
}

/**
 * Computes updated ranks across all participants based on current bid and timestamps.
 */
export function calculateAuctionRanks(
  participants: EAuctionParticipant[]
): EAuctionParticipant[] {
  const sorted = [...participants].sort((a, b) => {
    if (a.currentBid !== b.currentBid) {
      return a.currentBid - b.currentBid;
    }
    const timeA = a.lastBidTimestamp ? new Date(a.lastBidTimestamp).getTime() : 0;
    const timeB = b.lastBidTimestamp ? new Date(b.lastBidTimestamp).getTime() : 0;
    return timeA - timeB;
  });

  return sorted.map((p, index) => ({
    ...p,
    currentRank: index + 1,
  }));
}

/**
 * Computes net savings in amount and percentage compared to starting ceiling price.
 */
export function calculateAuctionSavings(
  ceilingPrice: number,
  currentL1Price: number
): { savings: number; pct: string } {
  const savings = Math.max(0, ceilingPrice - currentL1Price);
  const pct = ceilingPrice > 0 ? ((savings / ceilingPrice) * 100).toFixed(2) : '0.00';
  return { savings, pct };
}

/**
 * Generates a simulated realistic competitive bid from an outbid vendor.
 */
export function generateSimulatedVendorBid(
  session: EAuctionSession
): { vendorId: string; bidAmount: number } | null {
  if (session.status !== 'LIVE' && session.status !== 'EXTENDED') {
    return null;
  }

  // Find non-L1 participants who can bid down
  const outbidParticipants = session.participants.filter(
    (p) => p.vendorId !== session.currentL1VendorId
  );

  if (outbidParticipants.length === 0) return null;

  // Pick a random outbid participant
  const randomIndex = Math.floor(Math.random() * outbidParticipants.length);
  const selectedParticipant = outbidParticipants[randomIndex];

  const minDecrement = session.rules.minDecrementAmount;
  // Next bid target is 1x or 2x decrement below current L1
  const multiplier = Math.random() > 0.5 ? 1 : 2;
  const targetBid = session.currentL1Price - minDecrement * multiplier;

  // Ensure targetBid is greater than reserve price or reasonable floor (80% of baseline)
  const floorLimit = session.rules.reservePrice || session.baselineBudget * 0.8;
  if (targetBid < floorLimit) {
    return null;
  }

  return {
    vendorId: selectedParticipant.vendorId,
    bidAmount: targetBid,
  };
}

/**
 * Checks if a bid triggers dynamic overtime extension.
 */
export function shouldTriggerOvertimeExtension(
  remainingSeconds: number,
  overtimeTriggerSeconds: number
): boolean {
  return remainingSeconds > 0 && remainingSeconds <= overtimeTriggerSeconds;
}

/**
 * Formats seconds into MM:SS display.
 */
export function formatAuctionTimer(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  const paddedM = String(minutes).padStart(2, '0');
  const paddedS = String(seconds).padStart(2, '0');
  return `${paddedM}:${paddedS}`;
}
