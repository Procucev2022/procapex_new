'use client';

import React from 'react';
import { FileCheck2, Award, Clock } from 'lucide-react';
import { UI_STRINGS } from '@/constants';
import type { EvaluationStatus } from '@/types';

interface VendorStatusBadgeProps {
  status: EvaluationStatus;
}

export const VendorStatusBadge: React.FC<VendorStatusBadgeProps> = ({ status }) => {
  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <FileCheck2 className="w-3 h-3 mr-1 text-emerald-600" />
        {UI_STRINGS.vendorManagement.statusVerified}
      </span>
    );
  }

  if (status === 'UNDER_EVALUATION') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
        <Award className="w-3 h-3 mr-1 text-amber-600" />
        {UI_STRINGS.vendorManagement.statusUnderEvaluation}
      </span>
    );
  }

  if (status === 'PENDING_VENDOR_INPUT') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
        <Clock className="w-3 h-3 mr-1 text-slate-500" />
        {UI_STRINGS.vendorManagement.statusPendingInput}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
      {UI_STRINGS.vendorManagement.statusRejected}
    </span>
  );
};
