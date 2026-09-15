'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  PlusCircle,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  ListPlus,
  Plus,
  Trash2,
} from 'lucide-react';
import type {
  AddStandardBOQItemModalProps,
  AddStandardBOQItemInput,
  StandardBOQItem,
} from '@/types';
import { UI_STRINGS, ADD_STANDARD_BOQ_ITEM_SCHEMA, formatString } from '@/constants';
import { validateSchema } from '@/lib/validator';
import { logger } from '@/lib/logger';
import { generateUniqueItemCode } from '@/context/useBudgetManager';

const STANDARD_UOM_OPTIONS: string[] = [
  'Sqm',
  'Cum',
  'Ton',
  'Kg',
  'Rmt',
  'Nos',
  'Set',
  'Lot',
  'Sq.Ft',
];

interface MultiRowEntry {
  id: string;
  desc: string;
  subCategoryId: string;
  uom: string;
  benchmarkRate: string;
  defaultQty: string;
}

const createBlankRow = (subCatId = ''): MultiRowEntry => ({
  id: `ROW-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  desc: '',
  subCategoryId: subCatId,
  uom: 'Nos',
  benchmarkRate: '',
  defaultQty: '1',
});

export const AddStandardBOQItemModal: React.FC<AddStandardBOQItemModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialCategoryId,
  onAddItem,
  onOpenUpload,
  onBatchAddItems,
}) => {
  const strings = UI_STRINGS.categoryStandardBOQMaster;
  const commonStrings = UI_STRINGS.common;

  // Active entry mode
  const [entryMode, setEntryMode] = useState<'SINGLE' | 'MULTI'>('SINGLE');

  // Single Item form state
  const [categoryId, setCategoryId] = useState<string>(initialCategoryId || (categories[0]?.id ?? ''));
  const [subCategoryId, setSubCategoryId] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [uom, setUom] = useState<string>('Sqm');
  const [benchmarkRate, setBenchmarkRate] = useState<string>('');
  const [defaultQty, setDefaultQty] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // In-session added items to keep code generation sequence perfectly aligned
  const [sessionItems, setSessionItems] = useState<StandardBOQItem[]>([]);

  // Multi-row items state
  const [multiRows, setMultiRows] = useState<MultiRowEntry[]>([createBlankRow()]);

  useEffect(() => {
    if (initialCategoryId) {
      setCategoryId(initialCategoryId);
    }
  }, [initialCategoryId]);

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === categoryId);
  }, [categories, categoryId]);

  const subCategories = useMemo(() => {
    return selectedCategory?.subCategories ?? [];
  }, [selectedCategory]);

  // Combined categories with session-added items for live collision-free code derivation
  const categoriesWithSessionItems = useMemo(() => {
    if (sessionItems.length === 0) return categories;
    return categories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        items: [...cat.items, ...sessionItems.filter((it) => it.categoryId === cat.id)],
      };
    });
  }, [categories, categoryId, sessionItems]);

  // Compute live system-generated unique code preview
  const liveSystemCode = useMemo(() => {
    if (!categoryId) return 'SYSTEM-PENDING';
    return generateUniqueItemCode(
      categoriesWithSessionItems,
      categoryId,
      subCategoryId || undefined,
    );
  }, [categoriesWithSessionItems, categoryId, subCategoryId]);

  if (!isOpen) return null;

  const handleClose = (): void => {
    setValidationError(null);
    setSuccessNotice(null);
    setSessionItems([]);
    onClose();
  };

  const validateAndBuildSinglePayload = (): AddStandardBOQItemInput | null => {
    const payload: AddStandardBOQItemInput = {
      categoryId,
      subCategoryId: subCategoryId || undefined,
      desc: desc.trim(),
      uom: uom.trim(),
      benchmarkRate: Number(benchmarkRate),
      defaultQty: Number(defaultQty),
      notes: notes.trim() || undefined,
    };

    const result = validateSchema(payload, ADD_STANDARD_BOQ_ITEM_SCHEMA);
    if (!result.isValid) {
      const errorMsg = result.errors.map((err) => err.message).join('. ');
      setValidationError(errorMsg);
      logger.warn('ui/AddStandardBOQItemModal', 'Validation failed for new BOQ item', {
        errors: result.errors,
      });
      return null;
    }
    return payload;
  };

  const handleSingleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setValidationError(null);
    setSuccessNotice(null);

    const payload = validateAndBuildSinglePayload();
    if (!payload) return;

    try {
      onAddItem(payload);
      logger.info('ui/AddStandardBOQItemModal', 'Standard BOQ item added successfully', {
        categoryId,
        code: liveSystemCode,
      });
      handleClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save standard BOQ item';
      setValidationError(msg);
      logger.error('ui/AddStandardBOQItemModal', 'Error submitting BOQ item', { error: msg });
    }
  };

  const handleSaveAndAddAnother = (e: React.MouseEvent): void => {
    e.preventDefault();
    setValidationError(null);
    setSuccessNotice(null);

    const payload = validateAndBuildSinglePayload();
    if (!payload) return;

    try {
      const savedCode = liveSystemCode;
      onAddItem(payload);

      // Track session item so subsequent code increments
      const pseudoItem: StandardBOQItem = {
        id: `TEMP-${savedCode}`,
        code: savedCode,
        categoryId: payload.categoryId,
        subCategoryId: payload.subCategoryId,
        desc: payload.desc,
        uom: payload.uom,
        benchmarkRate: payload.benchmarkRate,
        defaultQty: payload.defaultQty,
        qty: payload.defaultQty,
        calculatedCost: Math.round(payload.defaultQty * payload.benchmarkRate),
        status: 'ACTIVE',
        isImmutable: true,
        benchmarkDetails: {
          benchmarkRate: payload.benchmarkRate,
          masterRateCardRate: payload.benchmarkRate,
          historicalLowestRate: payload.benchmarkRate,
          aiConfidence: '95%',
          varianceVsRateCardPercent: 0,
        },
      };
      setSessionItems((prev) => [...prev, pseudoItem]);

      setSuccessNotice(
        formatString(strings.itemAddedSuccessTemplate, { code: savedCode })
      );

      // Clear line-item-specific inputs for next item
      setDesc('');
      setBenchmarkRate('');
      setDefaultQty('');
      setNotes('');
      logger.info('ui/AddStandardBOQItemModal', 'Item saved and ready for next item', {
        categoryId,
        code: savedCode,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save standard BOQ item';
      setValidationError(msg);
      logger.error('ui/AddStandardBOQItemModal', 'Error in save-and-add-another', { error: msg });
    }
  };

  const handleAddRow = (): void => {
    setMultiRows((prev) => [...prev, createBlankRow(subCategoryId)]);
  };

  const handleRemoveRow = (rowId: string): void => {
    if (multiRows.length <= 1) return;
    setMultiRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleRowChange = (rowId: string, field: keyof MultiRowEntry, val: string): void => {
    setMultiRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: val } : r))
    );
  };

  const handleSaveAllRows = (): void => {
    setValidationError(null);
    setSuccessNotice(null);

    const validInputs: AddStandardBOQItemInput[] = [];
    const errors: string[] = [];

    multiRows.forEach((row, idx) => {
      const rowNum = idx + 1;
      if (!row.desc.trim()) {
        errors.push(`Row ${rowNum}: Description is required`);
        return;
      }
      const rate = Number(row.benchmarkRate);
      if (!rate || rate <= 0) {
        errors.push(`Row ${rowNum}: Benchmark rate must be greater than 0`);
        return;
      }
      const qty = Number(row.defaultQty) || 1;

      validInputs.push({
        categoryId,
        subCategoryId: row.subCategoryId || subCategoryId || undefined,
        desc: row.desc.trim(),
        uom: row.uom.trim(),
        benchmarkRate: rate,
        defaultQty: qty,
      });
    });

    if (errors.length > 0) {
      setValidationError(errors.join('. '));
      return;
    }

    if (validInputs.length === 0) {
      setValidationError('No valid rows to save.');
      return;
    }

    try {
      if (onBatchAddItems) {
        onBatchAddItems(validInputs);
      } else {
        validInputs.forEach((inp) => onAddItem(inp));
      }
      logger.info('ui/AddStandardBOQItemModal', 'Saved multi-row standard BOQ items', {
        count: validInputs.length,
        categoryId,
      });
      handleClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save batch items';
      setValidationError(msg);
      logger.error('ui/AddStandardBOQItemModal', 'Error in saving multi-row items', { error: msg });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{strings.addItemModalTitle}</h3>
              <p className="text-xs text-slate-500">{strings.addItemModalSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={commonStrings.close}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher & Upload Quick Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setEntryMode('SINGLE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                entryMode === 'SINGLE'
                  ? 'bg-white text-sky-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{strings.singleRowModeTitle}</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('MULTI')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                entryMode === 'MULTI'
                  ? 'bg-white text-sky-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>{strings.multiRowModeTitle}</span>
            </button>
          </div>

          {onOpenUpload && (
            <button
              type="button"
              onClick={() => {
                handleClose();
                onOpenUpload();
              }}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg border border-sky-200 transition-colors flex items-center space-x-1.5 shrink-0 text-xs self-start sm:self-auto"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{strings.switchToUploadButton}</span>
            </button>
          )}
        </div>

        {/* Success Notice Banner */}
        {successNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
        )}

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Category & SubCategory Selectors (Shared) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label htmlFor="item-cat-select" className="block font-bold text-slate-700">
              {strings.tableColCategory} *
            </label>
            <select
              id="item-cat-select"
              required
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubCategoryId('');
              }}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-semibold"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.shortCode} – {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="item-subcat-select" className="block font-bold text-slate-700">
              {strings.tableColSubCategory}
            </label>
            <select
              id="item-subcat-select"
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
            >
              <option value="">-- No Sub-Category (General) --</option>
              {subCategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  [{sub.shortCode}] {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SINGLE ITEM MODE FORM */}
        {entryMode === 'SINGLE' && (
          <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
            {/* Live System Generated Code Banner */}
            <div className="p-3.5 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black text-sky-800 tracking-wider block">
                    {strings.generatedCodeLabel}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {strings.systemGeneratedNotice}
                  </span>
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-lg bg-white border border-sky-300 font-mono font-black text-sm text-sky-900 shadow-sm shrink-0">
                {liveSystemCode}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="item-desc-input" className="block font-bold text-slate-700">
                {strings.itemDescLabel} *
              </label>
              <textarea
                id="item-desc-input"
                required
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={strings.itemDescPlaceholder}
                className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="item-uom-select" className="block font-bold text-slate-700">
                  {strings.uomLabel} *
                </label>
                <select
                  id="item-uom-select"
                  required
                  value={uom}
                  onChange={(e) => setUom(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
                >
                  {STANDARD_UOM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="item-rate-input" className="block font-bold text-slate-700">
                  {strings.benchmarkRateLabel} *
                </label>
                <input
                  id="item-rate-input"
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  value={benchmarkRate}
                  onChange={(e) => setBenchmarkRate(e.target.value)}
                  placeholder={strings.benchmarkRatePlaceholder}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="item-qty-input" className="block font-bold text-slate-700">
                  {strings.defaultQtyLabel} *
                </label>
                <input
                  id="item-qty-input"
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  value={defaultQty}
                  onChange={(e) => setDefaultQty(e.target.value)}
                  placeholder={strings.defaultQtyPlaceholder}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="item-notes-input" className="block font-bold text-slate-700">
                {strings.notesLabel}
              </label>
              <input
                id="item-notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={strings.notesPlaceholder}
                className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{strings.immutableNotice}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                {commonStrings.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveAndAddAnother}
                className="px-4 py-2 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all"
              >
                {strings.submitAndAddAnotherButton}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                {strings.submitItemButton}
              </button>
            </div>
          </form>
        )}

        {/* MULTI-ROW LINE ITEMS MODE */}
        {entryMode === 'MULTI' && (
          <div className="space-y-4 text-xs">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    <th className="p-2.5 w-8 text-center">#</th>
                    <th className="p-2.5 min-w-[220px]">{strings.tableColDescription} *</th>
                    <th className="p-2.5 min-w-[130px]">{strings.tableColSubCategory}</th>
                    <th className="p-2.5 w-24">{strings.uomLabel} *</th>
                    <th className="p-2.5 w-28">{strings.tableColBenchmarkRate} *</th>
                    <th className="p-2.5 w-20">{strings.tableColDefaultQty}</th>
                    <th className="p-2.5 w-12 text-center">{strings.removeRowButton}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {multiRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-2 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          value={row.desc}
                          onChange={(e) => handleRowChange(row.id, 'desc', e.target.value)}
                          placeholder="Technical description & specs..."
                          className="w-full border border-slate-200 rounded-lg p-1.5 bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={row.subCategoryId}
                          onChange={(e) => handleRowChange(row.id, 'subCategoryId', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-1.5 bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none text-xs"
                        >
                          <option value="">-- General --</option>
                          {subCategories.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          value={row.uom}
                          onChange={(e) => handleRowChange(row.id, 'uom', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-1.5 bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none text-xs"
                        >
                          {STANDARD_UOM_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          required
                          min="0.01"
                          step="any"
                          value={row.benchmarkRate}
                          onChange={(e) => handleRowChange(row.id, 'benchmarkRate', e.target.value)}
                          placeholder="Rate (INR)"
                          className="w-full border border-slate-200 rounded-lg p-1.5 bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none font-mono text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={row.defaultQty}
                          onChange={(e) => handleRowChange(row.id, 'defaultQty', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-1.5 bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none font-mono text-xs"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          disabled={multiRows.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{strings.addAnotherRowButton}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  {commonStrings.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAllRows}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  {formatString(strings.saveAllRowsButtonTemplate, { count: multiRows.length })}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
