'use client';

import React, { useMemo } from 'react';
import {
  FileText,
  Clock,
  ArrowRight,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import type { VendorRFQItem, PurchaseRequest } from '@/types';

export interface RFQCirculationHistoryTableProps {
  circulatedRFQs?: Record<string, VendorRFQItem>;
  prs?: PurchaseRequest[];
  activePRId: string;
  onSelectPR: (prId: string) => void;
  onOpenCommercialTab?: (prId: string) => void;
}

export const RFQCirculationHistoryTable: React.FC<RFQCirculationHistoryTableProps> = ({
  circulatedRFQs,
  prs,
  activePRId,
  onSelectPR,
  onOpenCommercialTab,
}) => {
  const rfqList: VendorRFQItem[] = useMemo(() => {
    const list: VendorRFQItem[] = [];
    const seenIds = new Set<string>();

    if (circulatedRFQs) {
      Object.values(circulatedRFQs).forEach((rfq) => {
        if (!seenIds.has(rfq.id)) {
          list.push(rfq);
          seenIds.add(rfq.id);
        }
      });
    }

    if (prs) {
      prs.forEach((pr) => {
        const suffix = pr.id.split('-')[2] ?? '0005';
        const rfqId = `RFQ-2026-${suffix}`;
        if (!seenIds.has(rfqId) && pr.nominatedVendors && pr.nominatedVendors.length > 0) {
          list.push({
            id: rfqId,
            prId: pr.id,
            title: pr.title,
            projectName: pr.projectName ?? 'Godrej Woods, Tower C',
            category: pr.category,
            closureDate: pr.reqDate ?? '2026-09-28',
            site: pr.deliveryAddress ?? 'Tower C Reception Lobby, Godrej Woods, Sector 43, Noida',
            invitedVendors: pr.nominatedVendors,
            status: 'PENDING',
            itemsCount: pr.items?.length ?? 0,
            items: pr.items ?? [],
          });
          seenIds.add(rfqId);
        }
      });
    }

    return list;
  }, [circulatedRFQs, prs]);

  if (rfqList.length === 0) {
    return null;
  }

  const handleOpenWorkspace = (prId: string): void => {
    onSelectPR(prId);
    onOpenCommercialTab?.(prId);
  };

  return (
    <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-black text-slate-900">
            Tender RFQ Circulation Registry &amp; Raised Tender History
          </h3>
          <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-black px-2 py-0.5 rounded-full">
            {rfqList.length} {rfqList.length === 1 ? 'Tender Raised' : 'Tenders Raised'}
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Click &ldquo;Open Workspace&rdquo; on any RFQ to load its commercial matrix and evaluate vendor quotations.
        </span>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
        <table className="w-full text-left text-xs text-slate-700" data-testid="rfq-circulation-history-table">
          <thead className="bg-slate-100 font-bold border-b text-slate-800">
            <tr>
              <th className="p-3 w-10 text-center">#</th>
              <th className="p-3 min-w-[120px]">RFQ ID</th>
              <th className="p-3 min-w-[110px]">Package Ref</th>
              <th className="p-3 min-w-[220px]">Package Scope Description</th>
              <th className="p-3 min-w-[160px]">Project &amp; Location</th>
              <th className="p-3 min-w-[160px]">Invited Vendors</th>
              <th className="p-3 min-w-[110px]">Deadline</th>
              <th className="p-3 text-center w-20">Items</th>
              <th className="p-3 text-center min-w-[120px]">Status</th>
              <th className="p-3 text-right min-w-[150px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rfqList.map((rfq, idx) => {
              const isSelected = rfq.id === activePRId || rfq.prId === activePRId;

              return (
                <tr
                  key={rfq.id}
                  className={`transition-colors ${
                    isSelected ? 'bg-purple-50/70 font-medium' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="p-3 text-slate-400 text-center font-mono">{idx + 1}</td>
                  <td className="p-3 font-mono font-bold text-purple-900">
                    <span className="bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-md">
                      {rfq.id}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-sky-800">
                    <span className="bg-sky-50 text-sky-900 border border-sky-200 px-1.5 py-0.5 rounded">
                      {rfq.prId}
                    </span>
                  </td>
                  <td className="p-3">
                    <strong className="text-slate-900 block font-semibold">{rfq.title}</strong>
                    <span className="text-[10px] text-slate-500 font-sans">{rfq.category}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-1 text-slate-800 font-semibold">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{rfq.projectName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{rfq.site}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {rfq.invitedVendors && rfq.invitedVendors.length > 0 ? (
                        rfq.invitedVendors.map((v) => (
                          <span
                            key={v}
                            className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-300 font-bold"
                          >
                            {v}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No suppliers nominated</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{rfq.closureDate}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-slate-800">
                    {rfq.itemsCount ?? rfq.items?.length ?? 0}
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Tender Active</span>
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenWorkspace(rfq.prId ?? rfq.id)}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold shadow-xs inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
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
