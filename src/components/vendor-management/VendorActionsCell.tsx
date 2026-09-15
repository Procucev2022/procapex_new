'use client';

import React from 'react';
import { Award, Star, Mail, Eye } from 'lucide-react';
import { UI_STRINGS } from '@/constants';
import type { ManagedVendor } from '@/types';

interface VendorActionsCellProps {
  vendor: ManagedVendor;
  onOpenEvaluation: (vendor: ManagedVendor) => void;
  onOpenPPORating: (vendor: ManagedVendor) => void;
  onOpenDossier: (vendor: ManagedVendor) => void;
  onSendInvite: (vendorId: string, email: string) => void;
}

export const VendorActionsCell: React.FC<VendorActionsCellProps> = ({
  vendor,
  onOpenEvaluation,
  onOpenPPORating,
  onOpenDossier,
  onSendInvite,
}) => {
  return (
    <td className="py-3.5 px-4 text-right">
      <div className="flex items-center justify-end space-x-2">
        {/* View Dossier */}
        <button
          type="button"
          onClick={() => onOpenDossier(vendor)}
          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
          title="View Credibility Dossier, Brands, OEM Authorizations & References"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Run Evaluation */}
        <button
          type="button"
          onClick={() => onOpenEvaluation(vendor)}
          className="py-1.5 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
          title="Run Automated Category Evaluation & Scoring"
        >
          <Award className="w-3 h-3" />
          <span>{UI_STRINGS.vendorManagement.actionEvaluate}</span>
        </button>

        {/* Rate PPO */}
        <button
          type="button"
          onClick={() => onOpenPPORating(vendor)}
          className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-lg shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
          title="Rate Vendor on an Issued PPO"
        >
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span>{UI_STRINGS.vendorManagement.actionRatePPO}</span>
        </button>

        {vendor.evaluationStatus === 'PENDING_VENDOR_INPUT' && vendor.email && (
          <button
            type="button"
            onClick={() => onSendInvite(vendor.id, vendor.email || '')}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Resend Evaluation Questionnaire Link"
          >
            <Mail className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </td>
  );
};
