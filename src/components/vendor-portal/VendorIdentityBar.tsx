'use client';

import React from 'react';
import {
  Store,
  CheckCircle2,
  Clock,
  FileText,
  LogOut,
  Building,
} from 'lucide-react';
import type { VendorItem } from '@/types';
import { UI_STRINGS } from '@/constants';

export interface VendorIdentityBarProps {
  activeVendor: string;
  activePR: string;
  allVendors: VendorItem[];
  activeVendorObj: VendorItem;
  rfqAccepted: boolean;
  ppoAccepted: boolean;
  availableRFQs?: { id: string; prId: string; title: string; projectName: string }[];
  activeRFQTitle?: string;
  activeRFQProject?: string;
  onSelectVendor: (id: string) => void;
  onSelectPR: (pr: string) => void;
  onAcceptRfq: () => void;
  onViewPPO: () => void;
  onLogout: () => void;
}

export const VendorIdentityBar: React.FC<VendorIdentityBarProps> = ({
  activeVendor,
  activePR,
  allVendors,
  activeVendorObj,
  rfqAccepted,
  ppoAccepted,
  availableRFQs,
  activeRFQTitle,
  activeRFQProject,
  onSelectVendor,
  onSelectPR,
  onAcceptRfq,
  onViewPPO,
  onLogout,
}) => {
  const getDisplayName = (): string => {
    if (activeVendor === 'VND-001') return 'DesignCraft Millworks & Interiors Pvt Ltd (VND-001)';
    if (activeVendor === 'VND-002') return 'Apex Modular Systems Pvt Ltd (VND-002)';
    if (activeVendor === 'VND-005') return 'NorthCraft Engineering & Woodworks (VND-005)';
    return `${activeVendorObj.name} (${activeVendorObj.id})`;
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-brand-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <Store className="w-3 h-3 mr-1" />
              <span>{UI_STRINGS.vendorPortal.roleBadge}</span>
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Active RFQ: <strong className="text-sky-300">{activePR.replace('PR-', 'RFQ-')}</strong>
              {activeRFQTitle ? ` – ${activeRFQTitle}` : ''}
              {activeRFQProject ? ` (${activeRFQProject})` : ''}
            </span>
            {activeVendorObj.source === 'CLIENT_ONBOARDED' && (
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center space-x-1">
                <span>🏢</span>
                <span>{UI_STRINGS.vendorPortal.onboardedBadge}</span>
              </span>
            )}
            <span
              data-testid="vendor-session-active-badge"
              className="bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{UI_STRINGS.vendorPortal.sessionActiveBadge}</span>
            </span>
          </div>

          <h1 className="text-2xl font-black mt-1.5 tracking-tight text-white">
            {getDisplayName()}
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Empanelled Category: <strong className="text-white">{activeVendorObj.category}</strong> • Vendor ID: <strong className="text-white font-mono">{activeVendorObj.id}</strong> • City: <strong className="text-white">{activeVendorObj.city}</strong>
          </p>
        </div>

        {/* Vendor Switcher & Active RFQ Switcher */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2 shrink-0">
          <div className="flex items-center bg-slate-800/80 rounded-xl px-3 py-1.5 border border-slate-700">
            <Building className="w-3.5 h-3.5 text-sky-400 mr-2 shrink-0" />
            <span className="text-[11px] text-slate-300 mr-1.5 font-medium">{UI_STRINGS.vendorPortal.vendorLabel}</span>
            <select
              value={activeVendor}
              onChange={(e) => onSelectVendor(e.target.value)}
              aria-label={UI_STRINGS.vendorPortal.selectVendorCompany}
              className="bg-slate-900 text-white text-xs font-bold rounded-lg px-2 py-1 border border-slate-700 cursor-pointer max-w-[200px] truncate"
            >
              {allVendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-800/80 rounded-xl px-3 py-1.5 border border-slate-700">
            <FileText className="w-3.5 h-3.5 text-sky-400 mr-2 shrink-0" />
            <span className="text-[11px] text-slate-300 mr-1.5 font-medium">{UI_STRINGS.vendorPortal.rfqLabel}</span>
            <select
              value={activePR}
              onChange={(e) => onSelectPR(e.target.value)}
              className="bg-slate-900 text-white text-xs font-bold rounded-lg px-2 py-1 border border-slate-700 cursor-pointer max-w-[220px] truncate"
            >
              {availableRFQs && availableRFQs.length > 0 ? (
                availableRFQs.map((rfq) => (
                  <option key={rfq.prId || rfq.id} value={rfq.prId || rfq.id}>
                    {(rfq.prId || rfq.id).replace('PR-', 'RFQ-')} ({rfq.title.substring(0, 24)}...)
                  </option>
                ))
              ) : (
                <>
                  <option value="PR-2026-0005">RFQ-2026-0005 (Millwork & Counter)</option>
                  <option value="PR-2026-0003">RFQ-2026-0003 (HVAC Chillers Package)</option>
                </>
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={onLogout}
            data-testid="vendor-logout-button"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 cursor-pointer transition-all flex items-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{UI_STRINGS.vendorPortal.logoutButton}</span>
          </button>
        </div>
      </div>

      {/* Ribbon Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">RFQ Closure Deadline:</span>
            <strong className="text-white text-xs font-mono">15-Sep-2026 18:00 IST</strong>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>3 Days Left</span>
          </span>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">RFQ Participation:</span>
            <strong className="text-white text-xs font-sans">
              {rfqAccepted ? UI_STRINGS.vendorPortal.rfqAccepted : UI_STRINGS.vendorPortal.pendingAcceptance}
            </strong>
          </div>
          {rfqAccepted ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {UI_STRINGS.vendorPortal.activeBidder}
            </span>
          ) : (
            <button
              type="button"
              onClick={onAcceptRfq}
              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[10px] font-bold shadow-xs cursor-pointer"
            >
              {UI_STRINGS.vendorPortal.acceptRfq}
            </button>
          )}
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Award / PPO Offer:</span>
            <strong className="text-white text-xs font-mono">
              {ppoAccepted ? 'PPO-2026-0005 Accepted' : 'PPO-2026-0005 Ready for Review'}
            </strong>
          </div>
          <button
            type="button"
            onClick={onViewPPO}
            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
          >
            {ppoAccepted ? UI_STRINGS.vendorPortal.viewPO : UI_STRINGS.vendorPortal.reviewOffer}
          </button>
        </div>
      </div>
    </div>
  );
};
