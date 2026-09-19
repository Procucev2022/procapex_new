'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, X, Database, CheckCircle2, Sparkles, Wand2, ArrowRight } from 'lucide-react';
import { UI_STRINGS, AMEND_BOQ_ITEM_SCHEMA } from '@/constants';
import { logger } from '@/lib/logger';
import { validateSchema } from '@/lib/validator';
import type { AmendBOQModalProps, RequesterBOQItem, AmendCategoryOption, RefineBOQItemResult } from '@/types';

const STANDARD_UOMS = ['Sqm', 'Rmt', 'Nos', 'Kg', 'Set', 'Cum', 'Ton', 'Sqft', 'Mtr'];

const EMPTY_CATEGORIES: AmendCategoryOption[] = [];

const QUICK_SPEC_PRESETS = [
  'Upgrade to 12mm extra-clear toughened safety glass with AISI 316 matte black spider fittings and chamfered edges',
  'Fire-retardant BWP grade marine plywood with 1mm anti-scratch laminate and anti-termite treatment',
  'Heavy duty structural framing with powder-coated anti-corrosion finish and seismic buffer gaskets',
  'Include supply, uncrating, precision laser alignment, testing, commissioning, and 24-month warranty',
];

export const AmendBOQModal: React.FC<AmendBOQModalProps> = ({
  isOpen,
  item,
  index,
  onClose,
  onSave,
  availableCategories = EMPTY_CATEGORIES,
  currentCategoryName,
}) => {
  const [code, setCode] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [uom, setUom] = useState<string>('Sqm');
  const [qty, setQty] = useState<string>('1');
  const [benchmarkRate, setBenchmarkRate] = useState<string>('1500');
  const [addToStandardBOQ, setAddToStandardBOQ] = useState<boolean>(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // AI Refinement state
  const [userSpecsInput, setUserSpecsInput] = useState<string>('');
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [refinementResult, setRefinementResult] = useState<RefineBOQItemResult | null>(null);
  const [refineError, setRefineError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      setCode(item.code || '');
      setDesc(item.desc || '');
      setUom(item.uom || 'Sqm');
      setQty(String(item.qty || 1));
      setBenchmarkRate(String(item.benchmark || item.rateCard || 1500));
      setAddToStandardBOQ(false);
      setValidationError(null);
      setUserSpecsInput('');
      setRefinementResult(null);
      setRefineError(null);

      // Default to matching category if available
      if (availableCategories.length > 0) {
        const match = currentCategoryName
          ? availableCategories.find(
              (c) => c.name.toLowerCase() === currentCategoryName.toLowerCase(),
            )
          : null;
        const target = match || availableCategories[0];
        setSelectedCategoryId(target.id);
        setSelectedSubCategoryId(target.subCategories?.[0]?.id || '');
      }
    }
  }, [isOpen, item, availableCategories, currentCategoryName]);

  if (!isOpen || !item) return null;

  const activeCategory = availableCategories.find((c) => c.id === selectedCategoryId);

  // Trigger AI Refinement
  const handleRefineWithAI = async (): Promise<void> => {
    if (!userSpecsInput.trim()) {
      setRefineError('Please enter specifications or engineering notes to refine.');
      return;
    }

    setIsRefining(true);
    setRefineError(null);

    try {
      const res = await fetch('/api/ai/refine-boq-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemCode: code || item.code,
          currentDesc: desc || item.desc,
          currentUom: uom,
          currentQty: parseFloat(qty) || 1,
          currentBenchmarkRate: parseFloat(benchmarkRate) || 1500,
          userInputSpecs: userSpecsInput.trim(),
          categoryHint: currentCategoryName || activeCategory?.name,
        }),
      });

      if (res.ok) {
        const data: RefineBOQItemResult = await res.json();
        setRefinementResult(data);
        logger.info('components/AmendBOQModal', 'AI Refinement result received', {
          itemCode: data.refinedCode,
          refinedRate: data.refinedBenchmarkRate,
        });
      } else {
        const errData = await res.json();
        setRefineError(errData.error || 'Failed to refine BOQ specifications with AI.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setRefineError(`AI Refinement error: ${message}`);
      logger.error('components/AmendBOQModal', 'Exception in handleRefineWithAI', { error: message });
    } finally {
      setIsRefining(false);
    }
  };

  // Directly Accept the Revised BOQ item
  const handleAcceptRevisedBOQ = (): void => {
    if (!refinementResult) return;

    const amendedItem: RequesterBOQItem = {
      ...item,
      code: refinementResult.refinedCode || code,
      desc: refinementResult.refinedDesc,
      uom: refinementResult.refinedUom,
      qty: refinementResult.refinedQty,
      benchmark: refinementResult.refinedBenchmarkRate,
      rateCard: refinementResult.refinedBenchmarkRate,
      isRefined: true,
      aiRationale: refinementResult.aiRationale,
      status: 'Refined',
    };

    logger.info('components/AmendBOQModal', 'Accepted revised BOQ item directly', {
      index,
      code: amendedItem.code,
      benchmark: amendedItem.benchmark,
    });

    onSave(
      amendedItem,
      index,
      addToStandardBOQ,
      addToStandardBOQ ? selectedCategoryId : undefined,
      addToStandardBOQ ? selectedSubCategoryId : undefined,
    );
    onClose();
  };

  // Populate editable form with revised values for manual correction
  const handleCorrectRevisedBOQ = (): void => {
    if (!refinementResult) return;
    setDesc(refinementResult.refinedDesc);
    setUom(refinementResult.refinedUom);
    setQty(String(refinementResult.refinedQty));
    setBenchmarkRate(String(refinementResult.refinedBenchmarkRate));
    setRefinementResult(null);
  };

  const handleSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();

    const numericQty = parseFloat(qty);
    const numericRate = parseFloat(benchmarkRate) || 1500;

    const validation = validateSchema(
      {
        code: code.trim(),
        desc: desc.trim(),
        uom: uom.trim(),
        qty: numericQty,
        benchmarkRate: numericRate,
        addToStandardBOQ,
        categoryId: selectedCategoryId,
        subCategoryId: selectedSubCategoryId,
      },
      AMEND_BOQ_ITEM_SCHEMA,
    );

    if (!validation.isValid) {
      setValidationError(validation.errorSummary ?? 'Validation failed');
      logger.warn('components/AmendBOQModal', 'BOQ amendment validation failed', {
        errors: validation.errors,
      });
      return;
    }

    const amendedItem: RequesterBOQItem = {
      ...item,
      code: code.trim(),
      desc: desc.trim(),
      uom: uom.trim(),
      qty: numericQty,
      benchmark: numericRate,
      rateCard: numericRate,
      isRefined: true,
      status: 'Refined',
    };

    logger.info('components/AmendBOQModal', 'Saving amended BOQ item', {
      index,
      code: amendedItem.code,
      desc: amendedItem.desc,
      qty: amendedItem.qty,
      addToStandardBOQ,
      categoryId: selectedCategoryId,
    });

    onSave(
      amendedItem,
      index,
      addToStandardBOQ,
      addToStandardBOQ ? selectedCategoryId : undefined,
      addToStandardBOQ ? selectedSubCategoryId : undefined,
    );
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="amend-boq-title"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="amend-boq-title" className="text-base font-bold text-slate-900">
                {UI_STRINGS.prModule.amendBOQTitle}
              </h3>
              <p className="text-[11px] text-slate-500">
                Refine technical specifications with AI, recalibrate benchmark rates, or update manually
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {validationError}
          </div>
        )}

        {/* AI REFINEMENT WORKBENCH */}
        <div className="p-4 bg-gradient-to-br from-sky-50 via-indigo-50/40 to-purple-50/30 rounded-2xl border border-sky-200 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span className="font-bold text-slate-900">{UI_STRINGS.prModule.aiRefineTitle}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
              Gemini 2.0 Flash
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {UI_STRINGS.prModule.aiRefineSubtitle}
          </p>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              {UI_STRINGS.prModule.inputSpecsPrompt}
            </label>
            <textarea
              rows={2}
              value={userSpecsInput}
              onChange={(e) => setUserSpecsInput(e.target.value)}
              placeholder={UI_STRINGS.prModule.inputSpecsPlaceholder}
              className="w-full border border-sky-300 rounded-xl p-2.5 bg-white text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Quick Spec Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              {UI_STRINGS.prModule.quickPromptsLabel}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SPEC_PRESETS.map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => setUserSpecsInput((prev) => (prev ? `${prev}; ${preset}` : preset))}
                  className="text-[10px] bg-white hover:bg-sky-50 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-sky-200 transition-colors text-left"
                >
                  + {preset.slice(0, 48)}...
                </button>
              ))}
            </div>
          </div>

          {refineError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold">
              {refineError}
            </div>
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={handleRefineWithAI}
              disabled={isRefining}
              className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <Wand2 className={`w-4 h-4 ${isRefining ? 'animate-spin' : ''}`} />
              <span>{isRefining ? UI_STRINGS.prModule.refiningButton : UI_STRINGS.prModule.refineWithAiButton}</span>
            </button>
          </div>
        </div>

        {/* AI REFINED OUTPUT & ACCEPTANCE CARD */}
        {refinementResult && (
          <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-3.5 text-xs shadow-sm">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
              <div className="flex items-center space-x-2 text-emerald-950">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-black text-sm">{UI_STRINGS.prModule.refinedOutputHeading}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                Confidence: {refinementResult.confidence}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-900 block">Refined Technical Specifications:</span>
              <p className="p-2.5 bg-white rounded-xl border border-emerald-200 text-slate-800 font-medium leading-relaxed">
                {refinementResult.refinedDesc}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white rounded-xl border border-emerald-200">
                <span className="text-[10px] text-slate-500 block">UOM</span>
                <span className="font-bold text-slate-900">{refinementResult.refinedUom}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-emerald-200">
                <span className="text-[10px] text-slate-500 block">Required Qty</span>
                <span className="font-bold text-slate-900">{refinementResult.refinedQty}</span>
              </div>
              <div className="p-2 bg-emerald-100/80 rounded-xl border border-emerald-300">
                <span className="text-[10px] text-emerald-800 block font-semibold">AI Benchmark Rate</span>
                <span className="font-black text-emerald-950 text-sm">
                  ₹{refinementResult.refinedBenchmarkRate.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {refinementResult.specsHighlighted && refinementResult.specsHighlighted.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {refinementResult.specsHighlighted.map((tag, tIdx) => (
                  <span key={tIdx} className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-200 text-[11px]">
              <span className="font-bold text-emerald-900 block mb-0.5">{UI_STRINGS.prModule.aiRationaleLabel}</span>
              <span className="text-slate-700">{refinementResult.aiRationale}</span>
            </div>

            {/* Primary Action Buttons for Refined BOQ */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleAcceptRevisedBOQ}
                className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{UI_STRINGS.prModule.acceptRevisedButton}</span>
              </button>
              <button
                type="button"
                onClick={handleCorrectRevisedBOQ}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-center space-x-1"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{UI_STRINGS.prModule.correctAndAcceptButton}</span>
              </button>
            </div>
          </div>
        )}

        {/* MANUAL / DIRECT AMENDMENT FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-1 border-t">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">Direct BOQ Line Item Specifications:</span>
            <span className="text-[11px] text-slate-500">Edit fields directly if desired</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Item Code *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full border rounded-xl p-2 bg-slate-50 focus:bg-white font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Unit of Measure (UOM) *</label>
              <select
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                className="w-full border rounded-xl p-2 bg-slate-50 focus:bg-white font-bold text-slate-800"
              >
                {STANDARD_UOMS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Technical Specification Description *</label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
              className="w-full border rounded-xl p-2 bg-slate-50 focus:bg-white text-slate-900 font-medium leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Required Quantity *</label>
              <input
                type="number"
                step="0.1"
                min="0.001"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                required
                className="w-full border rounded-xl p-2 bg-slate-50 focus:bg-white font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimated Benchmark Rate (₹)</label>
              <input
                type="number"
                min="0"
                value={benchmarkRate}
                onChange={(e) => setBenchmarkRate(e.target.value)}
                className="w-full border rounded-xl p-2 bg-slate-50 focus:bg-white font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Add to Standard BOQ Master Option */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={addToStandardBOQ}
                onChange={(e) => setAddToStandardBOQ(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 mt-0.5 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 block flex items-center space-x-1">
                  <Database className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
                  {UI_STRINGS.prModule.addToStandardBOQPrompt}
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  {UI_STRINGS.prModule.addToStandardBOQDesc}
                </span>
              </div>
            </label>

            {addToStandardBOQ && availableCategories.length > 0 && (
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Select Target Master Category:
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => {
                      setSelectedCategoryId(e.target.value);
                      const cat = availableCategories.find((c) => c.id === e.target.value);
                      setSelectedSubCategoryId(cat?.subCategories?.[0]?.id || '');
                    }}
                    className="w-full border rounded-xl p-2 bg-white text-xs font-semibold text-slate-800"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.id})
                      </option>
                    ))}
                  </select>
                </div>

                {activeCategory?.subCategories && activeCategory.subCategories.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Target Sub-Category (Optional):
                    </label>
                    <select
                      value={selectedSubCategoryId}
                      onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                      className="w-full border rounded-xl p-2 bg-white text-xs font-semibold text-slate-800"
                    >
                      <option value="">-- None (Direct Category Item) --</option>
                      {activeCategory.subCategories.map((sub: { id: string; name: string }) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{UI_STRINGS.prModule.saveAmendmentButton}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
