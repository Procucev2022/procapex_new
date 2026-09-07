export interface MLEOCostBreakdown {
  itemName: string;
  targetRate: number;
  maxLimit: number;
  currency: string;
  pillars: {
    material: { percentage: number; cost: number; description: string };
    labour: { percentage: number; cost: number; description: string };
    equipment: { percentage: number; cost: number; description: string };
    overheads: { percentage: number; cost: number; description: string };
  };
  inflators: Array<{ title: string; description: string }>;
  negotiationScripts: Array<{ title: string; argument: string }>;
  modelUsed: string;
  isLiveAi: boolean;
}

export interface NegotiationParams {
  prTitle: string;
  itemName: string;
  vendorQuoteRate: number;
  targetBenchmark: number;
  currentRound: number;
  historySummary?: string;
}

export interface NegotiationTactic {
  recommendedCounterRate: number;
  counterRemarks: string;
  strategyAdvice: string;
  modelUsed: string;
  isLiveAi: boolean;
}
