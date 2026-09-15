'use client';

import React from 'react';
import {
  Store,
  CheckCircle2,
  Clock,
  Award,
  User,
  FileText,
  LogOut,
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
    <div className="bg-gradient-to-r from-purple-950 via-brand-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-purple-800 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-500/30 text-purple-300 border border-purple-400/40 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <Store className="w-3 h-3" />
              <span>{UI_STRINGS.vendorPortal.roleBadge}</span>
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Active RFQ: <strong className="text-sky-300">{activePR}</strong>
            </span>
            {activeVendorObj.source === 'CLIENT_ONBOARDED' && (
              <span className="bg-emerald-600/90 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-400 flex items-center space-x-1">
                <span>🏢</span>
                <span>{UI_STRINGS.vendorPortal.onboardedBadge}</span>
              </span>
            )}
            <span
              data-testid="vendor-session-active-badge"
              className="bg-purple-900/90 text-purple-200 border border-purple-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{UI_STRINGS.vendorPortal.sessionActiveBadge}</span>
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">{getDisplayName()}</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Project: <strong className="text-white">{activeRFQProject || 'Godrej Woods, Tower C'}</strong> • Requisition:{' '}
            <strong className="text-sky-300">
              {activeRFQTitle || 'Reception Counter Fabrication (Drawing: Counter Elevation D)'}
            </strong>
          </p>
        </div>

        {/* Switchers & Logout */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-purple-900/60 rounded-xl px-3 py-1.5 border border-purple-500/40">
            <User className="w-3.5 h-3.5 text-purple-300 mr-2 shrink-0" />
            <span className="text-[11px] text-slate-300 mr-1.5 font-medium">{UI_STRINGS.vendorPortal.vendorLabel}</span>
            <select
              value={activeVendor}
              onChange={(e) => onSelectVendor(e.target.value)}
              className="bg-purple-950 text-purple-200 text-xs font-bold rounded-lg px-2 py-1 border border-purple-600 cursor-pointer"
            >
              <option value="VND-001">Vendor 1 (DesignCraft Millworks - Mumbai)</option>
              <option value="VND-002">Vendor 2 (Apex Modular Systems - Pune)</option>
              <option value="VND-005">Vendor 5 (NorthCraft Engineering - Noida)</option>
              {allVendors
                .filter((v) => v.id !== 'VND-001' && v.id !== 'VND-002' && v.id !== 'VND-005')
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.source === 'CLIENT_ONBOARDED' ? '🏢 [Client] ' : ''}
                    {v.name} ({v.id})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-900/80 rounded-xl px-3 py-1.5 border border-slate-700">
            <FileText className="w-3.5 h-3.5 text-sky-400 mr-2 shrink-0" />
            <span className="text-[11px] text-slate-300 mr-1.5 font-medium">{UI_STRINGS.vendorPortal.rfqLabel}</span>
            <select
              value={activePR}
              onChange={(e) => onSelectPR(e.target.value)}
              className="bg-slate-800 text-sky-200 text-xs font-bold rounded-lg px-2 py-1 border border-slate-600 cursor-pointer max-w-[220px] truncate"
            >
              {availableRFQs && availableRFQs.length > 0 ? (
                availableRFQs.map((rfq) => (
                  <option key={rfq.prId || rfq.id} value={rfq.prId || rfq.id}>
                    {rfq.prId || rfq.id} ({rfq.title.substring(0, 24)}...)
                  </option>
                ))
              ) : (
                <>
                  <option value="PR-2026-0005">PR-2026-0005 (Millwork & Counter)</option>
                  <option value="PR-2026-0003">PR-2026-0003 (HVAC Chillers Package)</option>
                </>
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={onLogout}
            data-testid="vendor-logout-button"
            className="px-3 py-1.5 bg-purple-900/80 hover:bg-rose-900/90 text-purple-200 hover:text-white rounded-xl text-xs font-bold border border-purple-500/40 cursor-pointer transition-all flex items-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{UI_STRINGS.vendorPortal.logoutButton}</span>
          </button>
        </div>
      </div>

      {/* Ribbon Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-purple-800/60 text-xs">
        <div className="bg-purple-900/40 p-3 rounded-xl border border-purple-700/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-purple-300 uppercase font-bold block">RFQ Closure Deadline:</span>
            <strong className="text-white text-xs font-mono">15-Sep-2026 18:00 IST</strong>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>3 Days Left</span>
          </span>
        </div>

        <div className="bg-purple-900/40 p-3 rounded-xl border border-purple-700/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-purple-300 uppercase font-bold block">RFQ Participation:</span>
            <strong className="text-emerald-300 text-xs font-sans">
              {rfqAccepted ? UI_STRINGS.vendorPortal.rfqAccepted : UI_STRINGS.vendorPortal.pendingAcceptance}
            </strong>
          </div>
          {rfqAccepted ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
              {UI_STRINGS.vendorPortal.activeBidder}
            </span>
          ) : (
            <button
              type="button"
              onClick={onAcceptRfq}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-xs cursor-pointer"
            >
              {UI_STRINGS.vendorPortal.acceptRfq}
            </button>
          )}
        </div>

        <div className="bg-purple-900/40 p-3 rounded-xl border border-purple-700/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-purple-300 uppercase font-bold block">Award / PPO Offer:</span>
            <strong className="text-white text-xs font-mono">
              {ppoAccepted ? 'PPO-2026-0005 Accepted' : 'PPO-2026-0005 Ready for Review'}
            </strong>
          </div>
          <button
            type="button"
            onClick={onViewPPO}
            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold shadow-xs flex items-center space-x-1 cursor-pointer"
          >
            <Award className="w-3 h-3" />
            <span>{ppoAccepted ? UI_STRINGS.vendorPortal.viewPO : UI_STRINGS.vendorPortal.reviewOffer}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
