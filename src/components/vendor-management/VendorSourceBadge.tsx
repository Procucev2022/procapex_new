'use client';

import React from 'react';
import { Building, Globe } from 'lucide-react';
import { UI_STRINGS } from '@/constants';
import type { VendorSource } from '@/types';

interface VendorSourceBadgeProps {
  source: VendorSource;
  tenantName?: string;
}

export const VendorSourceBadge: React.FC<VendorSourceBadgeProps> = ({ source, tenantName }) => {
  if (source === 'CLIENT_ONBOARDED') {
    return (
      <div className="inline-flex flex-col space-y-1">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-700/20">
          <Building className="w-3.5 h-3.5 mr-1.5" />
          {UI_STRINGS.vendorManagement.tagClientBoarded}
        </span>
        <span className="text-[10px] font-bold text-emerald-800 pl-1">
          Tenant: {tenantName || 'Client Pre-Vetted'}
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col space-y-1">
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black bg-sky-600 text-white shadow-sm ring-1 ring-sky-700/20">
        <Globe className="w-3.5 h-3.5 mr-1.5" />
        {UI_STRINGS.vendorManagement.tagProcapxPlatform}
      </span>
      <span className="text-[10px] font-semibold text-sky-800 pl-1">Universal Global Pool</span>
    </div>
  );
};
