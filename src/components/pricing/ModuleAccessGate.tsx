'use client';

import React from 'react';
import { Lock, Sparkles, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useProcurement } from '@/context/ProcurementContext';
import { PRICING_TIERS, UI_STRINGS } from '@/constants';
import type { ModuleAccessGateProps, PricingTierId } from '@/types';

export const ModuleAccessGate: React.FC<ModuleAccessGateProps> = ({ moduleId, children }) => {
  const { isModuleAllowed, activeTenantKey, activeTenant, activeTenantTier, changeTenantTier } = useProcurement();

  if (isModuleAllowed(moduleId)) {
    return <>{children}</>;
  }

  // Determine the minimum required tier for this module
  let requiredTierId: PricingTierId = 'MODULE_2';
  if (
    moduleId === 'vendor_negotiation_hub' ||
    moduleId === 'ppo_workorders' ||
    moduleId === 'pr_approval_queue'
  ) {
    requiredTierId = 'MODULE_3';
  }

  const requiredTier = PRICING_TIERS[requiredTierId];
  const currentTier = PRICING_TIERS[activeTenantTier];

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                {UI_STRINGS.pricingTiers.badge}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Client: <strong className="text-slate-900">{activeTenant.name}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {UI_STRINGS.pricingTiers.lockedFeatureNotice}
            </h2>
          </div>
        </div>

        {/* Current Plan Badge */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            {UI_STRINGS.pricingTiers.currentPlanLabel}
          </span>
          <span className="text-xs font-black text-slate-700">
            {currentTier?.badge}
          </span>
        </div>
      </div>

      {/* Upgrade Callout Card */}
      <div className="bg-gradient-to-br from-brand-950 via-slate-900 to-brand-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
              <span className="text-xs font-bold text-sky-300 tracking-wide uppercase">
                {requiredTier.badge}
              </span>
            </div>
            <h3 className="text-2xl font-black text-white">
              {requiredTier.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {requiredTier.summary}
            </p>
          </div>

          <div className="bg-brand-900/90 border border-sky-400/30 rounded-2xl p-5 text-center shrink-0 shadow-inner space-y-2">
            <div className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">
              Subscription Rate
            </div>
            <div className="text-3xl font-black text-emerald-400 tracking-tight">
              {requiredTier.priceFormatted}
              <span className="text-xs text-slate-400 font-medium"> {requiredTier.billingPeriod}</span>
            </div>
            <button
              type="button"
              onClick={() => changeTenantTier(activeTenantKey, requiredTierId)}
              className="w-full mt-2 py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-brand-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{UI_STRINGS.pricingTiers.upgradeButton}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Feature Entitlements Checklist */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
          {requiredTier.features.map((feat) => (
            <div key={feat} className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Universal Access Notice */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-center space-x-3 text-xs text-sky-900">
        <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
        <span className="leading-relaxed">
          <strong>Universal Supplier Access:</strong> {UI_STRINGS.pricingTiers.featureCommonVendor} (Vendor Portal & Quotation Bidding are universally accessible in all 3 price tiers).
        </span>
      </div>
    </div>
  );
};
