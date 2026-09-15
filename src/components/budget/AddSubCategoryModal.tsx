'use client';

import React, { useState, useEffect } from 'react';
import { X, Layers, AlertCircle } from 'lucide-react';
import type { AddSubCategoryModalProps } from '@/types';
import { UI_STRINGS, ADD_SUBCATEGORY_SCHEMA } from '@/constants';
import { validateSchema } from '@/lib/validator';
import { logger } from '@/lib/logger';

export const AddSubCategoryModal: React.FC<AddSubCategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialCategoryId,
  onAddSubCategory,
}) => {
  const strings = UI_STRINGS.categoryStandardBOQMaster;
  const commonStrings = UI_STRINGS.common;

  const [categoryId, setCategoryId] = useState<string>(initialCategoryId || (categories[0]?.id ?? ''));
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setValidationError(null);

    const payload = {
      categoryId,
      name: name.trim(),
      description: description.trim() || undefined,
    };

    const result = validateSchema(payload, ADD_SUBCATEGORY_SCHEMA);
    if (!result.isValid) {
      const errorMsg = result.errors.map((err) => err.message).join('. ');
      setValidationError(errorMsg);
      logger.warn('ui/AddSubCategoryModal', 'Validation failed for new subcategory', { errors: result.errors });
      return;
    }

    try {
      onAddSubCategory(payload);
      logger.info('ui/AddSubCategoryModal', 'Sub-category submitted successfully', {
        categoryId,
        name: payload.name,
      });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save subcategory';
      setValidationError(msg);
      logger.error('ui/AddSubCategoryModal', 'Error submitting subcategory', { error: msg });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{strings.addSubCategoryModalTitle}</h3>
              <p className="text-xs text-slate-500">{strings.addSubCategoryModalSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
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
          <div className="space-y-1.5">
            <label htmlFor="subcat-parent-select" className="block font-bold text-slate-700">
              {strings.selectCategoryLabel} *
            </label>
            <select
              id="subcat-parent-select"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-semibold"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.shortCode} – {cat.name} ({cat.costCenter})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="subcat-name-input" className="block font-bold text-slate-700">
              {strings.subCategoryNameLabel} *
            </label>
            <input
              id="subcat-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={strings.subCategoryNamePlaceholder}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="subcat-desc-input" className="block font-bold text-slate-700">
              {strings.subCategoryDescLabel}
            </label>
            <textarea
              id="subcat-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={strings.subCategoryDescPlaceholder}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {commonStrings.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {strings.submitSubCategoryButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
