'use client';

import React from 'react';
import { Users, Building, Globe, Award, Star } from 'lucide-react';
import { UI_STRINGS } from '@/constants';
import type { VendorManagementKPIs } from '@/types';

interface VendorManagementKPICardsProps {
  kpis: VendorManagementKPIs;
}

export const VendorManagementKPICards: React.FC<VendorManagementKPICardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Empanelled */}
      <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {UI_STRINGS.vendorManagement.kpiTotalVendors}
          </span>
          <Users className="w-4 h-4 text-slate-500" />
        </div>
        <div className="text-2xl font-black text-slate-900">{kpis.totalVendors}</div>
        <span className="text-[11px] text-slate-500 block">Total Active Partners</span>
      </div>

      {/* Client Onboarded */}
      <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-emerald-700">
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {UI_STRINGS.vendorManagement.kpiClientOnboarded}
          </span>
          <Building className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-black text-emerald-950">{kpis.clientOnboardedCount}</div>
        <span className="text-[11px] text-emerald-700 font-semibold block">Client Pre-Vetted</span>
      </div>

      {/* ProCPX Platform */}
      <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-sky-700">
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {UI_STRINGS.vendorManagement.kpiProcapxNetwork}
          </span>
          <Globe className="w-4 h-4 text-sky-600" />
        </div>
        <div className="text-2xl font-black text-sky-950">{kpis.procapxNetworkCount}</div>
        <span className="text-[11px] text-sky-700 font-semibold block">Universal Rate-Card</span>
      </div>

      {/* Evaluations Pending */}
      <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-amber-600">
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {UI_STRINGS.vendorManagement.kpiPendingEvaluations}
          </span>
          <Award className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-black text-slate-900">{kpis.pendingEvaluationsCount}</div>
        <span className="text-[11px] text-slate-500 block">Audit Reviews Pending</span>
      </div>

      {/* PPO Rated Vendors */}
      <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm space-y-1 col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {UI_STRINGS.vendorManagement.kpiPPORated}
          </span>
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        </div>
        <div className="text-2xl font-black text-slate-900">
          {kpis.ppoRatedVendorsCount}{' '}
          <span className="text-xs text-slate-400 font-medium">({kpis.averageRating} ★ avg)</span>
        </div>
        <span className="text-[11px] text-slate-500 block">Performance Tracked</span>
      </div>
    </div>
  );
};
