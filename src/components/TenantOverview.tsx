'use client';

import React from 'react';
import { Building2, Check, Users, MapPin, Briefcase } from 'lucide-react';
import { useProcurement, TENANTS } from '../context/ProcurementContext';
import { TenantKey } from '../types';

export const TenantOverview: React.FC = () => {
  const { activeTenantKey, changeTenant } = useProcurement();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-900 to-slate-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Multi-Tenancy Architecture & Corporate Roster</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Every enterprise client possesses independent project scopes, assigned personnel, and private rate cards.
            </p>
          </div>
        </div>
      </div>

      {/* Corporate Roster Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900">Enterprise Clients & Assigned Personnel</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Switching the active client dynamically scopes projects, cost centres, and role assignments across the entire platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(TENANTS) as TenantKey[]).map((k) => {
            const t = TENANTS[k];
            const isActive = k === activeTenantKey;

            return (
              <div
                key={k}
                className={`p-4 rounded-xl border transition-all space-y-3 text-xs ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-300/60 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                  <span className="font-mono text-[10px] bg-slate-100 font-bold px-1.5 py-0.5 rounded text-slate-600">
                    {t.id}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Active Project</span>
                  <p className="text-slate-800 font-semibold text-xs leading-snug">{t.project}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Site Lead:</span>
                    <strong className="text-slate-800 text-right">{t.team['PROJECT_TEAM']?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Project Head:</span>
                    <strong className="text-slate-800 text-right">{t.team['PROJECT_HEAD_PR']?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category Mgr:</span>
                    <strong className="text-slate-800 text-right">{t.team['CATEGORY_MANAGER']?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Finance Head:</span>
                    <strong className="text-slate-800 text-right">{t.team['FINANCE_HEAD']?.name}</strong>
                  </div>
                </div>

                <button
                  onClick={() => changeTenant(k)}
                  className={`w-full mt-2 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>Current Active Client</span>
                    </>
                  ) : (
                    <span>Switch to this Client</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
