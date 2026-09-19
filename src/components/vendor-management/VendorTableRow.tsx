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
  onOpenDossier: (vendor: ManagedVendor, initialTab?: 'credibility' | 'rate_card' | 'catalogue') => void;
  onSendInvite: (vendorId: string, email: string) => void;
  onOpenIntimation?: (vendor: ManagedVendor) => void;
}

export const VendorTableRow: React.FC<VendorTableRowProps> = ({
  vendor,
  onOpenEvaluation,
  onOpenPPORating,
  onOpenDossier,
  onSendInvite,
  onOpenIntimation,
}) => {
  const isClientBoarded = vendor.source === 'CLIENT_ONBOARDED';

  return (
    <tr
      className={`transition-colors border-b border-blue-100 align-middle ${
        isClientBoarded
          ? 'bg-emerald-50/30 hover:bg-emerald-50/60 border-l-4 border-l-emerald-500'
          : 'hover:bg-blue-50/40 border-l-4 border-l-sky-500'
      }`}
    >
      <VendorDetailsCell vendor={vendor} onOpenDossier={onOpenDossier} />

      <td className="py-3.5 px-4 align-middle">
        <VendorCategoryBadge
          vendor={vendor}
          onOpenRateCardTab={() => onOpenDossier(vendor, 'rate_card')}
        />
      </td>

      <td className="py-3.5 px-4 align-middle">
        <VendorSourceBadge source={vendor.source} tenantName={vendor.tenantName} />
      </td>

      <VendorRatingsCell vendor={vendor} />

      <td className="py-3.5 px-4 align-middle">
        <VendorStatusBadge status={vendor.evaluationStatus} />
      </td>

      <VendorActionsCell
        vendor={vendor}
        onOpenEvaluation={onOpenEvaluation}
        onOpenPPORating={onOpenPPORating}
        onOpenDossier={onOpenDossier}
        onSendInvite={onSendInvite}
        onOpenIntimation={onOpenIntimation}
      />
    </tr>
  );
};
