'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import type { VendorRFQSummaryTabProps, VendorRFQItem } from '@/types';
import { UI_STRINGS } from '@/constants';
import { VendorRFQSummaryTable } from './VendorRFQSummaryTable';
import { VendorRFQBanner } from './VendorRFQBanner';
import { VendorRFQDetailsCard } from './VendorRFQDetailsCard';
import { VendorRFQDocumentGuidelines } from './VendorRFQDocumentGuidelines';

interface RFQDisplayMeta {
  displayProject: string;
  displaySite: string;
  displayPackage: string;
  displayCategory: string;
  displayDeadline: string;
}

const getDisplayMeta = (item?: VendorRFQItem): RFQDisplayMeta => ({
  displayProject: item?.projectName ?? 'Godrej Woods, Tower C',
  displaySite: item?.site ?? 'Sector 43, Noida, Uttar Pradesh',
  displayPackage: item?.title ?? 'Reception Counter Fabrication (Drawing: Counter Elevation D)',
  displayCategory: item?.category ?? 'Interior & Fitouts',
  displayDeadline: item?.closureDate ?? '15-Sep-2026 18:00 IST',
});

const getAcceptedMap = (
  rfqId: string,
  rfqAccepted: boolean,
  activeItem?: VendorRFQItem
): Record<string, boolean> => {
  const map: Record<string, boolean> = { [rfqId]: rfqAccepted };
  if (activeItem) {
    map[activeItem.id] = rfqAccepted;
    map[activeItem.prId] = rfqAccepted;
  }
  return map;
};

export const VendorRFQSummaryTab: React.FC<VendorRFQSummaryTabProps> = ({
  rfqId,
  rfqAccepted,
  onAcceptRfq,
  onProceedToQuotation,
  items,
  activeVendorName,
  allVendorRFQs,
  onSelectRFQ,
  activeRFQItem,
}) => {
  const meta = getDisplayMeta(activeRFQItem);
  const acceptedMap = getAcceptedMap(rfqId, rfqAccepted, activeRFQItem);

  return (
    <div className="space-y-6 pt-4">
      {/* 1. MASTER RFQ SUMMARY TABLE OF ALL RFQS ISSUED TO THIS VENDOR */}
      {Boolean(allVendorRFQs && allVendorRFQs.length > 0) && (
        <VendorRFQSummaryTable
          rfqs={allVendorRFQs ?? []}
          activeRfqId={rfqId}
          acceptedMap={acceptedMap}
          activeVendorName={activeVendorName}
          onSelectRFQ={(selectedId) => onSelectRFQ?.(selectedId)}
          onAcceptRFQ={() => onAcceptRfq(rfqId)}
          onProceedToQuote={onProceedToQuotation}
        />
      )}

      {/* 2. ACTIVE RFQ ACCEPTANCE STATUS & ACTION PROVISION BANNER */}
      <VendorRFQBanner
        rfqId={rfqId}
        rfqAccepted={rfqAccepted}
        activeVendorName={activeVendorName}
        onAcceptRfq={onAcceptRfq}
        onProceedToQuotation={onProceedToQuotation}
      />

      {/* 3. ACTIVE RFQ PACKAGE SPECIFICATIONS & REQUISITION DETAILS */}
      <VendorRFQDetailsCard
        displayProject={meta.displayProject}
        displaySite={meta.displaySite}
        displayCategory={meta.displayCategory}
        displayPackage={meta.displayPackage}
        displayDeadline={meta.displayDeadline}
      />

      {/* 4. ITEM-WISE BOQ SCOPE TABLE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>{UI_STRINGS.vendorPortal.scopeSpecTitle}</span>
          </h4>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            {items.length} Scope Items
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 font-bold border-b text-slate-800">
              <tr>
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3 w-36">Item Code</th>
                <th className="p-3">Scope Description & Specifications</th>
                <th className="p-3 w-20 text-center">UOM</th>
                <th className="p-3 w-28 text-right font-mono">Required Qty</th>
                <th className="p-3 w-32 text-center">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {items.map((it, idx) => (
                <tr key={`${it.code}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-slate-400 text-center">{idx + 1}</td>
                  <td className="p-3 font-mono font-bold text-sky-800 text-[11px]">{it.code}</td>
                  <td className="p-3 font-sans">
                    <strong className="text-slate-900 block font-semibold">{it.desc}</strong>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Spec: IS Standard • Drawing Attached
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-700">{it.uom}</td>
                  <td className="p-3 text-right font-black text-slate-900">{it.qty}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Standard Spec
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. TECHNICAL DOCUMENTS & BUYER GUIDELINES */}
      <VendorRFQDocumentGuidelines />
    </div>
  );
};
