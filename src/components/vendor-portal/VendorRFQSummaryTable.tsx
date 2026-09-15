'use client';

import React from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Inbox,
  Eye,
} from 'lucide-react';
import type { VendorRFQItem } from '@/types';
import { UI_STRINGS } from '@/constants';

export interface VendorRFQSummaryTableProps {
  rfqs: VendorRFQItem[];
  activeRfqId: string;
  acceptedMap: Record<string, boolean>;
  activeVendorName: string;
  onSelectRFQ: (rfqId: string) => void;
  onAcceptRFQ: (rfqId: string) => void;
  onProceedToQuote: (rfqId: string) => void;
}

export const VendorRFQSummaryTable: React.FC<VendorRFQSummaryTableProps> = ({
  rfqs,
  activeRfqId,
  acceptedMap,
  activeVendorName,
  onSelectRFQ,
  onAcceptRFQ,
  onProceedToQuote,
}) => {
  if (rfqs.length === 0) {
    return (
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <Inbox className="w-10 h-10 text-slate-400 mx-auto" />
        <h4 className="text-sm font-bold text-slate-800">{UI_STRINGS.vendorPortal.noRfqsNotice}</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          No RFQ tenders have been issued for <strong>{activeVendorName}</strong> yet. When a Category Manager
          or Project Raiser circulates an RFQ to this vendor, it will display here immediately.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-black text-slate-900">
            {UI_STRINGS.vendorPortal.rfqSummaryTableTitle} ({activeVendorName})
          </h3>
          <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-black px-2 py-0.5 rounded-full">
            {rfqs.length} {rfqs.length === 1 ? 'Tender' : 'Tenders'}
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Click &ldquo;View Scope&rdquo; or &ldquo;Accept&rdquo; to review drawings and submit unit rates.
        </span>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs bg-white">
        <table className="w-full text-left text-xs text-slate-700" data-testid="vendor-rfq-summary-table">
          <thead className="bg-slate-100 font-bold border-b text-slate-800">
            <tr>
              <th className="p-3 w-10 text-center">#</th>
              <th className="p-3 min-w-[120px]">RFQ Ref ID</th>
              <th className="p-3 min-w-[180px]">Project & Site</th>
              <th className="p-3 min-w-[220px]">Package Scope Description</th>
              <th className="p-3 min-w-[130px]">Category</th>
              <th className="p-3 text-center w-20">Items</th>
              <th className="p-3 min-w-[110px]">Deadline</th>
              <th className="p-3 min-w-[130px] text-center">Participation</th>
              <th className="p-3 text-right min-w-[170px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rfqs.map((rfq, idx) => {
              const isSelected = rfq.id === activeRfqId || rfq.prId === activeRfqId;
              const isAccepted = acceptedMap[rfq.id] || acceptedMap[rfq.prId] || false;

              return (
                <tr
                  key={rfq.id}
                  className={`transition-colors cursor-pointer ${
                    isSelected ? 'bg-purple-50/70 font-medium' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => onSelectRFQ(rfq.prId || rfq.id)}
                >
                  <td className="p-3 text-slate-400 text-center font-mono">{idx + 1}</td>
                  <td className="p-3 font-mono font-bold text-purple-900">
                    <span className="bg-purple-100/70 border border-purple-300 px-2 py-0.5 rounded-md">
                      {rfq.id}
                    </span>
                  </td>
                  <td className="p-3">
                    <strong className="text-slate-900 block font-semibold">{rfq.projectName}</strong>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{rfq.site || 'Site Address'}</span>
                  </td>
                  <td className="p-3">
                    <strong className="text-slate-900 block text-xs">{rfq.title}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">Ref: {rfq.prId}</span>
                  </td>
                  <td className="p-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-300">
                      {rfq.category}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-slate-800">
                    {rfq.itemsCount || rfq.items.length}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{rfq.closureDate}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    {isAccepted ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{UI_STRINGS.vendorPortal.activeBidder}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <span>{UI_STRINGS.vendorPortal.pendingAcceptance}</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1.5">
                      {!isAccepted && (
                        <button
                          type="button"
                          onClick={() => onAcceptRFQ(rfq.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-xs cursor-pointer"
                        >
                          {UI_STRINGS.vendorPortal.acceptRfq}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onSelectRFQ(rfq.prId || rfq.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-300 flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{UI_STRINGS.vendorPortal.viewScopeAction}</span>
                      </button>
                      {isAccepted && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectRFQ(rfq.prId || rfq.id);
                            onProceedToQuote(rfq.prId || rfq.id);
                          }}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold shadow-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <span>{UI_STRINGS.vendorPortal.quoteNowAction}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
