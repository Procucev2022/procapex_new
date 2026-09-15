'use client';

import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { UI_STRINGS } from '@/constants';

export interface VendorRFQBannerProps {
  rfqId: string;
  rfqAccepted: boolean;
  activeVendorName: string;
  onAcceptRfq: (rfqId: string) => void;
  onProceedToQuotation: () => void;
}

export const VendorRFQBanner: React.FC<VendorRFQBannerProps> = ({
  rfqId,
  rfqAccepted,
  activeVendorName,
  onAcceptRfq,
  onProceedToQuotation,
}) => {
  const containerClass = rfqAccepted
    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
    : 'bg-gradient-to-r from-purple-900 via-slate-900 to-purple-950 text-white border-purple-700';

  const badgeClass = rfqAccepted
    ? 'bg-emerald-200 text-emerald-900 border border-emerald-400'
    : 'bg-purple-500/30 text-purple-300 border border-purple-400/40';

  const badgeText = rfqAccepted ? UI_STRINGS.vendorPortal.activeBidder : 'Action Required: Participation Invitation';
  const headingText = rfqAccepted ? UI_STRINGS.vendorPortal.rfqAccepted : 'Confirm RFQ Participation & Bidding Acceptance';
  const descText = rfqAccepted
    ? 'Your organization has confirmed participation. You may now submit commercial unit rates in Tab 2.'
    : `Invited Vendor: ${activeVendorName}. Please review package specifications and confirm acceptance to unlock quotation.`;

  return (
    <div className={`p-5 rounded-2xl border shadow-sm transition-all ${containerClass}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
              {badgeText}
            </span>
            <span className="text-xs font-mono font-bold opacity-80">
              Active RFQ ID: <strong>{rfqId}</strong>
            </span>
          </div>
          <h3 className="text-base font-black">{headingText}</h3>
          <p className={`text-xs ${rfqAccepted ? 'text-emerald-800' : 'text-purple-200'} max-w-2xl`}>
            {descText}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {!rfqAccepted ? (
            <button
              type="button"
              onClick={() => onAcceptRfq(rfqId)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{UI_STRINGS.vendorPortal.acceptRfq}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onProceedToQuotation}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>{UI_STRINGS.vendorPortal.proceedToQuotation}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
