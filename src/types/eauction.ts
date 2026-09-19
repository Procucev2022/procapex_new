export type EAuctionStatus =
  | 'SCHEDULED'
  | 'LIVE'
  | 'PAUSED'
  | 'EXTENDED'
  | 'CONCLUDED'
  | 'AWARDED';

export type EAuctionType = 'REVERSE_ENGLISH' | 'DUTCH' | 'SEALED_RANK';

export interface EAuctionRule {
  minDecrementAmount: number;
  durationSeconds: number;
  autoExtensionSeconds: number;
  overtimeTriggerSeconds: number;
  ceilingPrice: number;
  reservePrice?: number;
  isRankVisibleToVendors: boolean;
  isLowestPriceVisibleToVendors: boolean;
}

export interface EAuctionBid {
  id: string;
  auctionId: string;
  vendorId: string;
  vendorName: string;
  maskedVendorName: string;
  bidAmount: number;
  previousBidAmount?: number;
  decrementAmount: number;
  rank: number;
  timestamp: string;
  isProxyBid?: boolean;
}

export interface EAuctionParticipant {
  vendorId: string;
  vendorName: string;
  maskedName: string;
  initialQuote: number;
  currentBid: number;
  currentRank: number;
  bidsPlacedCount: number;
  isOnline: boolean;
  proxyFloorPrice?: number;
  lastBidTimestamp?: string;
}

export interface EAuctionSession {
  id: string;
  prId: string;
  rfqId: string;
  title: string;
  category: string;
  baselineBudget: number;
  ceilingPrice: number;
  currentL1Price: number;
  currentL1VendorId: string;
  currentL1VendorName: string;
  status: EAuctionStatus;
  auctionType: EAuctionType;
  rules: EAuctionRule;
  startTime: string;
  endTime: string;
  remainingSeconds: number;
  totalSavings: number;
  savingsPct: string;
  totalBidsCount: number;
  participants: EAuctionParticipant[];
  bids: EAuctionBid[];
  winningVendorId?: string;
  winningBidAmount?: number;
  awardedAt?: string;
}

export interface SubmitBidInput {
  auctionId: string;
  vendorId: string;
  bidAmount: number;
  isProxy?: boolean;
}

export interface SetProxyFloorInput {
  auctionId: string;
  vendorId: string;
  floorPrice: number;
}

export interface BuyerEAuctionPageProps {
  prId: string;
  onBackToNegotiation: () => void;
  onAwardToPPO?: (winnerVendorId: string, winningPrice: number) => void;
}

export interface VendorEAuctionPageProps {
  vendorId: string;
  vendorName: string;
  prId?: string;
}

export interface BidValidationResult {
  isValid: boolean;
  errorMessage?: string;
  maxAllowedBid?: number;
}
