'use client';

import React from 'react';
import { Building2, Check, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { TENANTS, UI_STRINGS, PRICING_TIERS } from '@/constants';
import type { TenantKey, PricingTierId } from '@/types';

export const TenantOverview: React.FC = () => {
  const {
    activeTenantKey,
    changeTenant,
    tenantTiers,
    changeTenantTier,
  } = useProcurement();

  const pricingTierKeys: PricingTierId[] = ['MODULE_1', 'MODULE_2', 'MODULE_3'];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-brand-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-5 h-5 text-sky-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                MULTI-TENANT ARCHITECTURE
              </span>
            </div>
            <h1 className="text-2xl font-black mt-1.5 tracking-tight text-white">{UI_STRINGS.tenantOverview.title}</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {UI_STRINGS.tenantOverview.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 3 PRICING MODELS ARCHITECTURE SECTION */}
      <div className="bg-white rounded-2xl border border-blue-200 p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {UI_STRINGS.pricingTiers.badge}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1">
              {UI_STRINGS.pricingTiers.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {UI_STRINGS.pricingTiers.subtitle}
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-bold shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Universal Supplier Portal in All Tiers</span>
          </div>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {pricingTierKeys.map((tierId) => {
            const tier = PRICING_TIERS[tierId];
            const isTier2 = tierId === 'MODULE_2';
            const isTier3 = tierId === 'MODULE_3';

            return (
              <div
                key={tierId}
                className={`rounded-2xl p-5 border flex flex-col justify-between space-y-4 transition-all ${
                  isTier3
                    ? 'border-blue-300 bg-blue-50/50 shadow-md ring-1 ring-blue-200'
                    : isTier2
                    ? 'border-sky-300 bg-sky-50/30 shadow-sm'
                    : 'border-slate-200 bg-slate-50/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                        isTier3
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : isTier2
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-slate-700 text-white border-slate-700'
                      }`}
                    >
                      {tier.code}
                    </span>
                    {isTier3 && (
                      <span className="flex items-center text-[10px] text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3 mr-1 text-indigo-600" />
                        Most Popular
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900">{tier.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                      {tier.targetPersona}
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="text-3xl font-black text-slate-900 tracking-tight">
                      {tier.priceFormatted}
                      <span className="text-xs font-semibold text-slate-500"> {tier.billingPeriod}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{tier.summary}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs">
                    {tier.features.map((feat) => (
                      <div key={feat} className="flex items-start space-x-2">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            isTier3
                              ? 'text-indigo-600'
                              : isTier2
                              ? 'text-sky-600'
                              : 'text-emerald-600'
                          }`}
                        />
                        <span className="text-slate-700 text-[11px] leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-semibold block text-center">
                    Universal Vendor Portal & Quotes included
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Corporate Roster Grid with Real-time Subscription Upgrades */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900">{UI_STRINGS.tenantOverview.gridTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {UI_STRINGS.tenantOverview.gridSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(TENANTS) as TenantKey[]).map((k) => {
            const t = TENANTS[k];
            const isActive = k === activeTenantKey;
            const clientTier = tenantTiers?.[k] ?? t?.tier ?? 'MODULE_1';
            const tierConfig = PRICING_TIERS[clientTier] ?? PRICING_TIERS.MODULE_1;

            return (
              <div
                key={k}
                className={`p-4 rounded-xl border transition-all space-y-3 text-xs flex flex-col justify-between ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-300/60 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                    <span className="font-mono text-[10px] bg-slate-100 font-bold px-1.5 py-0.5 rounded text-slate-600">
                      {t.id}
                    </span>
                  </div>

                  {/* Active Subscription Tier Tag */}
                  <div className="bg-brand-900/5 rounded-lg p-2 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Plan</span>
                      <span className="font-mono font-black text-[11px] text-emerald-600">
                        {tierConfig?.priceFormatted}/mo
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 block truncate">
                      {tierConfig?.name}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      {UI_STRINGS.tenantOverview.activeProject}
                    </span>
                    <p className="text-slate-800 font-semibold text-xs leading-snug">{t.project}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Site Lead:</span>
                      <strong className="text-slate-800 text-right">{t.team['PROJECT_TEAM']?.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Project Head:</span>
                      <strong className="text-slate-800 text-right">{t.team['PROJECT_HEAD_PPO']?.name}</strong>
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

                  {/* Subscription Tier Switcher / Upgrade Dropdown */}
                  <div className="pt-2 border-t border-slate-200/80 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">
                      Client Subscription Tier:
                    </label>
                    <select
                      value={clientTier}
                      onChange={(e) => changeTenantTier(k, e.target.value as PricingTierId)}
                      aria-label={`Change subscription tier for ${t.name}`}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-bold rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                    >
                      <option value="MODULE_1">Module 1 ($2,000/mo - Finance)</option>
                      <option value="MODULE_2">Module 2 ($4,000/mo - BOQ & RFQ)</option>
                      <option value="MODULE_3">Module 3 ($6,000/mo - Full Suite)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => changeTenant(k)}
                  className={`w-full mt-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>{UI_STRINGS.tenantOverview.currentActiveClient}</span>
                    </>
                  ) : (
                    <span>{UI_STRINGS.tenantOverview.switchToClient}</span>
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
