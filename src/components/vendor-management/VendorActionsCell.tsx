'use client';

import React from 'react';
import { Award, Star, Mail, Send, Layers, Eye } from 'lucide-react';
import { UI_STRINGS } from '@/constants';
import type { ManagedVendor } from '@/types';

interface VendorActionsCellProps {
  vendor: ManagedVendor;
  onOpenEvaluation: (vendor: ManagedVendor) => void;
  onOpenPPORating: (vendor: ManagedVendor) => void;
  onOpenDossier: (vendor: ManagedVendor, initialTab?: 'credibility' | 'catalogue') => void;
  onSendInvite: (vendorId: string, email: string) => void;
  onOpenIntimation?: (vendor: ManagedVendor) => void;
}

export const VendorActionsCell: React.FC<VendorActionsCellProps> = ({
  vendor,
  onOpenEvaluation,
  onOpenPPORating,
  onOpenDossier,
  onSendInvite,
  onOpenIntimation,
}) => {
  return (
    <td className="py-2.5 px-4 text-right align-middle">
      <div className="flex flex-col items-end gap-1.5 min-w-[240px] ml-auto">
        {/* Tier 1: Catalogue Pricing, Intimation & Dossier Link */}
        <div className="flex items-center justify-end gap-1.5 w-full">
          {/* Catalogue Pricing */}
          <button
            type="button"
            onClick={() => onOpenDossier(vendor, 'catalogue')}
            className="h-7 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[11px] rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
            title="View & Edit Standard BOQ Catalogue Pricing for this vendor"
          >
            <Layers className="w-3 h-3 text-blue-600 shrink-0" />
            <span>Catalogue Pricing</span>
          </button>

          {/* Send Intimation */}
          <button
            type="button"
            onClick={() => onOpenIntimation?.(vendor)}
            className="h-7 px-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-[11px] rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
            title="Send Intimation to update Standard BOQ Catalogue Price within fixed timelines"
          >
            <Send className="w-3 h-3 text-sky-600 shrink-0" />
            <span>Send Intimation</span>
          </button>

          {/* View Credibility Dossier */}
          <button
            type="button"
            onClick={() => onOpenDossier(vendor, 'credibility')}
            className="h-7 w-7 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer shrink-0"
            title="View Credibility Dossier"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {vendor.evaluationStatus === 'PENDING_VENDOR_INPUT' && vendor.email && (
            <button
              type="button"
              onClick={() => onSendInvite(vendor.id, vendor.email || '')}
              className="h-7 w-7 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Resend Evaluation Questionnaire Link"
            >
              <Mail className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tier 2: Evaluation Scoring & PPO Rating */}
        <div className="flex items-center justify-end gap-1.5 w-full">
          {/* Run Evaluation */}
          <button
            type="button"
            onClick={() => onOpenEvaluation(vendor)}
            className="h-7 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11px] rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
            title="Run Automated Category Evaluation & Scoring"
          >
            <Award className="w-3 h-3 text-amber-700 shrink-0" />
            <span>{UI_STRINGS.vendorManagement.actionEvaluate}</span>
          </button>

          {/* Rate PPO */}
          <button
            type="button"
            onClick={() => onOpenPPORating(vendor)}
            className="h-7 px-2.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-blue-200 font-bold text-[11px] rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
            title="Rate Vendor on an Issued PPO"
          >
            <Star className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
            <span>{UI_STRINGS.vendorManagement.actionRatePPO}</span>
          </button>
        </div>
      </div>
    </td>
  );
};

