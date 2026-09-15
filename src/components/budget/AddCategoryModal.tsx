'use client';

import React, { useState, useEffect } from 'react';
import { X, FolderPlus, AlertCircle, Plus, Trash2, Layers } from 'lucide-react';
import type { AddCategoryModalProps, AddCategoryInput } from '@/types';
import { UI_STRINGS, ADD_CATEGORY_SCHEMA } from '@/constants';
import { validateSchema } from '@/lib/validator';
import { logger } from '@/lib/logger';

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
  existingCategories = [],
  initialMajorCategory,
}) => {
  const strings = UI_STRINGS.categoryStandardBOQMaster;
  const commonStrings = UI_STRINGS.common;

  const [majorCategoryName, setMajorCategoryName] = useState<string>(initialMajorCategory || '');
  const [minorCategories, setMinorCategories] = useState<string[]>(['']);
  const [costCenter, setCostCenter] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [baselineBudget, setBaselineBudget] = useState<string>('0');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialMajorCategory) {
      setMajorCategoryName(initialMajorCategory);
    }
  }, [initialMajorCategory]);

  if (!isOpen) return null;

  const handleClose = (): void => {
    setMajorCategoryName('');
    setMinorCategories(['']);
    setCostCenter('');
    setDescription('');
    setBaselineBudget('0');
    setValidationError(null);
    onClose();
  };

  const handleAddMinorCategory = (): void => {
    setMinorCategories((prev) => [...prev, '']);
  };

  const handleRemoveMinorCategory = (index: number): void => {
    if (minorCategories.length <= 1) return;
    setMinorCategories((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMinorCategoryChange = (index: number, val: string): void => {
    setMinorCategories((prev) => prev.map((item, idx) => (idx === index ? val : item)));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setValidationError(null);

    const majorName = majorCategoryName.trim();
    const validMinors = minorCategories
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    const parsedBudget = Number(baselineBudget) || 0;
    const payload: AddCategoryInput = {
      name: majorName,
      majorCategory: majorName,
      subCategory: validMinors[0] || undefined,
      subCategories: validMinors.length > 0 ? validMinors : undefined,
      costCenter: costCenter.trim() || undefined,
      description: description.trim() || undefined,
      baselineBudget: parsedBudget,
    };

    const result = validateSchema(payload, ADD_CATEGORY_SCHEMA);
    if (!result.isValid) {
      const errorMsg = result.errors.map((err) => err.message).join('. ');
      setValidationError(errorMsg);
      logger.warn('ui/AddCategoryModal', 'Validation failed for new category', { errors: result.errors });
      return;
    }

    try {
      onAddCategory(payload);
      logger.info('ui/AddCategoryModal', 'Category submitted successfully from modal', {
        majorName,
        minorsCount: validMinors.length,
      });
      handleClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save category';
      setValidationError(msg);
      logger.error('ui/AddCategoryModal', 'Error submitting category', { error: msg });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{strings.addCategoryModalTitle}</h3>
              <p className="text-xs text-slate-500">{strings.addCategoryModalSubtitle}</p>
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

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Major Category Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="cat-major-input" className="block font-bold text-slate-700">
                {strings.majorCategoryLabel} *
              </label>
              {existingCategories.length > 0 && (
                <select
                  aria-label={strings.majorCategoryLabel}
                  value={existingCategories.some((c) => c.name === majorCategoryName) ? majorCategoryName : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setMajorCategoryName(e.target.value);
                    }
                  }}
                  className="text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg px-2 py-0.5"
                >
                  <option value="">{strings.majorCategorySelectPlaceholder}</option>
                  {existingCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <input
              id="cat-major-input"
              type="text"
              required
              value={majorCategoryName}
              onChange={(e) => setMajorCategoryName(e.target.value)}
              placeholder={strings.categoryNamePlaceholder}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-semibold"
            />
          </div>

          {/* Minor Categories (Sub-Categories) Dynamic Multi-Row */}
          <div className="space-y-2 p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>{strings.minorCategoriesTitle}</span>
              </label>
              <button
                type="button"
                onClick={handleAddMinorCategory}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>{strings.addMinorCategoryButton}</span>
              </button>
            </div>

            <div className="space-y-2">
              {minorCategories.map((minor, idx) => (
                <div key={`minor-${idx}`} className="flex items-center space-x-2">
                  <input
                    id={idx === 0 ? 'cat-sub-input' : undefined}
                    type="text"
                    value={minor}
                    onChange={(e) => handleMinorCategoryChange(idx, e.target.value)}
                    placeholder={idx === 0 ? strings.subCategoryPlaceholder : strings.minorCategoryPlaceholder}
                    aria-label={`${strings.minorCategoryLabel} ${idx + 1}`}
                    className="flex-1 border border-slate-200 rounded-xl p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-medium"
                  />
                  {minorCategories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMinorCategory(idx)}
                      aria-label={strings.removeMinorCategoryButton}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="cat-costcenter-input" className="block font-bold text-slate-700">
                {strings.costCenterLabel}
              </label>
              <input
                id="cat-costcenter-input"
                type="text"
                value={costCenter}
                onChange={(e) => setCostCenter(e.target.value)}
                placeholder={strings.costCenterPlaceholder}
                className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cat-baseline-input" className="block font-bold text-slate-700">
                {strings.baselineBudgetLabel}
              </label>
              <input
                id="cat-baseline-input"
                type="number"
                min="0"
                step="1000"
                value={baselineBudget}
                onChange={(e) => setBaselineBudget(e.target.value)}
                placeholder={strings.baselineBudgetPlaceholder}
                className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cat-desc-input" className="block font-bold text-slate-700">
              {strings.categoryDescLabel}
            </label>
            <textarea
              id="cat-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={strings.categoryDescPlaceholder}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {commonStrings.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {strings.submitCategoryButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
