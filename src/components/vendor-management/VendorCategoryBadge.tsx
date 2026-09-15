'use client';

import React from 'react';
import { Hammer, BadgeCheck, Clock } from 'lucide-react';
import type { ManagedVendor } from '@/types';

interface VendorCategoryBadgeProps {
  vendor: ManagedVendor;
}

export const VendorCategoryBadge: React.FC<VendorCategoryBadgeProps> = ({ vendor }) => {
  const interior = vendor.categorySpecificProfile?.interiorFitout;
  const boughtout = vendor.categorySpecificProfile?.boughtoutMEP;

  return (
    <div className="space-y-1.5">
      <div>
        <span className="font-bold text-slate-800 block">{vendor.category}</span>
        <span className="text-[11px] text-slate-500 block truncate max-w-xs">
          {vendor.subCategory}
        </span>
      </div>

      {interior && (
        <div className="inline-flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
          <span className="flex items-center text-amber-800">
            <Hammer className="w-3 h-3 mr-1 text-amber-600" />
            {interior.carpentersCount} Carpenters
          </span>
          <span>•</span>
          <span>{interior.brandsWorkedWith.length} Brands</span>
          <span>•</span>
          <span>{interior.clientReferences.length} Refs</span>
        </div>
      )}

      {boughtout && (
        <div className="inline-flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-sky-900 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-lg">
          <span className="flex items-center text-sky-800">
            <BadgeCheck className="w-3 h-3 mr-1 text-sky-600" />
            {boughtout.dealerships.length} OEMs
          </span>
          <span>•</span>
          <span>{boughtout.regionsCovered.length} Regions</span>
          <span>•</span>
          <span>{boughtout.certifiedEngineersCount} Engrs</span>
        </div>
      )}

      <div className="flex items-center space-x-2 text-[10px] text-slate-500">
        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold">
          Cap: {vendor.capacity}
        </span>
        <span className="flex items-center">
          <Clock className="w-2.5 h-2.5 mr-0.5 text-slate-400" />
          {vendor.leadTime}
        </span>
      </div>
    </div>
  );
};
