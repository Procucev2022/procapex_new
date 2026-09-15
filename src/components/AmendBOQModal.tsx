'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, X, Database, CheckCircle2 } from 'lucide-react';
import { UI_STRINGS, AMEND_BOQ_ITEM_SCHEMA } from '@/constants';
import { logger } from '@/lib/logger';
import { validateSchema } from '@/lib/validator';
import type { AmendBOQModalProps, RequesterBOQItem, AmendCategoryOption } from '@/types';

const STANDARD_UOMS = ['Sqm', 'Rmt', 'Nos', 'Kg', 'Set', 'Cum', 'Ton', 'Sqft', 'Mtr'];

const EMPTY_CATEGORIES: AmendCategoryOption[] = [];

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

  useEffect(() => {
    if (isOpen && item) {
      setCode(item.code || '');
      setDesc(item.desc || '');
      setUom(item.uom || 'Sqm');
      setQty(String(item.qty || 1));
      setBenchmarkRate(String(item.benchmark || item.rateCard || 1500));
      setAddToStandardBOQ(false);
      setValidationError(null);

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
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="amend-boq-title" className="text-base font-bold text-slate-900">{UI_STRINGS.prModule.amendBOQTitle}</h3>
              <p className="text-[11px] text-slate-500">Update specification details or register into Master Catalog</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
