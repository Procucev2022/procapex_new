'use client';

import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import type { ManagedVendor } from '@/types';

interface VendorDetailsCellProps {
  vendor: ManagedVendor;
}

export const VendorDetailsCell: React.FC<VendorDetailsCellProps> = ({ vendor }) => {
  return (
    <td className="py-3.5 px-4">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="font-black text-slate-900 text-sm hover:text-sky-600 transition-colors">
            {vendor.name}
          </span>
          {vendor.isRateCard && (
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
              Rate Card
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
          <span className="font-mono text-slate-600">
            GST: <strong className="text-slate-800">{vendor.gstin}</strong>
          </span>
          <span className="flex items-center text-slate-500">
            <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
            {vendor.city}
          </span>
          {vendor.contactPerson && (
            <span className="text-slate-600">
              Rep: <strong>{vendor.contactPerson}</strong>
            </span>
          )}
        </div>

        {(vendor.email || vendor.phone) && (
          <div className="flex items-center space-x-3 text-[10px] text-slate-400">
            {vendor.email && (
              <span className="flex items-center">
                <Mail className="w-2.5 h-2.5 mr-1" />
                {vendor.email}
              </span>
            )}
            {vendor.phone && (
              <span className="flex items-center">
                <Phone className="w-2.5 h-2.5 mr-1" />
                {vendor.phone}
              </span>
            )}
          </div>
        )}
      </div>
    </td>
  );
};
