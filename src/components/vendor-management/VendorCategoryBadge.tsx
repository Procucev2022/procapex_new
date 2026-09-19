'use client';

import React, { useContext, useMemo } from 'react';
import { CheckCircle2, Clock, Zap } from 'lucide-react';
import { ProcurementContext } from '@/context/ProcurementContext';
import type { ManagedVendor } from '@/types';

interface VendorCategoryBadgeProps {
  vendor: ManagedVendor;
  onOpenRateCardTab?: (vendor: ManagedVendor) => void;
}

export const VendorCategoryBadge: React.FC<VendorCategoryBadgeProps> = ({
  vendor,
  onOpenRateCardTab,
}) => {
  const context = useContext(ProcurementContext);
  const getCoverage = context?.getVendorCategoryRateCardCoverage;

  const coverage = useMemo(() => {
    if (!vendor || !getCoverage) return null;
    return getCoverage(vendor.id, vendor.category);
  }, [vendor, getCoverage]);

  const extraCategoriesCount = vendor.categories && vendor.categories.length > 1
    ? vendor.categories.length - 1
    : 0;

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-bold text-slate-800 text-xs">{vendor.category}</span>
        {extraCategoriesCount > 0 && (
          <span
            title={vendor.categories?.join(', ')}
            className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200"
          >
            +{extraCategoriesCount} more
          </span>
        )}
      </div>
      <span className="text-[11px] text-slate-500 block truncate max-w-xs">
        {vendor.subCategory}
      </span>

      {/* Rate Card Standard BOQ Coverage Badge for all Rate Card Suppliers */}
      {vendor.isRateCard && (
        <div>
          <button
            type="button"
            onClick={() => onOpenRateCardTab?.(vendor)}
            className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
            title={`Standard BOQ Coverage: ${coverage?.coveredItemsCount || 0} of ${coverage?.totalStandardBOQItems || 0} items empanelled in ${vendor.category}`}
          >
            <Zap className="w-3 h-3 mr-1 text-emerald-600 shrink-0" />
            <span>
              Rate Card: {coverage?.coveragePct ?? 100}% Std BOQ
              {coverage?.totalStandardBOQItems ? ` (${coverage.coveredItemsCount}/${coverage.totalStandardBOQItems})` : ''}
            </span>
          </button>
        </div>
      )}

      {vendor.catalogueStatus?.hasSubmittedPrices ? (
        <div className="inline-flex items-center text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
          <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-600" />
          Catalogue Baseline Set
        </div>
      ) : vendor.catalogueStatus?.intimationSent ? (
        <div className="inline-flex items-center text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
          <Clock className="w-2.5 h-2.5 mr-1 text-amber-600" />
          Intimation Sent: {vendor.catalogueStatus.intimationDaysAllowed || 14}d
        </div>
      ) : null}
    </div>
  );
};


