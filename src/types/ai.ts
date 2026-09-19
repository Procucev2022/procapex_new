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

export interface DrawingExtractionRequest {
  fileName?: string;
  fileType?: string;
  drawingTitleHint?: string;
  categoryHint?: string;
  textContent?: string;
  fileBase64?: string;
  fileMimeType?: string;
}

export interface DrawingExtractionResult {
  drawingTitle: string;
  category: string;
  subCategory?: string;
  items: Array<{
    code: string;
    desc: string;
    uom: string;
    qty: number;
    benchmark?: number;
    rateCard?: number;
    status?: string;
    drawingElevation?: string;
  }>;
  modelUsed: string;
  isLiveAi: boolean;
  confidence: string;
}

export interface AmendBOQItemInput {
  index: number;
  code: string;
  desc: string;
  uom: string;
  qty: number;
  benchmarkRate?: number;
  addToStandardBOQ?: boolean;
  categoryId?: string;
  subCategoryId?: string;
}

export interface RefineBOQItemRequest {
  itemCode: string;
  currentDesc: string;
  currentUom: string;
  currentQty: number;
  currentBenchmarkRate: number;
  userInputSpecs: string;
  categoryHint?: string;
  subCategoryHint?: string;
}

export interface RefineBOQItemResult {
  refinedCode: string;
  refinedDesc: string;
  refinedUom: string;
  refinedQty: number;
  refinedBenchmarkRate: number;
  aiRationale: string;
  specsHighlighted: string[];
  modelUsed: string;
  isLiveAi: boolean;
  confidence: string;
}

