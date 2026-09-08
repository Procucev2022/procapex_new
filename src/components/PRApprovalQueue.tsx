'use client';

import React from 'react';
import { CheckSquare, CheckCircle2 } from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import type { PRApprovalQueueProps } from '@/types';
import { UI_STRINGS } from '@/constants';

export const PRApprovalQueue: React.FC<PRApprovalQueueProps> = ({ onRouteToCategoryManager }) => {
  const { prs, activeTenant, approvePRByProjectHead, setActiveRole } = useProcurement();

  const handleApprove = (prId: string): void => {
    approvePRByProjectHead(prId);
    setActiveRole('CATEGORY_MANAGER');
    if (onRouteToCategoryManager) {
      onRouteToCategoryManager();
    }
  };

  const pendingPRs = prs.filter(p => p.status === 'SUBMITTED' || p.status === 'PENDING_APPROVAL');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white rounded-2xl p-6 shadow-sm border border-amber-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
              Role 2: Project Head (Technical Approver)
            </span>
            <h1 className="text-2xl font-black mt-1">{UI_STRINGS.prApprovalQueue.title}</h1>
            <p className="text-xs text-amber-200 mt-1">
              {UI_STRINGS.prApprovalQueue.subtitle}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-amber-300 block">Current Tenant</span>
            <span className="font-extrabold text-sm text-white">{activeTenant.name}</span>
          </div>
        </div>
      </div>

      {/* PR Approvals Queue Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-amber-600" />
            <span>Pending PR Approvals Queue</span>
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
            {pendingPRs.length} Requisition{pendingPRs.length !== 1 ? 's' : ''} Awaiting Authorization
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 font-bold border-b border-slate-200 text-slate-800">
              <tr>
                <th className="p-3">PR Number</th>
                <th className="p-3">Requisition Title & Project</th>
                <th className="p-3">Raiser (Project Team)</th>
                <th className="p-3">Cost Centre</th>
                <th className="p-3 text-center">BOQ Items</th>
                <th className="p-3 text-center">Docs</th>
                <th className="p-3">Current Status</th>
                <th className="p-3 text-right">Project Head Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {prs.map((pr) => {
                const isPending = pr.status === 'SUBMITTED' || pr.status === 'PENDING_APPROVAL';
                return (
                  <tr key={pr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-sky-800">{pr.id}</td>
                    <td className="p-3 font-medium">
                      <div className="font-bold text-slate-900">{pr.title}</div>
                      <div className="text-[11px] text-slate-500">{pr.projectName}</div>
                    </td>
                    <td className="p-3">{pr.requester}</td>
                    <td className="p-3 font-mono text-[11px]">{pr.costCentre}</td>
                    <td className="p-3 text-center font-bold font-mono">{pr.items?.length || 0} Items</td>
                    <td className="p-3 text-center font-bold text-purple-700 font-mono">4 Docs</td>
                    <td className="p-3">
                      {isPending ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                          {UI_STRINGS.prApprovalQueue.pendingBadge}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">
                          {pr.status}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {isPending ? (
                        <button
                          onClick={() => handleApprove(pr.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm inline-flex items-center space-x-1.5 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{UI_STRINGS.prApprovalQueue.approveButton}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 italic">
                          {UI_STRINGS.prApprovalQueue.approvedBadge}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
