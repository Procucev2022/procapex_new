'use client';

import React from 'react';
import { Star } from 'lucide-react';
import type { ManagedVendor } from '@/types';

interface VendorRatingsCellProps {
  vendor: ManagedVendor;
}

export const VendorRatingsCell: React.FC<VendorRatingsCellProps> = ({ vendor }) => {
  return (
    <td className="py-3.5 px-4 align-middle">
      <div className="space-y-1">
        <div className="flex items-center space-x-1.5">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(vendor.compositeRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="font-black text-slate-900 text-xs">{vendor.compositeRating}</span>
        </div>

        <div className="text-[10px] text-slate-500 space-y-0.5">
          {vendor.ppoRatings.length > 0 ? (
            <span className="text-emerald-700 font-bold block">
              {vendor.ppoRatings.length} PPO Delivery Review(s)
            </span>
          ) : (
            <span className="text-slate-400 block">No PPO reviews yet</span>
          )}
          {vendor.evaluationScore && (
            <span className="text-slate-500 block">
              Eval: {vendor.evaluationScore.totalScore}/100 (Grade {vendor.evaluationScore.grade})
            </span>
          )}
        </div>
      </div>
    </td>
  );
};
