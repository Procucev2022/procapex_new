'use client';

import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { STANDARD_MASTER_RATE_CARDS } from '@/constants';

export const MastersAudit: React.FC = () => {
  const { auditLogs } = useProcurement();

  const masters = STANDARD_MASTER_RATE_CARDS;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Cost Centre Masters & Immutable Audit Trail</h2>
        <p className="text-xs text-slate-500">Configure master data (Cost centres, categories, standard rate cards) and review tamper-proof event logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Master Rate Cards */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <Database className="w-4 h-4 text-sky-600 mr-2" />
              Standard Master Rate Cards (FR-01)
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">Active FY 2026-27</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Item Code</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Standard Rate</th>
                  <th className="p-2.5">UOM</th>
                  <th className="p-2.5">Region</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {masters.map((m, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-mono font-bold text-slate-800">{m.code}</td>
                    <td className="p-2.5 text-slate-600">{m.cat}</td>
                    <td className="p-2.5 font-bold text-sky-800 font-mono">{m.rate}</td>
                    <td className="p-2.5 text-slate-600">{m.uom}</td>
                    <td className="p-2.5 text-slate-500">{m.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Immutable Audit Trail */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2" />
              Immutable Audit Trail (Section 10)
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Tamper-Proof</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {auditLogs.map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                </div>
                <p className="text-slate-600 mt-1">{log.detail}</p>
                <span className="inline-block mt-1.5 text-[10px] font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                  User: {log.user}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
