'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Send,
  Save,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Check,
} from 'lucide-react';
import { UI_STRINGS, formatString } from '@/constants';
import { calculateCatalogueVariance } from '@/lib/vendor-catalogue-pricing';
import type {
  ManagedVendor,
  BudgetCategory,
  VendorCatalogueItemPrice,
} from '@/types';

interface VendorCataloguePricingTabProps {
  vendor: ManagedVendor;
  projectCategories: BudgetCategory[];
  onSaveCataloguePrices: (
    vendorId: string,
    prices: Record<string, VendorCatalogueItemPrice>
  ) => void;
  onOpenIntimationModal?: () => void;
  onUpdateCategories?: (vendorId: string, categories: string[]) => void;
}

interface BOQRowItem {
  code: string;
  desc: string;
  categoryName: string;
  subCategory?: string;
  uom: string;
  benchmarkRate: number;
}

export const VendorCataloguePricingTab: React.FC<VendorCataloguePricingTabProps> = ({
  vendor,
  projectCategories,
  onSaveCataloguePrices,
  onOpenIntimationModal,
  onUpdateCategories,
}) => {
  // Assigned categories for vendor
  const assignedCategories = useMemo(() => {
    if (vendor.categories && vendor.categories.length > 0) {
      return vendor.categories;
    }
    return vendor.category ? [vendor.category] : [];
  }, [vendor]);

  // Active category filter tab (or 'ALL')
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  // Local prices draft state initialized from existing cataloguePrices
  const [pricesDraft, setPricesDraft] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (vendor.cataloguePrices) {
      Object.entries(vendor.cataloguePrices).forEach(([code, p]) => {
        initial[code] = p.vendorPrice;
      });
    }
    return initial;
  });

  const [notesDraft, setNotesDraft] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (vendor.cataloguePrices) {
      Object.entries(vendor.cataloguePrices).forEach(([code, p]) => {
        if (p.notes) initial[code] = p.notes;
      });
    }
    return initial;
  });

  const [savedSuccessNotice, setSavedSuccessNotice] = useState<boolean>(false);
  const [isEditingCategories, setIsEditingCategories] = useState<boolean>(false);
  const [categoryDraft, setCategoryDraft] = useState<string[]>(assignedCategories);

  // Flatten standard BOQ items for assigned categories
  const relevantBOQItems: BOQRowItem[] = useMemo(() => {
    const items: BOQRowItem[] = [];
    projectCategories.forEach((cat) => {
      const isAssigned = assignedCategories.some(
        (ac) => ac.toLowerCase().trim() === cat.name.toLowerCase().trim()
      );
      if (!isAssigned) return;

      cat.items.forEach((item) => {
        items.push({
          code: item.code,
          desc: item.desc,
          categoryName: cat.name,
          subCategory: undefined,
          uom: item.uom,
          benchmarkRate: item.benchmarkRate || item.calculatedCost || 1000,
        });
      });
    });
    return items;
  }, [projectCategories, assignedCategories]);

  // Filtered rows by selected category tab
  const displayedBOQItems = useMemo(() => {
    if (activeCategoryFilter === 'ALL') return relevantBOQItems;
    return relevantBOQItems.filter(
      (item) => item.categoryName.toLowerCase() === activeCategoryFilter.toLowerCase()
    );
  }, [relevantBOQItems, activeCategoryFilter]);

  const handlePriceChange = (code: string, val: string): void => {
    const num = Number(val);
    setPricesDraft((prev) => ({
      ...prev,
      [code]: isNaN(num) ? 0 : num,
    }));
    setSavedSuccessNotice(false);
  };

  const handleNotesChange = (code: string, val: string): void => {
    setNotesDraft((prev) => ({
      ...prev,
      [code]: val,
    }));
  };

  const handleSaveAll = (): void => {
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedPrices: Record<string, VendorCatalogueItemPrice> = {};

    relevantBOQItems.forEach((item) => {
      const price = pricesDraft[item.code] ?? 0;
      if (price > 0) {
        const variance = calculateCatalogueVariance(price, item.benchmarkRate);
        updatedPrices[item.code] = {
          itemCode: item.code,
          itemDesc: item.desc,
          category: item.categoryName,
          subCategory: item.subCategory,
          uom: item.uom,
          masterBenchmarkRate: item.benchmarkRate,
          vendorPrice: price,
          variancePercent: variance,
          submittedAt: nowIso,
          updatedBy: 'Vendor Directory Command',
          notes: notesDraft[item.code],
        };
      }
    });

    onSaveCataloguePrices(vendor.id, updatedPrices);
    setSavedSuccessNotice(true);
  };

  const handleSaveCategories = (): void => {
    if (onUpdateCategories && categoryDraft.length > 0) {
      onUpdateCategories(vendor.id, categoryDraft);
    }
    setIsEditingCategories(false);
  };

  const toggleCategoryDraft = (catName: string): void => {
    setCategoryDraft((prev) => {
      if (prev.includes(catName)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== catName);
      }
      return [...prev, catName];
    });
  };

  const catalogueStatus = vendor.catalogueStatus;
  const committedCount = Object.keys(pricesDraft).filter((k) => (pricesDraft[k] || 0) > 0).length;

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner & Actions */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              One-Time Baseline Rate Card
            </span>
            {catalogueStatus?.hasSubmittedPrices ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {UI_STRINGS.vendorManagement.intimationStatusSubmitted}
              </span>
            ) : catalogueStatus?.intimationSent ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatString(UI_STRINGS.vendorManagement.intimationStatusSentTemplate, {
                  date: catalogueStatus.intimationSentAt || 'Recent',
                  days: catalogueStatus.intimationDaysAllowed || 14,
                })}
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {UI_STRINGS.vendorManagement.intimationStatusPending}
              </span>
            )}
          </div>
          <h3 className="text-xl font-black text-white">
            {UI_STRINGS.vendorManagement.tabCataloguePricing}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {UI_STRINGS.vendorManagement.tabCataloguePricingSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onOpenIntimationModal && (
            <button
              type="button"
              onClick={onOpenIntimationModal}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{UI_STRINGS.vendorManagement.sendIntimationButton}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveAll}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{UI_STRINGS.vendorManagement.cataloguePricingSaveButton}</span>
          </button>
        </div>
      </div>

      {/* Dual Assurance Cards: Strict RFQ Isolation & AI Costing Anchor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RFQ Isolation Guarantee */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-emerald-950 text-xs">
              {UI_STRINGS.vendorManagement.rfqIsolationNotice}
            </h4>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              {UI_STRINGS.vendorManagement.rfqIsolationDescription}
            </p>
          </div>
        </div>

        {/* AI Costing Integration */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-start space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-purple-950 text-xs">
              Empirical AI Costing Baseline
            </h4>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              {UI_STRINGS.vendorManagement.aiCostingNotice}
            </p>
          </div>
        </div>
      </div>

      {/* Success Notice Banner */}
      {savedSuccessNotice && (
        <div className="p-3.5 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center space-x-2.5 text-emerald-900 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{UI_STRINGS.vendorManagement.cataloguePricingSavedNotice}</span>
        </div>
      )}

      {/* Assigned Categories Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <span className="font-black text-slate-800 text-xs">
              Assigned Categories ({assignedCategories.length})
            </span>
            <span className="text-[10px] text-slate-500">
              • {relevantBOQItems.length} Standard BOQ Line Items Available
            </span>
          </div>

          {onUpdateCategories && (
            <button
              type="button"
              onClick={() => setIsEditingCategories(!isEditingCategories)}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline"
            >
              {isEditingCategories ? 'Cancel Category Edit' : 'Edit Assigned Categories'}
            </button>
          )}
        </div>

        {isEditingCategories ? (
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3">
            <p className="text-[11px] text-slate-600 font-medium">
              Select all procurement categories where {vendor.name} is approved to operate:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {projectCategories.map((cat) => {
                const isSelected = categoryDraft.includes(cat.name);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategoryDraft(cat.name)}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate pr-1 text-[11px]">{cat.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveCategories}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs"
              >
                Apply Category Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('ALL')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                activeCategoryFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Categories ({relevantBOQItems.length})
            </button>
            {assignedCategories.map((cat) => {
              const catItemCount = relevantBOQItems.filter(
                (i) => i.categoryName.toLowerCase() === cat.toLowerCase()
              ).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all ${
                    activeCategoryFilter.toLowerCase() === cat.toLowerCase()
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat} ({catItemCount})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Standard BOQ Pricing Table */}
      {displayedBOQItems.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <h4 className="font-black text-slate-800 text-sm">No Standard BOQ Items Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {UI_STRINGS.vendorManagement.noStandardBOQForCategories}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-blue-50/80 border-b-2 border-blue-200 text-blue-950 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3.5">{UI_STRINGS.vendorManagement.colItemCode}</th>
                  <th className="py-3 px-3.5">{UI_STRINGS.vendorManagement.colItemDescription}</th>
                  <th className="py-3 px-3.5">{UI_STRINGS.vendorManagement.colCategory}</th>
                  <th className="py-3 px-2 text-center">{UI_STRINGS.vendorManagement.colUOM}</th>
                  <th className="py-3 px-3.5 text-right">{UI_STRINGS.vendorManagement.colBenchmarkRate}</th>
                  <th className="py-3 px-3.5 text-right">{UI_STRINGS.vendorManagement.colVendorRate}</th>
                  <th className="py-3 px-3.5 text-center">{UI_STRINGS.vendorManagement.colVariance}</th>
                  <th className="py-3 px-3 text-center">{UI_STRINGS.vendorManagement.colStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {displayedBOQItems.map((item) => {
                  const vendorRate = pricesDraft[item.code] ?? 0;
                  const hasPrice = vendorRate > 0;
                  const variance = calculateCatalogueVariance(vendorRate, item.benchmarkRate);

                  return (
                    <tr key={item.code} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-black text-indigo-700">
                        {item.code}
                      </td>
                      <td className="py-3 px-3.5 font-medium text-slate-800 max-w-sm">
                        <div>{item.desc}</div>
                        {item.subCategory && (
                          <span className="text-[10px] text-slate-500">{item.subCategory}</span>
                        )}
                        <input
                          type="text"
                          value={notesDraft[item.code] || ''}
                          onChange={(e) => handleNotesChange(item.code, e.target.value)}
                          placeholder="Optional rate note / grade..."
                          className="w-full text-[10px] text-slate-500 border-0 border-b border-transparent hover:border-slate-300 focus:border-indigo-400 bg-transparent px-0 py-0.5 mt-0.5 focus:ring-0"
                        />
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-slate-600">
                        {item.categoryName}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">
                        {item.uom}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                        ₹{item.benchmarkRate.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="inline-flex items-center space-x-1 justify-end">
                          <span className="text-slate-400 font-semibold">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={vendorRate === 0 ? '' : vendorRate}
                            onChange={(e) => handlePriceChange(item.code, e.target.value)}
                            placeholder="0"
                            className="w-28 text-right font-mono font-bold border rounded-xl px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border-slate-300 text-slate-900"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-center font-mono font-black">
                        {!hasPrice ? (
                          <span className="text-slate-300 font-normal">-</span>
                        ) : variance === 0 ? (
                          <span className="text-slate-600 font-bold">0.0%</span>
                        ) : variance > 0 ? (
                          <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            +{variance}%
                          </span>
                        ) : (
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {variance}%
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {hasPrice ? (
                          <span className="inline-flex items-center text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Committed
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600">
            <span className="font-semibold text-xs">
              {committedCount} of {relevantBOQItems.length} baseline catalogue rates specified
            </span>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow transition-all flex items-center space-x-2 cursor-pointer text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{UI_STRINGS.vendorManagement.cataloguePricingSaveButton}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
