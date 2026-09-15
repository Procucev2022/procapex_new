'use client';

import React from 'react';
import { VendorDetailsCell } from './VendorDetailsCell';
import { VendorCategoryBadge } from './VendorCategoryBadge';
import { VendorSourceBadge } from './VendorSourceBadge';
import { VendorRatingsCell } from './VendorRatingsCell';
import { VendorStatusBadge } from './VendorStatusBadge';
import { VendorActionsCell } from './VendorActionsCell';
import type { ManagedVendor } from '@/types';

interface VendorTableRowProps {
  vendor: ManagedVendor;
  onOpenEvaluation: (vendor: ManagedVendor) => void;
  onOpenPPORating: (vendor: ManagedVendor) => void;
  onOpenDossier: (vendor: ManagedVendor) => void;
  onSendInvite: (vendorId: string, email: string) => void;
}

export const VendorTableRow: React.FC<VendorTableRowProps> = ({
  vendor,
  onOpenEvaluation,
  onOpenPPORating,
  onOpenDossier,
  onSendInvite,
}) => {
  const isClientBoarded = vendor.source === 'CLIENT_ONBOARDED';

  return (
    <tr
      className={`transition-colors ${
        isClientBoarded
          ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-emerald-500'
          : 'hover:bg-slate-50/80 border-l-4 border-l-sky-500'
      }`}
    >
      <VendorDetailsCell vendor={vendor} />

      <td className="py-3.5 px-4">
        <VendorCategoryBadge vendor={vendor} />
      </td>

      <td className="py-3.5 px-4">
        <VendorSourceBadge source={vendor.source} tenantName={vendor.tenantName} />
      </td>

      <VendorRatingsCell vendor={vendor} />

      <td className="py-3.5 px-4">
        <VendorStatusBadge status={vendor.evaluationStatus} />
      </td>

      <VendorActionsCell
        vendor={vendor}
        onOpenEvaluation={onOpenEvaluation}
        onOpenPPORating={onOpenPPORating}
        onOpenDossier={onOpenDossier}
        onSendInvite={onSendInvite}
      />
    </tr>
  );
};
