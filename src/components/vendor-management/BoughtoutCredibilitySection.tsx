'use client';

import React from 'react';
import { BadgeCheck, Globe, Wrench, Clock, UserCheck } from 'lucide-react';
import { UI_STRINGS, DEALERSHIP_TIER_LABELS } from '@/constants';
import type { BoughtoutMEPEvaluationData, DealershipTier } from '@/types';

interface BoughtoutCredibilitySectionProps {
  data: BoughtoutMEPEvaluationData;
}

export const BoughtoutCredibilitySection: React.FC<BoughtoutCredibilitySectionProps> = ({
  data,
}) => {
  return (
    <div className="space-y-4 text-xs">
      <h4 className="font-black text-slate-900 text-sm flex items-center border-b border-slate-100 pb-2">
        <BadgeCheck className="w-4 h-4 mr-2 text-sky-600" />
        {UI_STRINGS.vendorManagement.sectionBoughtoutTitle}
      </h4>

      {/* Dealerships */}
      <div className="space-y-2">
        <span className="font-bold text-slate-700 flex items-center">
          <BadgeCheck className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
          {UI_STRINGS.vendorManagement.oemDealershipsTitle}:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data.dealerships.map((deal, idx) => (
            <div key={idx} className="p-3 bg-sky-50/50 rounded-xl border border-sky-200">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm">{deal.brandName}</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-sky-600 text-white">
                  {DEALERSHIP_TIER_LABELS[deal.dealershipTier as DealershipTier] || deal.dealershipTier}
                </span>
              </div>
              <span className="text-[11px] text-slate-600 block mt-1">
                {deal.productCategory} • Valid: {deal.validTill}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Regions & Engineers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-slate-500 text-[10px] block font-semibold">
            <Globe className="w-3 h-3 inline mr-1 text-indigo-600" />
            {UI_STRINGS.vendorManagement.regionsCoveredLabel}
          </span>
          <span className="text-xs font-black text-slate-900 block mt-1">
            {data.regionsCovered.join(', ')}
          </span>
        </div>
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <span className="text-slate-500 text-[10px] block font-semibold">
            <Wrench className="w-3 h-3 inline mr-1 text-emerald-600" />
            {UI_STRINGS.vendorManagement.certifiedEngineersLabel}
          </span>
          <span className="text-base font-black text-emerald-900 block mt-0.5">
            {data.certifiedEngineersCount} Field Engineers
          </span>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
          <span className="text-slate-500 text-[10px] block font-semibold">
            <Clock className="w-3 h-3 inline mr-1 text-amber-600" />
            {UI_STRINGS.vendorManagement.slaResponseLabel}
          </span>
          <span className="text-base font-black text-amber-900 block mt-0.5">
            {data.slaResponseTimeHours} Hours Response
          </span>
        </div>
      </div>

      {/* Client References */}
      {data.clientReferences.length > 0 && (
        <div className="space-y-2">
          <span className="font-bold text-slate-700 flex items-center">
            <UserCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            {UI_STRINGS.vendorManagement.clientReferencesTitle}:
          </span>
          <div className="space-y-2">
            {data.clientReferences.map((ref, idx) => (
              <div key={idx} className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900">
                    {ref.clientName} ({ref.projectName})
                  </span>
                  <span className="font-bold text-emerald-800 text-[11px]">₹{ref.valueInCr} Cr</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1">
                  Contact: <strong>{ref.contactPerson}</strong> ({ref.designation}) • Phone:{' '}
                  <strong>{ref.contactNumber}</strong> • Email: {ref.email}
                </p>
                <p className="text-slate-500 text-[10px] mt-0.5">Scope: {ref.scopeDelivered}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
