'use client';

import React from 'react';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { RateCardAgreementCardProps } from '@/types';
import { UI_STRINGS } from '@/constants';
import { ProcurementContext } from '@/context/ProcurementContext';

export const RateCardAgreementCard: React.FC<RateCardAgreementCardProps> = ({
  agreement,
  onSelectAgreement,
  onFinalize,
  isSelected = false,
}) => {
  const context = React.useContext(ProcurementContext);
  const getCoverage = context?.getVendorCategoryRateCardCoverage;

  const coverage = React.useMemo(() => {
    if (!getCoverage) return null;
    return getCoverage(agreement.vendorId, agreement.categoryCode);
  }, [agreement.vendorId, agreement.categoryCode, getCoverage]);

  const getStatusBadge = (): JSX.Element => {
    switch (agreement.status) {
      case 'FINALISED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {UI_STRINGS.rateCards.statusFinalised}
          </span>
        );
      case 'COUNTER_OFFERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {UI_STRINGS.rateCards.statusCounterOffered}
          </span>
        );
      case 'PROPOSAL_SENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            {UI_STRINGS.rateCards.statusProposalSent}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {UI_STRINGS.rateCards.statusDraft}
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelectAgreement(agreement)}
      className={`relative cursor-pointer rounded-xl border p-5 transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
        isSelected
          ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-brand-100'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              {agreement.id}
            </span>
            <span className="text-xs text-slate-400 font-medium">v{agreement.version}.0</span>
          </div>
          <h4 className="text-base font-bold text-slate-900 leading-tight">
            {agreement.vendorName}
          </h4>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {agreement.categoryName}
          </p>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-2 my-4 py-3 border-y border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 block mb-0.5">Std BOQ Coverage</span>
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-brand-500" />
            {coverage ? `${coverage.coveragePct}% (${coverage.coveredItemsCount}/${coverage.totalStandardBOQItems})` : `${agreement.totalItemsCount} Items`}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Validity</span>
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {agreement.expiryDate}
          </span>
        </div>
      </div>

      {agreement.status === 'FINALISED' && (
        <div className="flex items-center gap-2 mb-4 px-2.5 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-800 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>{UI_STRINGS.rateCards.fastTrackBadge}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-semibold text-brand-600 flex items-center gap-1">
          Inspect Line Rates
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
        {agreement.status !== 'FINALISED' && onFinalize && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFinalize(agreement.id);
            }}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {UI_STRINGS.rateCards.finalizeRateCardButton}
          </button>
        )}
      </div>
    </div>
  );
};
