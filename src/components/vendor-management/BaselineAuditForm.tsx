'use client';

import React from 'react';
import { Landmark, Factory, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { BaselineEvaluationData } from '@/types';

interface BaselineAuditFormProps {
  data: BaselineEvaluationData;
  onChange: (updated: BaselineEvaluationData) => void;
}

export const BaselineAuditForm: React.FC<BaselineAuditFormProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4 text-xs">
      {/* Pillar 1: Financial Strength */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <h4 className="font-bold text-slate-900 flex items-center text-xs">
          <Landmark className="w-4 h-4 mr-2 text-sky-600" />
          Pillar 1: Financial Strength & Solvency (Max 20 Pts)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold">Annual Turnover (₹ Crores)</label>
            <input
              type="number"
              min="0"
              step="1"
              required
              value={data.turnoverCr}
              onChange={(e) => onChange({ ...data, turnoverCr: Number(e.target.value) })}
              className="w-full border rounded-xl p-2 bg-white border-slate-200 font-bold text-slate-800"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold">Solvency Bank Name</label>
            <input
              type="text"
              required
              value={data.solvencyBankName}
              onChange={(e) => onChange({ ...data, solvencyBankName: e.target.value })}
              className="w-full border rounded-xl p-2 bg-white border-slate-200"
            />
          </div>
          <div className="flex items-center space-x-2 pt-5">
            <input
              type="checkbox"
              id="auditedBalanceSheet"
              checked={data.auditedBalanceSheet}
              onChange={(e) => onChange({ ...data, auditedBalanceSheet: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300 cursor-pointer"
            />
            <label htmlFor="auditedBalanceSheet" className="text-slate-700 font-semibold cursor-pointer">
              Audited Balance Sheet (+4 pts)
            </label>
          </div>
        </div>
      </div>

      {/* Pillar 2: Operational Capacity */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <h4 className="font-bold text-slate-900 flex items-center text-xs">
          <Factory className="w-4 h-4 mr-2 text-indigo-600" />
          Pillar 2: Operational & Manufacturing Capacity (Max 25 Pts)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold">Monthly Units Output Capacity</label>
            <input
              type="number"
              min="0"
              required
              value={data.factoryCapacityUnitsPerMonth}
              onChange={(e) =>
                onChange({ ...data, factoryCapacityUnitsPerMonth: Number(e.target.value) })
              }
              className="w-full border rounded-xl p-2 bg-white border-slate-200"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold">Active Production Machinery</label>
            <input
              type="number"
              min="0"
              required
              value={data.machineryCount}
              onChange={(e) => onChange({ ...data, machineryCount: Number(e.target.value) })}
              className="w-full border rounded-xl p-2 bg-white border-slate-200"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold">Technical Workforce Strength</label>
            <input
              type="number"
              min="0"
              required
              value={data.workforceCount}
              onChange={(e) => onChange({ ...data, workforceCount: Number(e.target.value) })}
              className="w-full border rounded-xl p-2 bg-white border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Pillar 3: Quality Systems */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <h4 className="font-bold text-slate-900 flex items-center text-xs">
          <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" />
          Pillar 3: Quality Systems & Track Record (Max 20 Pts)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center space-x-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.isoCertified}
              onChange={(e) => onChange({ ...data, isoCertified: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300"
            />
            <span className="text-slate-700 font-semibold">ISO 9001/14001 (+8 pts)</span>
          </label>
          <label className="flex items-center space-x-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.qcLabInHouse}
              onChange={(e) => onChange({ ...data, qcLabInHouse: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300"
            />
            <span className="text-slate-700 font-semibold">In-House QC Lab (+6 pts)</span>
          </label>
          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold">Completed Projects Count</label>
            <input
              type="number"
              min="0"
              required
              value={data.pastProjectsCompleted}
              onChange={(e) => onChange({ ...data, pastProjectsCompleted: Number(e.target.value) })}
              className="w-full border rounded-xl p-2 bg-white border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Pillar 4: Statutory & ESG Compliance */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <h4 className="font-bold text-slate-900 flex items-center text-xs">
          <CheckCircle2 className="w-4 h-4 mr-2 text-teal-600" />
          Pillar 4: Statutory, Tax & Safety Compliance (Max 15 Pts)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.gstinFilingCompliant}
              onChange={(e) => onChange({ ...data, gstinFilingCompliant: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300"
            />
            <span className="text-slate-700 font-semibold">Verified GSTIN & Returns (+8 pts)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.safetyPolicyCompliant}
              onChange={(e) => onChange({ ...data, safetyPolicyCompliant: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300"
            />
            <span className="text-slate-700 font-semibold">OSHA & EHS Safety Audit (+7 pts)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
