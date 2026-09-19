'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';
import type { RateCardNegotiationViewProps } from '@/types';
import { UI_STRINGS } from '@/constants';
import { useProcurement } from '@/context/ProcurementContext';

export const RateCardNegotiationView: React.FC<RateCardNegotiationViewProps> = ({
  agreements,
  onAcceptProposal,
  onCounterOffer,
  onFinalize,
}) => {
  const { sellerRespondRateCardProposal, finalizeRateCard } = useProcurement();

  // Pick the first proposal or counter-offered agreement by default
  const pendingAgreements = agreements.filter(
    (a) => a.status === 'PROPOSAL_SENT' || a.status === 'COUNTER_OFFERED' || a.status === 'ACCEPTED'
  );

  const [selectedId, setSelectedId] = useState<string>(
    pendingAgreements[0]?.id ?? agreements[0]?.id ?? ''
  );

  const selectedAgreement = agreements.find((a) => a.id === selectedId);

  const handleSimulateSellerAccept = (id: string): void => {
    if (onAcceptProposal) {
      onAcceptProposal(id);
    } else {
      sellerRespondRateCardProposal(id, 'ACCEPT');
    }
  };

  const handleSimulateSellerCounter = (id: string): void => {
    if (!selectedAgreement) return;
    const sampleCounters: Record<string, number> = {};
    selectedAgreement.items.forEach((item) => {
      // Seller counters with ~3-5% above proposed rate
      sampleCounters[item.itemCode] = Math.round(item.proposedRate * 1.04);
    });

    if (onCounterOffer) {
      onCounterOffer(id, sampleCounters);
    } else {
      sellerRespondRateCardProposal(id, 'COUNTER', sampleCounters);
    }
  };

  const handleFinalize = (id: string): void => {
    if (onFinalize) {
      onFinalize(id);
    } else {
      finalizeRateCard(id);
    }
  };

  if (agreements.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-sm">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-800">No Proposals in Negotiation</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Create a new rate card proposal in the proposal tab to initiate rate alignment with an empanelled vendor.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar: List of Proposals */}
      <div className="lg:col-span-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Active Proposals & Offers ({agreements.length})
        </h3>
        <div className="space-y-2">
          {agreements.map((agreement) => {
            const isSelected = agreement.id === selectedId;
            return (
              <div
                key={agreement.id}
                onClick={() => setSelectedId(agreement.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-brand-50/50 border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-brand-700 bg-white px-2 py-0.5 rounded border border-brand-200">
                    {agreement.id}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      agreement.status === 'FINALISED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : agreement.status === 'COUNTER_OFFERED'
                        ? 'bg-amber-100 text-amber-800'
                        : agreement.status === 'ACCEPTED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {agreement.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{agreement.vendorName}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{agreement.categoryName}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Negotiation Details */}
      <div className="lg:col-span-8">
        {selectedAgreement ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {selectedAgreement.id}
                  </span>
                  <span className="text-xs text-slate-400">v{selectedAgreement.version}.0</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedAgreement.vendorName} — {selectedAgreement.categoryName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Effective until: {selectedAgreement.expiryDate} • {selectedAgreement.items.length} Scope Items
                </p>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedAgreement.status === 'PROPOSAL_SENT' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSimulateSellerAccept(selectedAgreement.id)}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Seller: Accept Proposed
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateSellerCounter(selectedAgreement.id)}
                      className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Seller: Counter Offer
                    </button>
                  </>
                )}

                {selectedAgreement.status !== 'FINALISED' && (
                  <button
                    type="button"
                    onClick={() => handleFinalize(selectedAgreement.id)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {UI_STRINGS.rateCards.finalizeRateCardButton}
                  </button>
                )}
              </div>
            </div>

            {/* Line Items Comparison */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Line Items Rate Card Benchmarks & Offers
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Item Code</th>
                      <th className="py-2.5 px-3">Scope Description</th>
                      <th className="py-2.5 px-2 text-center">UOM</th>
                      <th className="py-2.5 px-3 text-right bg-indigo-50/40 text-indigo-900 border-x border-indigo-100">
                        {UI_STRINGS.rateCards.aiCostHeader}
                      </th>
                      <th className="py-2.5 px-3 text-right bg-brand-50/40 text-brand-900 border-r border-brand-100">
                        {UI_STRINGS.rateCards.proposedRateHeader}
                      </th>
                      {selectedAgreement.status === 'COUNTER_OFFERED' && (
                        <th className="py-2.5 px-3 text-right bg-amber-50 text-amber-900 font-bold border-r border-amber-200">
                          {UI_STRINGS.rateCards.sellerCounterRateHeader}
                        </th>
                      )}
                      <th className="py-2.5 px-3 text-right bg-emerald-50 text-emerald-900 font-bold">
                        {UI_STRINGS.rateCards.finalAgreedRateHeader}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedAgreement.items.map((item) => (
                      <tr key={item.itemCode} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                          {item.itemCode}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700 max-w-xs truncate">
                          {item.desc}
                        </td>
                        <td className="py-2.5 px-2 text-center font-semibold text-slate-500">
                          {item.uom}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-indigo-700 bg-indigo-50/20 border-x border-indigo-100">
                          ₹{item.aiShouldCost.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-800 bg-brand-50/20 border-r border-brand-100">
                          ₹{item.proposedRate.toLocaleString('en-IN')}
                        </td>
                        {selectedAgreement.status === 'COUNTER_OFFERED' && (
                          <td className="py-2.5 px-3 text-right font-bold text-amber-800 bg-amber-50/60 border-r border-amber-200">
                            ₹{(item.sellerCounterRate ?? item.proposedRate).toLocaleString('en-IN')}
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-800 bg-emerald-50/60 whitespace-nowrap">
                          ₹{item.finalAgreedRate.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-sm">
            <p className="text-xs text-slate-500">Select an agreement from the sidebar.</p>
          </div>
        )}
      </div>
    </div>
  );
};
