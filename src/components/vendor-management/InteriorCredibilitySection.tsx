'use client';

import React from 'react';
import { Hammer, Store, Building2, UserCheck, CheckCircle2 } from 'lucide-react';
import { UI_STRINGS } from '@/constants';
import type { InteriorFitoutEvaluationData } from '@/types';

interface InteriorCredibilitySectionProps {
  data: InteriorFitoutEvaluationData;
}

export const InteriorCredibilitySection: React.FC<InteriorCredibilitySectionProps> = ({ data }) => {
  return (
    <div className="space-y-4 text-xs">
      <h4 className="font-black text-slate-900 text-sm flex items-center border-b border-slate-100 pb-2">
        <Hammer className="w-4 h-4 mr-2 text-amber-600" />
        {UI_STRINGS.vendorManagement.sectionInteriorTitle}
      </h4>

      {/* Carpenters & Workshop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
          <span className="text-slate-500 text-[10px] block font-semibold">
            {UI_STRINGS.vendorManagement.carpentersCountLabel}
          </span>
          <span className="text-base font-black text-amber-900">
            {data.carpentersCount} Master Craftsmen
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-slate-500 text-[10px] block font-semibold">Workshop Facility</span>
          <span className="text-base font-black text-slate-900">
            {data.workshopSqFt.toLocaleString()} Sq. Ft.
          </span>
        </div>
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <span className="text-slate-500 text-[10px] block font-semibold">Automation Machinery</span>
          <span className="text-xs font-bold text-emerald-800 flex items-center mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            CNC Router & Auto Bander
          </span>
        </div>
      </div>

      {/* Retail Brands Worked With */}
      <div className="space-y-2">
        <span className="font-bold text-slate-700 flex items-center">
          <Store className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
          {UI_STRINGS.vendorManagement.retailBrandsLabel}:
        </span>
        <div className="flex flex-wrap gap-2">
          {data.brandsWorkedWith.map((b) => (
            <span
              key={b}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Ongoing Projects */}
      {data.ongoingProjects.length > 0 && (
        <div className="space-y-2">
          <span className="font-bold text-slate-700 flex items-center">
            <Building2 className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
            {UI_STRINGS.vendorManagement.ongoingProjectsTitle}:
          </span>
          <div className="space-y-2">
            {data.ongoingProjects.map((p, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-black text-slate-900">{p.projectName}</span>
                  <span className="text-slate-500 text-[11px] block">
                    Client: <strong>{p.clientName}</strong> • {p.locationCity} • ₹{p.valueInLakhs} Lakhs
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black rounded-lg text-[11px]">
                  {p.completionPercent}% Progress
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
