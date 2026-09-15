'use client';

import React from 'react';
import { Building2, Layers, Calendar, Clock } from 'lucide-react';

export interface VendorRFQDetailsCardProps {
  displayProject: string;
  displaySite: string;
  displayCategory: string;
  displayPackage: string;
  displayDeadline: string;
}

export const VendorRFQDetailsCard: React.FC<VendorRFQDetailsCardProps> = ({
  displayProject,
  displaySite,
  displayCategory,
  displayPackage,
  displayDeadline,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold uppercase">
          <Building2 className="w-3.5 h-3.5 text-purple-600" />
          <span>Project & Site Location</span>
        </div>
        <strong className="text-sm font-black text-slate-900 block">{displayProject}</strong>
        <p className="text-xs text-slate-600">{displaySite}</p>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold uppercase">
          <Layers className="w-3.5 h-3.5 text-sky-600" />
          <span>Procurement Package</span>
        </div>
        <strong className="text-sm font-black text-slate-900 block">{displayCategory}</strong>
        <p className="text-xs text-slate-600 truncate">{displayPackage}</p>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold uppercase">
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>RFQ Timeline & Closure</span>
        </div>
        <strong className="text-sm font-black text-slate-900 block font-mono">{displayDeadline}</strong>
        <p className="text-xs text-amber-700 font-bold flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Open for Bidding</span>
        </p>
      </div>
    </div>
  );
};
