'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle2,
  Building2,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { useProcurement } from '@/context/ProcurementContext';
import type { CreateRateCardProposalViewProps } from '@/types';
import { UI_STRINGS } from '@/constants';
import { logger } from '@/lib/logger';

interface LineItemFormState {
  itemCode: string;
  desc: string;
  uom: string;
  aiShouldCost: number;
  recentBestRate?: number;
  lastPpoRate?: number;
  proposedRate: number;
  notes?: string;
}

export const CreateRateCardProposalView: React.FC<CreateRateCardProposalViewProps> = ({
  onProposalCreated,
  onCancel,
}) => {
  const {
    projectCategories,
    managedVendors,
    createRateCardProposal,
    getLinePricingReferences,
  } = useProcurement();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    projectCategories[0]?.id ?? 'CIVIL'
  );

  const selectedCategory = useMemo(() => {
    return projectCategories.find((c) => c.id === selectedCategoryId) ?? projectCategories[0];
  }, [projectCategories, selectedCategoryId]);

  const [selectedVendorId, setSelectedVendorId] = useState<string>(
    managedVendors[0]?.id ?? 'VND-001'
  );

  const selectedVendor = useMemo(() => {
    return managedVendors.find((v) => v.id === selectedVendorId) ?? managedVendors[0];
  }, [managedVendors, selectedVendorId]);

  const [itemsState, setItemsState] = useState<LineItemFormState[]>(() => {
    if (!selectedCategory) return [];
    return selectedCategory.items.map((item) => {
      const refs = getLinePricingReferences(item.code);
      const initialProposed = refs.lastPpoRate ?? refs.aiCost;
      return {
        itemCode: item.code,
        desc: item.desc,
        uom: item.uom,
        aiShouldCost: refs.aiCost,
        recentBestRate: refs.recentBestRate,
        lastPpoRate: refs.lastPpoRate,
        proposedRate: initialProposed,
      };
    });
  });

  const [paymentTerms, setPaymentTerms] = useState<string>('30 Days Net from RA Bill Certification');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(14);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Sync items when category changes
  const handleCategoryChange = (catId: string): void => {
    setSelectedCategoryId(catId);
    const cat = projectCategories.find((c) => c.id === catId);
    if (!cat) return;

    const newItems: LineItemFormState[] = cat.items.map((item) => {
      const refs = getLinePricingReferences(item.code);
      const initialProposed = refs.lastPpoRate ?? refs.aiCost;
      return {
        itemCode: item.code,
        desc: item.desc,
        uom: item.uom,
        aiShouldCost: refs.aiCost,
        recentBestRate: refs.recentBestRate,
        lastPpoRate: refs.lastPpoRate,
        proposedRate: initialProposed,
      };
    });
    setItemsState(newItems);
  };

  const handleRateChange = (index: number, val: number): void => {
    setItemsState((prev) => {
      const next = [...prev];
      next[index].proposedRate = val;
      return next;
    });
  };

  const handleAdoptAiCost = (index: number): void => {
    setItemsState((prev) => {
      const next = [...prev];
      next[index].proposedRate = next[index].aiShouldCost;
      return next;
    });
  };

  const handleUseLastPpo = (index: number): void => {
    setItemsState((prev) => {
      const next = [...prev];
      const ppoVal = next[index].lastPpoRate;
      if (typeof ppoVal === 'number') {
        next[index].proposedRate = ppoVal;
      }
      return next;
    });
  };

  const handleAdoptAllAiCost = (): void => {
    setItemsState((prev) =>
      prev.map((item) => ({
        ...item,
        proposedRate: item.aiShouldCost,
      }))
    );
  };

  const handleAdoptAllLastPpo = (): void => {
    setItemsState((prev) =>
      prev.map((item) => ({
        ...item,
        proposedRate: item.lastPpoRate ?? item.aiShouldCost,
      }))
    );
  };

  const handleApplyDiscount = (pct: number): void => {
    setItemsState((prev) =>
      prev.map((item) => ({
        ...item,
        proposedRate: Math.round(item.aiShouldCost * (1 - pct / 100)),
      }))
    );
  };

  const handleSubmitProposal = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!selectedVendor || !selectedCategory) return;

    try {
      const agreement = createRateCardProposal({
        vendorId: selectedVendor.id,
        vendorName: selectedVendor.name,
        categoryCode: selectedCategory.id,
        categoryName: selectedCategory.name,
        items: itemsState.map((i) => ({
          itemCode: i.itemCode,
          desc: i.desc,
          uom: i.uom,
          aiShouldCost: i.aiShouldCost,
          recentBestRate: i.recentBestRate,
          lastPpoRate: i.lastPpoRate,
          proposedRate: i.proposedRate,
          notes: i.notes,
        })),
        paymentTerms,
        leadTimeDays,
      });

      logger.info('api/rate-cards', 'Submitted Rate Card Proposal', {
        proposalId: agreement.id,
        vendor: selectedVendor.name,
        itemsCount: itemsState.length,
      });

      setSuccessNotice(`Proposal ${agreement.id} generated and sent to ${selectedVendor.name}!`);

      if (onProposalCreated) {
        setTimeout(() => {
          onProposalCreated(agreement.id);
        }, 800);
      }
    } catch (err) {
      logger.error('api/rate-cards', 'Failed to create rate card proposal', { error: String(err) });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Description Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                {UI_STRINGS.rateCards.badge}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Standard BOQ Sourcing Protocol
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {UI_STRINGS.rateCards.createProposalTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Construct an official rate card proposal utilizing AI should-cost analysis,
              recent best contract rates, and historical PPO prices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmitProposal}
              className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              {UI_STRINGS.rateCards.submitProposalButton}
            </button>
          </div>
        </div>

        {/* Form Selectors: Category & Vendor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-600" />
              {UI_STRINGS.rateCards.selectCategoryLabel}
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
            >
              {projectCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.items.length} Standard BOQ Items)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              {UI_STRINGS.rateCards.selectVendorLabel}
            </label>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
            >
              {managedVendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name} — ({(vendor.categories || [vendor.category || 'General']).join(', ')})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Presets & Intelligent Tools Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-200">Rate Optimization Presets:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAdoptAllLastPpo}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 font-semibold transition-colors flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Prefer Last PPO Rates
          </button>
          <button
            type="button"
            onClick={handleAdoptAllAiCost}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 font-semibold transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Adopt AI Should-Cost
          </button>
          <button
            type="button"
            onClick={() => handleApplyDiscount(5)}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 font-semibold transition-colors flex items-center gap-1"
          >
            <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
            -5% Competitive Benchmark
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Line Items Pricing Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <th className="py-3 px-4">Item Code</th>
              <th className="py-3 px-4">Standard BOQ Scope Description</th>
              <th className="py-3 px-3 text-center">UOM</th>
              <th className="py-3 px-3 text-right bg-indigo-50/50 text-indigo-900 border-x border-indigo-100">
                {UI_STRINGS.rateCards.aiCostHeader}
              </th>
              <th className="py-3 px-3 text-right bg-blue-50/40 text-blue-900 border-r border-blue-100">
                {UI_STRINGS.rateCards.recentBestRateHeader}
              </th>
              <th className="py-3 px-3 text-right bg-emerald-50/40 text-emerald-900 border-r border-emerald-100">
                {UI_STRINGS.rateCards.lastPpoRateHeader}
              </th>
              <th className="py-3 px-4 text-center bg-brand-50/50 text-brand-900 font-bold border-r border-brand-100 min-w-[160px]">
                {UI_STRINGS.rateCards.proposedRateHeader}
              </th>
              <th className="py-3 px-4 text-center">Benchmark Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {itemsState.map((item, idx) => (
              <tr key={item.itemCode} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                  {item.itemCode}
                </td>
                <td className="py-3 px-4 font-medium text-slate-700 max-w-sm">
                  {item.desc}
                </td>
                <td className="py-3 px-3 text-center font-semibold text-slate-500 whitespace-nowrap">
                  {item.uom}
                </td>
                <td className="py-3 px-3 text-right font-semibold text-indigo-700 bg-indigo-50/20 border-x border-indigo-100">
                  ₹{item.aiShouldCost.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-3 text-right font-medium text-blue-700 bg-blue-50/20 border-r border-blue-100">
                  {item.recentBestRate ? `₹${item.recentBestRate.toLocaleString('en-IN')}` : '—'}
                </td>
                <td className="py-3 px-3 text-right font-medium text-emerald-700 bg-emerald-50/20 border-r border-emerald-100">
                  {item.lastPpoRate ? (
                    <span className="font-bold text-emerald-800">
                      ₹{item.lastPpoRate.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">N/A</span>
                  )}
                </td>
                <td className="py-2.5 px-3 bg-brand-50/20 border-r border-brand-100">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={item.proposedRate}
                      onChange={(e) => handleRateChange(idx, Number(e.target.value) || 0)}
                      className="w-full pl-6 pr-3 py-1.5 text-xs font-bold text-slate-900 bg-white border border-brand-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-right"
                    />
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
                    {item.lastPpoRate ? (
                      <button
                        type="button"
                        onClick={() => handleUseLastPpo(idx)}
                        title="Adopt Last PPO Issued Price"
                        className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                      >
                        {UI_STRINGS.rateCards.applyLastPpoRateButton}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleAdoptAiCost(idx)}
                      title="Adopt AI Should-Cost Price"
                      className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors"
                    >
                      {UI_STRINGS.rateCards.adoptAiCostButton}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Commercial Terms & Submission Footer */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
          Contractual Commitments & Validity SLA
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Payment Terms
            </label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Lead Time Guarantee (Days)
            </label>
            <input
              type="number"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(Number(e.target.value) || 14)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-brand-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSubmitProposal}
            className="px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            {UI_STRINGS.rateCards.submitProposalButton}
          </button>
        </div>
      </div>
    </div>
  );
};
