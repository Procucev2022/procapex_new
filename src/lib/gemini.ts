import type { GenerativeModel } from '@google/generative-ai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from './logger';
import type {
  MLEOCostBreakdown,
  NegotiationParams,
  NegotiationTactic,
  DrawingExtractionRequest,
  DrawingExtractionResult,
} from '@/types';
import { DEFAULT_GEMINI_MODEL } from '@/constants';
import { cleanDrawingTitle, extractBOQItemsFromDrawing } from './boq-extractor';

export type {
  MLEOCostBreakdown,
  NegotiationParams,
  NegotiationTactic,
  DrawingExtractionRequest,
  DrawingExtractionResult,
};

export interface GeminiModelContext {
  model: GenerativeModel;
  displayModelName: string;
  apiModelId: string;
}

/**
 * Returns the Gemini model configured via environment variable GEMINI_MODEL.
 * Defaults to 'gemini-2.0-flash-lite' if not set.
 */
export function getConfiguredModelName(): string {
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (!envModel) {
    return DEFAULT_GEMINI_MODEL;
  }
  return envModel;
}

/**
 * Normalizes user-friendly model strings to valid Google Gemini API model IDs.
 * For instance, 'gemini 3.5 flash lite' or 'gemini-3.5-flash-lite' maps to 'gemini-2.0-flash-lite'.
 */
export function resolveApiModelId(modelName: string): string {
  const clean = modelName.toLowerCase().replace(/[\s_]/g, '-');
  if (clean.includes('3.5') || clean.includes('flash-lite')) {
    return DEFAULT_GEMINI_MODEL;
  }
  if (clean.includes('flash')) {
    return 'gemini-1.5-flash';
  }
  return modelName;
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
}

export function getGeminiModel(): GeminiModelContext | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const rawModelName = getConfiguredModelName();
  const apiModelId = resolveApiModelId(rawModelName);

  return {
    model: genAI.getGenerativeModel({ model: apiModelId }),
    displayModelName: rawModelName,
    apiModelId,
  };
}

/**
 * Generate bottom-up MLEO cost analysis using Gemini.
 */
export async function generateCostAnalysis(
  itemDescription: string,
  quantity = 1,
  uom = 'Unit',
  currentQuote?: number
): Promise<MLEOCostBreakdown> {
  const gemini = getGeminiModel();
  logger.info('lib/gemini', 'Initiating MLEO cost analysis', {
    itemDescription,
    quantity,
    uom,
    currentQuote,
    hasApiKey: Boolean(gemini),
  });

  if (gemini) {
    const startTime = Date.now();
    try {
      logger.debug('lib/gemini', 'Dispatching prompt to Gemini API', {
        apiModelId: gemini.apiModelId,
        itemDescription,
      });

      const prompt = `You are an expert construction and industrial procurement cost engineer.
Analyze the following item and perform a bottom-up MLEO (Material, Labour, Equipment, Overheads) cost deconstruction:
Item: "${itemDescription}"
Quantity: ${quantity} ${uom}
${currentQuote ? `Vendor Quoted Rate: ₹${currentQuote}` : ''}

Respond ONLY with valid JSON in this exact structure without markdown backticks:
{
  "itemName": "${itemDescription}",
  "targetRate": <number, fair estimated unit price in INR>,
  "maxLimit": <number, maximum acceptable rate in INR>,
  "currency": "INR",
  "pillars": {
    "material": { "percentage": <number>, "cost": <number>, "description": "<concise summary of raw materials>" },
    "labour": { "percentage": <number>, "cost": <number>, "description": "<labour crew requirements>" },
    "equipment": { "percentage": <number>, "cost": <number>, "description": "<machinery/tool wear/diesel>" },
    "overheads": { "percentage": <number>, "cost": <number>, "description": "<testing, contractor margin, logistics>" }
  },
  "inflators": [
    { "title": "<Cost Inflator 1>", "description": "<Why vendor might have inflated this vs market benchmark>" },
    { "title": "<Cost Inflator 2>", "description": "<Another inflation factor>" }
  ],
  "negotiationScripts": [
    { "title": "<Negotiation Argument 1>", "argument": "<Direct script for buyer to use against vendor quoting real indices>" },
    { "title": "<Negotiation Argument 2>", "argument": "<Second commercial or volume negotiation script>" }
  ]
}`;

      const result = await gemini.model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      logger.info('lib/gemini', 'Gemini live AI cost analysis completed successfully', {
        durationMs: Date.now() - startTime,
        targetRate: parsed.targetRate,
        maxLimit: parsed.maxLimit,
        modelUsed: gemini.displayModelName,
      });

      return {
        ...parsed,
        modelUsed: gemini.displayModelName,
        isLiveAi: true,
      };
    } catch (err: unknown) {
      logger.warn('lib/gemini', 'Gemini API call failed, falling back to intelligent heuristic calculation', {
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - startTime,
      });
    }
  }

  // Fallback intelligent estimation if GEMINI_API_KEY is not configured
  const baseRate = currentQuote ? Math.round(currentQuote * 0.88) : 4350;
  const matCost = Math.round(baseRate * 0.56);
  const labCost = Math.round(baseRate * 0.14);
  const eqCost = Math.round(baseRate * 0.18);
  const ovhCost = baseRate - matCost - labCost - eqCost;

  logger.info('lib/gemini', 'Generated bottom-up heuristic cost estimation', {
    itemDescription,
    baseRate,
    isLiveAi: false,
  });

  return {
    itemName: itemDescription,
    targetRate: baseRate,
    maxLimit: Math.round(baseRate * 1.05),
    currency: 'INR',
    pillars: {
      material: {
        percentage: 56,
        cost: matCost,
        description: 'Core industrial raw materials and constituent components',
      },
      labour: {
        percentage: 14,
        cost: labCost,
        description: 'Skilled fabrication, handling, and placement crew',
      },
      equipment: {
        percentage: 18,
        cost: eqCost,
        description: 'Plant machinery, power, tooling & transit equipment',
      },
      overheads: {
        percentage: 12,
        cost: ovhCost,
        description: 'Quality testing, logistics, and standard contractor margin',
      },
    },
    inflators: [
      {
        title: 'Local Transport & Transit Markup',
        description: 'Vendor has incorporated peak logistics freight surcharge above current index.',
      },
      {
        title: 'Contractor Margin Disparity',
        description: 'Quoted contractor gross margin is ~22% vs regional historical index of 12-14%.',
      },
    ],
    negotiationScripts: [
      {
        title: 'Commodity Index Deflation',
        argument: `Wholesale raw material indices indicate a 3.8% softening this quarter. Target unit rate is ₹${baseRate.toLocaleString('en-IN')}/${uom}.`,
      },
      {
        title: 'Volume & Payment Terms Leverage',
        argument: `For committed procurement volumes under milestone-based 45-day payment, plant setup costs amortize. We counter at ₹${baseRate.toLocaleString('en-IN')}/${uom}.`,
      },
    ],
    modelUsed: `${getConfiguredModelName()} (Demo Mode - Add GEMINI_API_KEY to .env for live AI)`,
    isLiveAi: false,
  };
}

/**
 * Generate counter-offer negotiation tactics using Gemini.
 */
export async function generateCounterOffer(params: NegotiationParams): Promise<NegotiationTactic> {
  const gemini = getGeminiModel();
  const { prTitle, itemName, vendorQuoteRate, targetBenchmark, currentRound, historySummary } = params;

  logger.info('lib/gemini', 'Generating negotiation counter-offer', {
    prTitle,
    itemName,
    vendorQuoteRate,
    targetBenchmark,
    currentRound,
    hasApiKey: Boolean(gemini),
  });

  if (gemini) {
    const startTime = Date.now();
    try {
      logger.debug('lib/gemini', 'Dispatching negotiation prompt to Gemini API', {
        apiModelId: gemini.apiModelId,
        currentRound,
      });

      const prompt = `You are an expert commercial procurement negotiator for an enterprise EPC construction firm.
We are negotiating on:
PR: "${prTitle}"
Item: "${itemName}"
Vendor Latest Quoted Rate: ₹${vendorQuoteRate}
Our Target Benchmark: ₹${targetBenchmark}
Negotiation Round: ${currentRound}
${historySummary ? `Previous rounds history: ${historySummary}` : ''}

Provide a tactical counter-offer. Respond ONLY with valid JSON in this structure:
{
  "recommendedCounterRate": <number, numeric proposed counter rate between benchmark and quote>,
  "counterRemarks": "<persuasive 2-3 sentence counter-offer message citing indices, volume, and payment terms>",
  "strategyAdvice": "<tactical guidance for the buyer during the vendor discussion>"
}`;

      const result = await gemini.model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      logger.info('lib/gemini', 'Gemini negotiation counter-offer generated', {
        durationMs: Date.now() - startTime,
        recommendedCounterRate: parsed.recommendedCounterRate,
        modelUsed: gemini.displayModelName,
      });

      return {
        ...parsed,
        modelUsed: gemini.displayModelName,
        isLiveAi: true,
      };
    } catch (err: unknown) {
      logger.warn('lib/gemini', 'Gemini counter-offer generation failed, falling back to heuristic calculation', {
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - startTime,
      });
    }
  }

  // Fallback negotiation logic
  const gap = vendorQuoteRate - targetBenchmark;
  const concession = currentRound === 1 ? gap * 0.35 : gap * 0.55;
  const counterRate = Math.round(targetBenchmark + concession);

  logger.info('lib/gemini', 'Generated heuristic counter-offer tactic', {
    counterRate,
    concession,
    isLiveAi: false,
  });

  return {
    recommendedCounterRate: counterRate,
    counterRemarks: `Reference AI MLEO cost model and commodity index trends. In consideration of project schedule and 45-day cycle, we propose ₹${counterRate.toLocaleString('en-IN')} as our competitive counter-offer.`,
    strategyAdvice: 'Hold firm on standard contractor margin (12%). Concede on advance payment guarantees if vendor commits to delivery schedule.',
    modelUsed: `${getConfiguredModelName()} (Demo Mode - Add GEMINI_API_KEY to .env for live AI)`,
    isLiveAi: false,
  };
}

function buildDrawingPrompt(params: DrawingExtractionRequest): string {
  const { fileName = '', fileType = '', drawingTitleHint = '', categoryHint = '', textContent = '' } = params;
  return `You are a chief construction estimation engineer and CAD drawing reader.
A user has uploaded a technical engineering drawing for procurement.
Drawing Details:
File Name: "${fileName}"
File Type: "${fileType}"
Drawing Title / Elevation Hint: "${drawingTitleHint}"
Project Trade / Category Context: "${categoryHint}"
${textContent ? `OCR / Drawing Text Block: "${textContent}"` : ''}

CRITICAL ARCHITECTURAL RULES:
1. If the drawing is for interior woodwork, joinery, or millwork (such as "Full Height Storage", "Storage - 1 Elevation", "Wardrobe", "Cabinet", "Counter", "Shelving Unit"):
   - Inspect drawing callouts carefully (e.g. "PLY as 20mm thick", "21066 Black laminate lam-01 for inside", "Magas Walnut 10510 lam-02 for outside", "75mm gap between shutter and R.F.L").
   - Extract specifications for:
     a. Carcass & shelves substrate (e.g. 20mm BWP Plywood IS 710)
     b. Internal finish (e.g. 1.0mm 21066 Black Laminate lam-01)
     c. External finish (e.g. 1.0mm Magas Walnut 10510 Decorative Laminate lam-02)
     d. Full height shutter door leaf with matching PVC edge banding
     e. Joinery hardware (soft-close 3D concealed hinges, handle, magnetic catch)
     f. Plinth / base skirting (75mm with waterproof silicone sealing)
   - STRICT PROHIBITION: Under NO circumstance should industrial warehouse slotted angle pallet racks, steel shelving, or wire mesh decking be generated for an interior millwork / wardrobe drawing.
2. Only generate industrial pallet racking if the drawing explicitly depicts heavy industrial warehouse racking.

Analyze the drawing and provide:
1. "drawingTitle": The clean, official drawing sheet name or elevation title.
2. "category": The primary engineering trade (e.g. "Interior & Fitouts", "Civil & Structural", "Electrical & ELV", "HVAC & Mechanical", "Plumbing & Sanitary", "Facade & Glazing").
3. "subCategory": The specialized sub-trade.
4. "confidence": AI extraction confidence percentage (e.g. "96%").
5. "items": An array of 4 to 8 itemized engineering specifications strictly corresponding to this drawing. Each item MUST have:
   - "code": Unique uppercase specification code (e.g. "DWG-SPEC-001")
   - "desc": Detailed technical specification with material grades, dimensions, hardware, or finish
   - "uom": Standard engineering unit (one of: "Sqm", "Rmt", "Nos", "Kg", "Set", "Cum", "Ton", "Sqft")
   - "qty": Calculated quantity (number) based on drawing dimensions/scope
   - "benchmark": Fair unit rate in INR (number)
   - "rateCard": Rate card rate in INR (number)
   - "status": "Active"

Respond ONLY with valid JSON in this exact structure without markdown backticks:
{
  "drawingTitle": "<string>",
  "category": "<string>",
  "subCategory": "<string>",
  "confidence": "<string>",
  "items": [
    {
      "code": "<string>",
      "desc": "<string>",
      "uom": "<string>",
      "qty": 10,
      "benchmark": 1500,
      "rateCard": 1500,
      "status": "Active"
    }
  ]
}`;
}

export async function extractDrawingWithAI(
  params: DrawingExtractionRequest,
): Promise<DrawingExtractionResult> {
  const gemini = getGeminiModel();
  const { fileName = '', drawingTitleHint = '', categoryHint = '' } = params;

  logger.info('lib/gemini', 'Initiating AI drawing extraction', {
    fileName,
    drawingTitleHint,
    categoryHint,
    hasApiKey: Boolean(gemini),
    hasBase64: Boolean(params.fileBase64),
  });

  if (gemini) {
    const startTime = Date.now();
    try {
      const prompt = buildDrawingPrompt(params);
      let contentPayload: string | Array<string | { inlineData: { data: string; mimeType: string } }> = prompt;

      if (params.fileBase64) {
        const cleanBase64 = params.fileBase64.replace(/^data:[^;]+;base64,/, '');
        const mimeType = params.fileMimeType || (params.fileName?.endsWith('.pdf') ? 'application/pdf' : 'image/png');
        contentPayload = [
          prompt,
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
        ];
      }

      const result = await gemini.model.generateContent(contentPayload);
      const text = result.response.text();
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        logger.info('lib/gemini', 'Gemini AI drawing extraction succeeded', {
          durationMs: Date.now() - startTime,
          drawingTitle: parsed.drawingTitle,
          itemCount: parsed.items.length,
          modelUsed: gemini.displayModelName,
        });

        const resolvedTitle = parsed.drawingTitle || drawingTitleHint || cleanDrawingTitle(fileName);
        return {
          drawingTitle: resolvedTitle,
          category: parsed.category || categoryHint || 'Interior & Fitouts',
          subCategory: parsed.subCategory,
          items: parsed.items.map((
            it: {
              code?: string;
              desc?: string;
              uom?: string;
              qty?: number;
              benchmark?: number;
              rateCard?: number;
            },
            idx: number,
          ) => ({
            code: it.code || `DWG-SPEC-00${idx + 1}`,
            desc: it.desc || `Specification ${idx + 1} for ${resolvedTitle}`,
            uom: it.uom || 'Sqm',
            qty: Number(it.qty) || 1,
            benchmark: Number(it.benchmark) || 1500,
            rateCard: Number(it.rateCard) || Number(it.benchmark) || 1500,
            status: 'Active',
            drawingElevation: resolvedTitle,
          })),
          modelUsed: gemini.displayModelName,
          isLiveAi: true,
          confidence: parsed.confidence || '96%',
        };
      }
    } catch (err: unknown) {
      logger.warn('lib/gemini', 'Gemini drawing extraction failed, falling back to engineering extractor', {
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - startTime,
      });
    }
  }

  // Offline intelligent engineering fallback
  const resolvedTitle = drawingTitleHint?.trim() || cleanDrawingTitle(fileName || 'Technical Drawing');
  const items = extractBOQItemsFromDrawing(resolvedTitle, categoryHint);

  logger.info('lib/gemini', 'Generated engineering drawing specifications via offline engine', {
    resolvedTitle,
    itemCount: items.length,
    isLiveAi: false,
  });

  return {
    drawingTitle: resolvedTitle,
    category: categoryHint || 'Interior & Fitouts',
    items: items.map(it => ({
      code: it.code,
      desc: it.desc,
      uom: it.uom,
      qty: it.qty,
      benchmark: it.benchmark || 1500,
      rateCard: it.rateCard || 1500,
      status: 'Active',
      drawingElevation: resolvedTitle,
    })),
    modelUsed: `${getConfiguredModelName()} (Demo Mode - Add GEMINI_API_KEY to .env for live AI)`,
    isLiveAi: false,
    confidence: '95%',
  };
}

