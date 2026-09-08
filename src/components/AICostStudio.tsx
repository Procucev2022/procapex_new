'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, UserCheck, Send, Lightbulb, AlertCircle, RefreshCw, Cpu, CheckCircle2 } from 'lucide-react';
import { logger } from '@/lib/logger';

import {
  AICostStudioProps,
  MLEOPillars,
  CostInflator,
  NegotiationScript,
} from '@/types';
import { PRESET_ITEMS, UI_STRINGS, formatString } from '@/constants';

export const AICostStudio: React.FC<AICostStudioProps> = ({ onNavigateToNegotiation }) => {
  const [selectedItemName, setSelectedItemName] = useState<string>(PRESET_ITEMS[0].name);
  const [customItem, setCustomItem] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(450);
  const [uom, setUom] = useState<string>('Cum');
  const [quotedRate, setQuotedRate] = useState<number>(4200);

  const [targetRate, setTargetRate] = useState<number>(4350);
  const [maxLimit, setMaxLimit] = useState<number>(4500);
  const [pillars, setPillars] = useState<MLEOPillars>({
    material: { percentage: 56, cost: 2436, description: 'Cement, aggregate, sand, fly ash' },
    labour: { percentage: 14, cost: 609, description: 'Batching & transit mixing crew' },
    equipment: { percentage: 18, cost: 783, description: 'Transit mixers, diesel & pump wear' },
    overheads: { percentage: 12, cost: 522, description: 'QC testing & standard contractor margin' },
  });
  const [inflators, setInflators] = useState<CostInflator[]>([
    {
      title: 'Aggregate Transit Surcharge',
      description: 'Vendor added +₹250/Cum transport markup vs local quarry index.',
    },
    {
      title: 'Excess Contractor Margin',
      description: 'Quoted margin is 22% vs regional benchmark of 12-14%.',
    },
  ]);
  const [scripts, setScripts] = useState<NegotiationScript[]>([
    {
      title: 'Argument 1: Raw Material Deflation',
      argument: 'OPC 53 cement wholesale index dropped 4.2% locally this month. Your material cost should be ₹2,436/Cum.',
    },
    {
      title: 'Argument 2: Volume Amortization',
      argument: 'For a committed bulk volume of 450 Cum, plant setup overhead amortizes below ₹120/Cum. We counter at ₹4,350/Cum.',
    },
  ]);

  const [aiStatus, setAiStatus] = useState<{ model: string; isConfigured: boolean; message: string }>({
    model: 'gemini 3.5 flash lite',
    isConfigured: false,
    message: 'Loading AI configuration...',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modelUsedNote, setModelUsedNote] = useState<string>('');

  useEffect(() => {
    fetch('/api/ai/status')
      .then((res) => res.json())
      .then((data) => {
        logger.debug('ui/AICostStudio', 'Loaded AI provider status', data);
        setAiStatus(data);
      })
      .catch((err) => {
        logger.error('ui/AICostStudio', 'Failed to load AI status', { error: err?.message });
      });
  }, []);

  const handleSelectPreset = (preset: typeof PRESET_ITEMS[0]) => {
    logger.debug('ui/AICostStudio', 'Selected item preset for analysis', { preset: preset.name });
    setSelectedItemName(preset.name);
    setCustomItem('');
    setQuantity(preset.qty);
    setUom(preset.uom);
    setQuotedRate(preset.quote);
  };

  const handleGenerateAnalysis = async () => {
    const itemToAnalyze = customItem.trim() || selectedItemName;
    setIsLoading(true);
    logger.info('ui/AICostStudio', 'Initiating cost analysis from UI', {
      itemToAnalyze,
      quantity,
      uom,
      quotedRate,
    });
    try {
      const res = await fetch('/api/ai/cost-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemDescription: itemToAnalyze,
          quantity,
          uom,
          currentQuote: quotedRate,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      logger.info('ui/AICostStudio', 'Cost analysis received successfully in UI', {
        targetRate: data.targetRate,
        maxLimit: data.maxLimit,
        modelUsed: data.modelUsed,
      });

      if (data.targetRate) setTargetRate(data.targetRate);
      if (data.maxLimit) setMaxLimit(data.maxLimit);
      if (data.pillars) setPillars(data.pillars);
      if (data.inflators) setInflators(data.inflators);
      if (data.negotiationScripts) setScripts(data.negotiationScripts);
      if (data.modelUsed) setModelUsedNote(data.modelUsed);
    } catch (err: any) {
      logger.error('ui/AICostStudio', 'Error running Gemini cost analysis', { error: err?.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Model Badge */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {UI_STRINGS.aiCostStudio.badge}
            </span>
            <h2 className="text-xl font-bold text-slate-900">{UI_STRINGS.aiCostStudio.title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {UI_STRINGS.aiCostStudio.subtitle}
          </p>
        </div>

        {/* Dynamic Gemini Status Pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs self-start md:self-auto">
          <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
          <div className="text-slate-700">
            <span className="font-semibold text-purple-900">{UI_STRINGS.aiCostStudio.modelLabel}</span>
            <span className="font-mono text-purple-800 font-bold">{aiStatus.model}</span>
            <span className="text-[10px] text-slate-500 block">{UI_STRINGS.aiCostStudio.modelEnvNote}</span>
          </div>
        </div>
      </div>

      {/* Item Selector & Gemini Prompt Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            {UI_STRINGS.aiCostStudio.analyzeItemTitle}
          </span>
          <span className="text-[11px] text-slate-400">{UI_STRINGS.aiCostStudio.quickPresetsHint}</span>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2">
          {PRESET_ITEMS.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => handleSelectPreset(item)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                selectedItemName === item.name && !customItem
                  ? 'bg-purple-600 text-white border-purple-600 font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Custom or Selected Item Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          <div className="md:col-span-6">
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">{UI_STRINGS.aiCostStudio.itemDescriptionLabel}</label>
            <input
              type="text"
              value={customItem || selectedItemName}
              onChange={(e) => {
                setCustomItem(e.target.value);
                setSelectedItemName('');
              }}
              placeholder={UI_STRINGS.aiCostStudio.itemDescriptionPlaceholder}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">{UI_STRINGS.aiCostStudio.quantityUomLabel}</label>
            <div className="flex space-x-1">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-2/3 text-xs border border-slate-300 rounded-lg p-2 font-medium text-slate-800"
              />
              <input
                type="text"
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                className="w-1/3 text-xs border border-slate-300 rounded-lg p-2 font-medium text-slate-800 text-center"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">{UI_STRINGS.aiCostStudio.quotedRateLabel}</label>
            <input
              type="number"
              value={quotedRate}
              onChange={(e) => setQuotedRate(parseFloat(e.target.value) || 0)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium text-slate-800 font-mono"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGenerateAnalysis}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{UI_STRINGS.aiCostStudio.analyzing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{UI_STRINGS.aiCostStudio.runAnalysis}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {modelUsedNote && (
          <div className="text-[11px] text-purple-700 bg-purple-50/70 p-2 rounded-md border border-purple-200 flex items-center justify-between">
            <span>
              <strong>{UI_STRINGS.aiCostStudio.activeAiEngine}</strong> {modelUsedNote}
            </span>
            <span className="text-[10px] text-slate-500">{UI_STRINGS.aiCostStudio.liveCostComplete}</span>
          </div>
        )}
      </div>

      {/* MLEO Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: MLEO Structure */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-purple-600">{UI_STRINGS.aiCostStudio.costBreakdown}</span>
              <h3 className="text-base font-bold text-slate-800">{customItem || selectedItemName}</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">{UI_STRINGS.aiCostStudio.targetFairRate}</span>
              <p className="text-lg font-bold text-purple-700 font-mono">
                ₹ {targetRate.toLocaleString('en-IN')} / {uom}
              </p>
            </div>
          </div>

          {/* 4 Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-[10px] font-bold uppercase text-blue-700">
                {formatString(UI_STRINGS.aiCostStudio.materialsTemplate, { percentage: pillars.material.percentage })}
              </span>
              <p className="text-base font-extrabold text-blue-950 mt-1 font-mono">₹ {pillars.material.cost.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-blue-600 mt-0.5 line-clamp-2">{pillars.material.description}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-[10px] font-bold uppercase text-amber-700">
                {formatString(UI_STRINGS.aiCostStudio.labourTemplate, { percentage: pillars.labour.percentage })}
              </span>
              <p className="text-base font-extrabold text-amber-950 mt-1 font-mono">₹ {pillars.labour.cost.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-amber-600 mt-0.5 line-clamp-2">{pillars.labour.description}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-[10px] font-bold uppercase text-emerald-700">
                {formatString(UI_STRINGS.aiCostStudio.equipmentTemplate, { percentage: pillars.equipment.percentage })}
              </span>
              <p className="text-base font-extrabold text-emerald-950 mt-1 font-mono">₹ {pillars.equipment.cost.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-emerald-600 mt-0.5 line-clamp-2">{pillars.equipment.description}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-[10px] font-bold uppercase text-purple-700">
                {formatString(UI_STRINGS.aiCostStudio.overheadTemplate, { percentage: pillars.overheads.percentage })}
              </span>
              <p className="text-base font-extrabold text-purple-950 mt-1 font-mono">₹ {pillars.overheads.cost.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-purple-600 mt-0.5 line-clamp-2">{pillars.overheads.description}</p>
            </div>
          </div>

          {/* Key Drivers Identified */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-700">{UI_STRINGS.aiCostStudio.costInflatorsTitle}</h4>
            <div className="space-y-2 text-xs">
              {inflators.map((inf, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-rose-50/70 border border-rose-200 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-900">{inf.title}: </span>
                    <span className="text-rose-800">{inf.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Human in the Loop Override (AI-08) */}
          <div className="pt-4 border-t border-slate-200 space-y-3 bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center">
                <UserCheck className="w-4 h-4 text-sky-600 mr-1.5" />
                {UI_STRINGS.aiCostStudio.buyerOverrideTitle}
              </h4>
              <span className="text-[10px] text-slate-400">{UI_STRINGS.aiCostStudio.auditableDecision}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">{UI_STRINGS.aiCostStudio.recommendedTargetRate}</label>
                <input
                  type="number"
                  value={targetRate}
                  onChange={(e) => setTargetRate(parseFloat(e.target.value))}
                  className="w-full mt-1 text-xs border border-slate-300 rounded-lg p-2 font-bold text-slate-800 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">{UI_STRINGS.aiCostStudio.maxWalkAwayLimit}</label>
                <input
                  type="number"
                  value={maxLimit}
                  onChange={(e) => setMaxLimit(parseFloat(e.target.value))}
                  className="w-full mt-1 text-xs border border-slate-300 rounded-lg p-2 font-bold text-slate-800 bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={onNavigateToNegotiation}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{UI_STRINGS.aiCostStudio.sendToNegotiationHub}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: AI Negotiation Script */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center">
            <Lightbulb className="w-4 h-4 text-amber-500 mr-2" />
            {UI_STRINGS.aiCostStudio.negotiationScriptTitle}
          </h3>
          <p className="text-xs text-slate-500">{UI_STRINGS.aiCostStudio.negotiationScriptSubtitle}</p>

          <div className="space-y-3 text-xs">
            {scripts.map((sc, idx) => (
              <div key={idx} className="p-3 bg-purple-50/70 rounded-lg border border-purple-200">
                <p className="font-bold text-purple-900">{sc.title}</p>
                <p className="text-purple-800 mt-1">&ldquo;{sc.argument}&rdquo;</p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {UI_STRINGS.aiCostStudio.indicesVerified}
            </span>
            <span>{UI_STRINGS.aiCostStudio.geminiIntelligence}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
