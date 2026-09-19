'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import type { ManagedVendor } from '@/types';

interface VendorDetailsCellProps {
  vendor: ManagedVendor;
  onOpenDossier?: (vendor: ManagedVendor, initialTab?: 'credibility' | 'catalogue') => void;
}

export const VendorDetailsCell: React.FC<VendorDetailsCellProps> = ({ vendor, onOpenDossier }) => {
  return (
    <td className="py-3 px-4 align-middle">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          {onOpenDossier ? (
            <button
              type="button"
              onClick={() => onOpenDossier(vendor, 'catalogue')}
              className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors text-left cursor-pointer"
              title="Click to view Vendor Profile & Standard BOQ Catalogue Pricing"
            >
              {vendor.name}
            </button>
          ) : (
            <span className="font-bold text-slate-900 text-sm">
              {vendor.name}
            </span>
          )}
          {vendor.isRateCard && (
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
              Rate Card
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
          <span className="font-mono text-slate-600">
            GST: <strong className="text-slate-700">{vendor.gstin}</strong>
          </span>
          <span>•</span>
          <span className="flex items-center text-slate-500">
            <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
            {vendor.city}
          </span>
          {vendor.contactPerson && (
            <>
              <span>•</span>
              <span className="text-slate-600">
                Rep: <strong>{vendor.contactPerson}</strong>
              </span>
            </>
          )}
        </div>
      </div>
    </td>
  );
};

