'use client';

import React, { useState, useMemo, useContext } from 'react';
import {
  CheckCircle2,
  Clock,
  FileCheck2,
  AlertCircle,
  Plus,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { UI_STRINGS, formatString } from '@/constants';
import { ProcurementContext } from '@/context/ProcurementContext';
import { logger } from '@/lib/logger';
import type {
  VendorProfileRateCardTabProps,
  RateCardAgreement,
  RateCardLineItem,
} from '@/types';

export const VendorProfileRateCardTab: React.FC<VendorProfileRateCardTabProps> = ({
  vendorId,
  vendorName,
  vendorCategory,
  isVendorPortal = false,
  onConfirmRateCard,
  onCounterOffer,
  onFinalizeRateCard,
  onAddStandardBOQItemToRateCard,
}) => {
  const context = useContext(ProcurementContext);
  const getCoverage = context?.getVendorCategoryRateCardCoverage;
  const allRateCards = useMemo(() => context?.rateCards || [], [context?.rateCards]);
  const sellerRespond = context?.sellerRespondRateCardProposal;
  const finalize = context?.finalizeRateCard;
  const addItem = context?.addItemToRateCard;

  const [counterRates, setCounterRates] = useState<Record<string, number>>({});
  const [signatoryName, setSignatoryName] = useState<string>(
    isVendorPortal ? `${vendorName} Authorized Rep` : 'Rahul Verma (Category Manager)'
  );
  const [declarationAccepted, setDeclarationAccepted] = useState<boolean>(true);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Compute coverage out of Standard BOQ of this category
  const coverage = useMemo(() => {
    if (getCoverage) {
      return getCoverage(vendorId, vendorCategory);
    }
    return {
      vendorId,
      vendorName,
      categoryCode: vendorCategory,
      categoryName: vendorCategory,
      totalStandardBOQItems: 6,
      coveredItemsCount: 6,
      coveragePct: 100,
      isFullyCovered: true,
      rateCardId: 'RC-2026-INT-001',
      rateCardStatus: 'FINALISED' as const,
      coveredItems: [],
      missingStandardBOQItems: [],
    };
  }, [getCoverage, vendorId, vendorCategory, vendorName]);

  // Find the matching rate card agreement
  const agreement: RateCardAgreement | undefined = useMemo(() => {
    return allRateCards.find(
      (rc) => rc.vendorId === vendorId || rc.id === coverage.rateCardId
    );
  }, [allRateCards, vendorId, coverage.rateCardId]);

  const handleRateChange = (itemCode: string, value: number): void => {
    setCounterRates((prev) => ({
      ...prev,
      [itemCode]: value,
    }));
  };

  const handleConfirmAcceptance = (): void => {
    if (!agreement) return;
    logger.info('components/VendorProfileRateCardTab', 'Rate card confirmed and accepted from vendor profile tab', {
      vendorId,
      agreementId: agreement.id,
      signatoryName,
    });

    if (onConfirmRateCard) {
      onConfirmRateCard(agreement.id);
    } else if (sellerRespond) {
      sellerRespond(agreement.id, 'ACCEPT');
    }

    setActionSuccessMessage(
      formatString(UI_STRINGS.rateCards.confirmedNoticeTemplate, {
        id: agreement.id,
        vendor: vendorName,
      })
    );
  };

  const handleSubmitCounter = (): void => {
    if (!agreement) return;
    logger.info('components/VendorProfileRateCardTab', 'Counter rates submitted from vendor profile tab', {
      vendorId,
      agreementId: agreement.id,
      ratesCount: Object.keys(counterRates).length,
    });

    if (onCounterOffer) {
      onCounterOffer(agreement.id, counterRates);
    } else if (sellerRespond) {
      sellerRespond(agreement.id, 'COUNTER', counterRates);
    }

    setActionSuccessMessage(`Counter-proposal with ${Object.keys(counterRates).length} adjusted rates submitted!`);
  };

  const handleFinalize = (): void => {
    if (!agreement) return;
    logger.info('components/VendorProfileRateCardTab', 'Agreement finalized by buyer from vendor profile tab', {
      vendorId,
      agreementId: agreement.id,
    });

    if (onFinalizeRateCard) {
      onFinalizeRateCard(agreement.id);
    } else if (finalize) {
      finalize(agreement.id);
    }

    setActionSuccessMessage(
      formatString(UI_STRINGS.rateCards.rateCardUpdatedSuccessTemplate, {
        id: agreement.id,
      })
    );
  };

  const handleAddMissingItem = (item: { code: string; desc: string; uom: string; benchmarkRate: number }): void => {
    const input = {
      vendorId,
      categoryCode: coverage.categoryCode,
      itemCode: item.code,
      desc: item.desc,
      uom: item.uom,
      agreedRate: item.benchmarkRate,
      notes: 'Added from Vendor Profile Standard BOQ Empanelment',
    };

    if (onAddStandardBOQItemToRateCard) {
      onAddStandardBOQItemToRateCard(input);
    } else if (addItem) {
      addItem(input);
    }

    setActionSuccessMessage(
      formatString(UI_STRINGS.rateCards.itemAddedToRateCardSuccessTemplate, {
        code: item.code,
        vendor: vendorName,
      })
    );
  };

  return (
    <div className="space-y-6">
      {actionSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-semibold animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Standard BOQ Coverage Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-brand-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full">
                {UI_STRINGS.rateCards.stdBOQCoverageTitle}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {coverage.categoryName}
              </span>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>{coverage.coveragePct}%</span>
              <span className="text-base font-semibold text-slate-300">
                Rate Card Coverage
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              {formatString(UI_STRINGS.rateCards.stdBOQCoverageDetailTemplate, {
                covered: coverage.coveredItemsCount,
                total: coverage.totalStandardBOQItems,
                category: coverage.categoryName,
                pct: coverage.coveragePct,
              })}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            {coverage.isFullyCovered ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold shadow-sm">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>100% Fast-Track PPO Ready</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold shadow-sm">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>{coverage.missingStandardBOQItems.length} Item(s) Remaining</span>
              </span>
            )}
            <span className="text-[11px] text-slate-400 font-mono">
              Ref: {agreement?.id || 'Pending Agreement'}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>Progress out of Standard BOQ Master</span>
            <span>{coverage.coveredItemsCount} of {coverage.totalStandardBOQItems} specifications</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                coverage.isFullyCovered ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
              style={{ width: `${coverage.coveragePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Agreement Metadata Schedule */}
      {agreement && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-500">Agreement Status</p>
            <p className="text-xs font-black text-slate-900 mt-1 flex items-center space-x-1">
              {agreement.status === 'FINALISED' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
              {agreement.status === 'PROPOSAL_SENT' && <Clock className="w-4 h-4 text-amber-600" />}
              {agreement.status === 'COUNTER_OFFERED' && <TrendingDown className="w-4 h-4 text-purple-600" />}
              <span>{agreement.status}</span>
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-500">Contract Validity</p>
            <p className="text-xs font-bold text-slate-800 mt-1">
              {agreement.effectiveDate} to {agreement.expiryDate}
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-500">Payment Terms</p>
            <p className="text-xs font-bold text-slate-800 mt-1 truncate" title={agreement.paymentTerms}>
              {agreement.paymentTerms || '30 Days Net Credit'}
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-500">SLA Lead Time</p>
            <p className="text-xs font-bold text-slate-800 mt-1">
              {agreement.leadTimeDays || 12} Working Days
            </p>
          </div>
        </div>
      )}

      {/* 3. Rate Card Reference Line Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCheck2 className="w-4 h-4 text-brand-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              {UI_STRINGS.rateCards.rateCardReferenceTitle}
            </h4>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {agreement?.items.length || 0} Rate Card Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 text-[11px] font-black uppercase text-slate-600">
                <th className="py-3 px-4">Item Code & Specification</th>
                <th className="py-3 px-3">UOM</th>
                <th className="py-3 px-3 text-right">AI Should-Cost</th>
                <th className="py-3 px-3 text-right">Recent Best RC</th>
                <th className="py-3 px-3 text-right">Last PPO Rate</th>
                <th className="py-3 px-3 text-right">Proposed Rate</th>
                <th className="py-3 px-4 text-right">
                  {agreement?.status === 'FINALISED' ? 'Ratified Rate' : 'Counter Rate'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(agreement?.items || []).map((item: RateCardLineItem) => (
                <tr key={item.itemCode} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.itemCode}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{item.desc}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-600">{item.uom}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    ₹{item.aiShouldCost.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500">
                    {item.recentBestRate ? `₹${item.recentBestRate.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500">
                    {item.lastPpoRate ? `₹${item.lastPpoRate.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700">
                    ₹{item.proposedRate.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {agreement?.status === 'FINALISED' ? (
                      <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                        ₹{item.finalAgreedRate.toLocaleString()}
                      </span>
                    ) : (
                      <input
                        type="number"
                        value={counterRates[item.itemCode] ?? item.sellerCounterRate ?? item.finalAgreedRate}
                        onChange={(e) => handleRateChange(item.itemCode, Number(e.target.value))}
                        className="w-24 px-2 py-1 text-right text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Rate Card Acceptance & Confirmation Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
            {UI_STRINGS.rateCards.rateCardAcceptanceTitle}
          </h4>
        </div>

        {agreement?.status === 'FINALISED' ? (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-600 text-white rounded-full">
                {UI_STRINGS.rateCards.confirmedBadge}
              </span>
              <p className="text-xs font-bold text-emerald-950 mt-1">
                {formatString(UI_STRINGS.rateCards.confirmedNoticeTemplate, {
                  id: agreement.id,
                  vendor: vendorName,
                })}
              </p>
              <p className="text-[11px] text-emerald-700">
                Ratified by {agreement.updatedBy} on {agreement.lastUpdated}. Valid until {agreement.expiryDate}.
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold shadow-xs">
                Seal: ACTIVE_RATIFIED_2026
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800 leading-relaxed">
                {UI_STRINGS.rateCards.acceptanceDeclaration}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {UI_STRINGS.rateCards.signatoryNameLabel}
                </label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="e.g. Authorized Signatory Name"
                />
              </div>
              <div className="flex items-end space-x-2">
                <button
                  type="button"
                  disabled={!declarationAccepted}
                  onClick={handleConfirmAcceptance}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{UI_STRINGS.rateCards.confirmRateCardButton}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitCounter}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>{UI_STRINGS.rateCards.submitCounterOfferButton}</span>
                </button>

                {!isVendorPortal && (
                  <button
                    type="button"
                    onClick={handleFinalize}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{UI_STRINGS.rateCards.finalizeRateCardButton}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Missing Standard BOQ Items in Category (Empanelment Section) */}
      {coverage.missingStandardBOQItems.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-950">
                  {UI_STRINGS.rateCards.missingBOQItemsTitle} ({coverage.missingStandardBOQItems.length})
                </h4>
              </div>
              <p className="text-xs text-amber-800">
                {UI_STRINGS.rateCards.missingBOQItemsSubtitle}
              </p>
            </div>
          </div>

          <div className="divide-y divide-amber-200/70 border border-amber-200 rounded-xl bg-white overflow-hidden">
            {coverage.missingStandardBOQItems.map((missing) => (
              <div
                key={missing.code}
                className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50/40 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{missing.code}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-semibold">
                      {missing.uom}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{missing.desc}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Std Benchmark</span>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      ₹{missing.benchmarkRate.toLocaleString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddMissingItem(missing)}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{UI_STRINGS.rateCards.addBOQItemToRateCardButton}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
