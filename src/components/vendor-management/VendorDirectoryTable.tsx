'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { UI_STRINGS } from '@/constants';
import { VendorTableRow } from './VendorTableRow';
import type { ManagedVendor } from '@/types';

interface VendorDirectoryTableProps {
  vendors: ManagedVendor[];
  onOpenEvaluation: (vendor: ManagedVendor) => void;
  onOpenPPORating: (vendor: ManagedVendor) => void;
  onOpenDossier: (vendor: ManagedVendor, initialTab?: 'credibility' | 'rate_card' | 'catalogue') => void;
  onSendInvite: (vendorId: string, email: string) => void;
  onOpenIntimation?: (vendor: ManagedVendor) => void;
}

export const VendorDirectoryTable: React.FC<VendorDirectoryTableProps> = ({
  vendors,
  onOpenEvaluation,
  onOpenPPORating,
  onOpenDossier,
  onSendInvite,
  onOpenIntimation,
}) => {
  if (vendors.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
        <h4 className="text-base font-bold text-slate-800">No Vendors Found</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          No empanelled suppliers match the active search or category filters. Try adjusting your
          criteria or upload existing client contractors.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-blue-50/80 border-b-2 border-blue-200 text-blue-950 text-[11px] uppercase font-bold tracking-wider">
            <tr>
              <th className="py-3.5 px-4 w-[24%]">{UI_STRINGS.vendorManagement.tableColVendor}</th>
              <th className="py-3.5 px-4 w-[18%]">{UI_STRINGS.vendorManagement.tableColCategory}</th>
              <th className="py-3.5 px-4 w-[14%]">{UI_STRINGS.vendorManagement.tableColSource}</th>
              <th className="py-3.5 px-4 w-[14%]">{UI_STRINGS.vendorManagement.tableColRating}</th>
              <th className="py-3.5 px-4 w-[12%]">{UI_STRINGS.vendorManagement.tableColEvaluationStatus}</th>
              <th className="py-3.5 px-4 w-[18%] text-right">{UI_STRINGS.vendorManagement.tableColActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100 text-slate-600">
            {vendors.map((vendor) => (
              <VendorTableRow
                key={vendor.id}
                vendor={vendor}
                onOpenEvaluation={onOpenEvaluation}
                onOpenPPORating={onOpenPPORating}
                onOpenDossier={onOpenDossier}
                onSendInvite={onSendInvite}
                onOpenIntimation={onOpenIntimation}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
