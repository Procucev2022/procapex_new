'use client';

import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import type { VendorQuotationSummaryTabProps } from '@/types';
import { UI_STRINGS } from '@/constants';
import { VendorMultiRoundQuoteTable } from './VendorMultiRoundQuoteTable';
import { VendorQuotedTermsForm } from './VendorQuotedTermsForm';

export const VendorQuotationSummaryTab: React.FC<VendorQuotationSummaryTabProps> = ({
  items,
  onRate1Change,
  onRate2Change,
  onRate3Change,
  quote1Submitted,
  quote2Submitted,
  quote3Submitted,
  onSubmitQuote1,
  onSubmitQuote2,
  onSubmitQuote3,
  terms,
  onUpdateTerms,
  activeRound: propActiveRound,
  onSelectRound,
}) => {
  const [internalRound, setInternalRound] = useState<1 | 2 | 3 | 'all'>(() => {
    if (quote2Submitted) return 3;
    if (quote1Submitted) return 2;
    return 1;
  });

  const activeRound = propActiveRound !== undefined ? propActiveRound : internalRound;
  const setRound = (r: 1 | 2 | 3 | 'all'): void => {
    if (onSelectRound) onSelectRound(r);
    setInternalRound(r);
  };

  const net1 = items.reduce((acc, it) => acc + it.qty * it.rate1, 0);
  const netBuyer1 = items.reduce((acc, it) => acc + it.qty * (it.buyerOffer1 || it.targetRate), 0);
  const net2 = items.reduce((acc, it) => acc + it.qty * it.rate2, 0);
  const net3 = items.reduce((acc, it) => acc + it.qty * (it.rate3 || it.rate2), 0);

  const totalSavings = net1 - (activeRound === 3 ? net3 : net2);
  const savingsPct = net1 > 0 ? (((net1 - (activeRound === 3 ? net3 : net2)) / net1) * 100).toFixed(1) : '0.0';

  const handleSubmitActiveRound = (): void => {
    if (activeRound === 1) onSubmitQuote1();
    else if (activeRound === 2) onSubmitQuote2();
    else onSubmitQuote3();
  };

  return (
    <div className="space-y-6 pt-4">
      {/* 1. ROUND STAGE SELECTOR & SUMMARY HEADER */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-purple-600" />
            <span>{UI_STRINGS.vendorPortal.tabQuotationSummary}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-round negotiation summary. Always the last two columns provide editable rates
            and auto-calculated amounts for the next quote.
          </p>
        </div>

        {/* Round Switcher Buttons */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-inner overflow-x-auto">
          <button
            type="button"
            onClick={() => setRound(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRound === 1 ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {UI_STRINGS.vendorPortal.round1Header} {quote1Submitted ? '✓' : ''}
          </button>
          <button
            type="button"
            onClick={() => setRound(2)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRound === 2 ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {UI_STRINGS.vendorPortal.round2Header} {quote2Submitted ? '✓' : ''}
          </button>
          <button
            type="button"
            onClick={() => setRound(3)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRound === 3 ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {UI_STRINGS.vendorPortal.round3Header} {quote3Submitted ? '✓' : ''}
          </button>
          <button
            type="button"
            onClick={() => setRound('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRound === 'all' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Rounds Matrix
          </button>
        </div>
      </div>

      {/* KPI Progression Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200">
          <span className="text-[10px] text-rose-700 font-bold uppercase block">1st Quote Sum:</span>
          <strong className="text-sm font-black font-mono text-rose-950">₹ {Math.round(net1).toLocaleString()}</strong>
        </div>
        <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-200">
          <span className="text-[10px] text-sky-700 font-bold uppercase block">Buyer Target:</span>
          <strong className="text-sm font-black font-mono text-sky-950">₹ {Math.round(netBuyer1).toLocaleString()}</strong>
        </div>
        <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
          <span className="text-[10px] text-emerald-700 font-bold uppercase block">2nd Quote (BAFO):</span>
          <strong className="text-sm font-black font-mono text-emerald-950">₹ {Math.round(net2).toLocaleString()}</strong>
        </div>
        <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200">
          <span className="text-[10px] text-purple-700 font-bold uppercase block">Active Concession:</span>
          <strong className="text-sm font-black font-mono text-purple-950">₹ {Math.round(totalSavings).toLocaleString()} (-{savingsPct}%)</strong>
        </div>
      </div>

      {/* 2. MULTI-ROUND QUOTATION TABLE (WITH COLUMN-ANCHORED SUBMIT PROVISION) */}
      <VendorMultiRoundQuoteTable
        items={items}
        activeRound={activeRound}
        onRate1Change={onRate1Change}
        onRate2Change={onRate2Change}
        onRate3Change={onRate3Change}
        quote1Submitted={quote1Submitted}
        quote2Submitted={quote2Submitted}
        quote3Submitted={quote3Submitted}
        onSubmitActiveRound={handleSubmitActiveRound}
      />

      {/* 3. COMMERCIAL TERMS & CONDITIONS FORM */}
      <VendorQuotedTermsForm
        terms={terms}
        onChange={onUpdateTerms}
        title={
          activeRound === 1
            ? '1st Round Quoted Terms & Conditions'
            : activeRound === 2
            ? 'Round 2 (BAFO) Quoted Terms & Concessions'
            : 'Round 3 (Final Settlement) Commercial Terms'
        }
        badge={
          activeRound === 1
            ? 'Initial Terms'
            : activeRound === 2
            ? 'Revised Terms'
            : 'Final Settlement Terms'
        }
      />
    </div>
  );
};
