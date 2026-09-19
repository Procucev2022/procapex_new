'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  PlusCircle,
  Building2,
} from 'lucide-react';
import type { PurchaseRequest, VendorRFQItem } from '@/types';

export interface PRHistoryTableProps {
  prs: PurchaseRequest[];
  circulatedRFQs?: Record<string, VendorRFQItem>;
  onSelectPRForBOQ?: (prId: string) => void;
  onNavigateToBOQ?: (prId: string) => void;
  onApprovePR?: (prId: string) => void;
  onStartNewPR?: () => void;
  activePRId?: string;
}

export const PRHistoryTable: React.FC<PRHistoryTableProps> = ({
  prs,
  circulatedRFQs,
  onSelectPRForBOQ,
  onNavigateToBOQ,
  onApprovePR,
  onStartNewPR,
  activePRId,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const set = new Set<string>();
    prs.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [prs]);

  const filteredPRs = useMemo(() => {
    return prs.filter((pr) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        pr.id.toLowerCase().includes(q) ||
        pr.title.toLowerCase().includes(q) ||
        (pr.projectName && pr.projectName.toLowerCase().includes(q)) ||
        (pr.requester && pr.requester.toLowerCase().includes(q));

      const matchCat =
        selectedCategory === 'ALL' ||
        pr.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchSearch && matchCat;
    });
  }, [prs, searchTerm, selectedCategory]);

  const handleOpenPRInHub = (prId: string): void => {
    onSelectPRForBOQ?.(prId);
    onNavigateToBOQ?.(prId);
  };

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <span>Package Pipeline &amp; Scope History</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time auditable registry of all scoped procurement packages,
            technical approvals, and tender dispatch statuses.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-mono font-bold px-3 py-1 bg-purple-100 text-purple-900 rounded-full border border-purple-200">
            {prs.length} Packages in Registry
          </span>
          {onStartNewPR && (
            <button
              type="button"
              onClick={onStartNewPR}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New BOQ Package</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Package ID, Title, Project, or Requester..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-900"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
        >
          <option value="ALL">All Categories ({prs.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-blue-200 rounded-xl shadow-xs bg-white">
        <table className="w-full text-left text-xs text-slate-700" data-testid="pr-history-table">
          <thead className="bg-blue-50/80 font-bold border-b-2 border-blue-200 text-blue-950">
            <tr>
              <th className="p-3 w-10 text-center">#</th>
              <th className="p-3 min-w-[130px]">Package ID</th>
              <th className="p-3 min-w-[200px]">Package Title &amp; Project</th>
              <th className="p-3 min-w-[150px]">Scope Lead &amp; Date</th>
              <th className="p-3 min-w-[130px]">Cost Centre &amp; Cat</th>
              <th className="p-3 text-center w-24">Items</th>
              <th className="p-3 text-right min-w-[120px]">Est. Baseline</th>
              <th className="p-3 min-w-[160px] text-center">Tender Status</th>
              <th className="p-3 text-center min-w-[120px]">Approval</th>
              <th className="p-3 text-right min-w-[160px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            {filteredPRs.map((pr, idx) => {
              const isActive = pr.id === activePRId;
              const suffix = pr.id.split('-')[2] ?? '0005';
              const rfqId = `RFQ-2026-${suffix}`;
              const hasCirculatedRFQ = Boolean(
                circulatedRFQs?.[pr.id] || circulatedRFQs?.[rfqId]
              );
              const estBaseline = pr.items?.reduce(
                (acc, it) => acc + (it.rateCard ?? it.benchmark ?? it.std ?? 1500) * it.qty,
                0
              ) ?? 0;

              return (
                <tr
                  key={pr.id}
                  className={`transition-colors ${
                    isActive ? 'bg-purple-50/70 font-medium' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="p-3 text-slate-400 text-center font-mono">{idx + 1}</td>
                  <td className="p-3 font-mono font-bold text-sky-800">
                    <span className="bg-sky-100 text-sky-900 border border-sky-300 px-2 py-0.5 rounded-md">
                      {pr.id}
                    </span>
                  </td>
                  <td className="p-3">
                    <strong className="text-slate-900 block font-semibold">{pr.title}</strong>
                    <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{pr.projectName ?? 'Godrej Woods, Tower C'}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{pr.requester ?? 'Rahul Verma'}</div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{pr.reqDate ?? '2026-09-25'}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800 block">{pr.costCentre ?? 'CC-104'}</span>
                    <span className="text-[10px] text-slate-500 font-sans">{pr.category ?? 'Interior'}</span>
                  </td>
                  <td className="p-3 text-center font-bold font-mono">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                      {pr.items?.length ?? 0} Items
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    ₹ {estBaseline.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    {hasCirculatedRFQ ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Tender Circulated ({rfqId})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <span>Ready to Dispatch</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                      {pr.status ?? 'SUBMITTED'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center justify-end space-x-1.5">
                      {pr.status === 'SUBMITTED' && onApprovePR && (
                        <button
                          type="button"
                          onClick={() => onApprovePR(pr.id)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-xs transition-all cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenPRInHub(pr.id)}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold shadow-xs inline-flex items-center space-x-1 transition-all cursor-pointer"
                      >
                        <span>Open in RFQ Hub</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
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
