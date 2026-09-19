'use client';

import React from 'react';
import { FileCheck2 } from 'lucide-react';
import type { VendorQuotedTerms } from '@/types';

interface VendorQuotedTermsFormProps {
  terms: VendorQuotedTerms;
  onChange: (terms: VendorQuotedTerms) => void;
  title?: string;
  badge?: string;
}

export const VendorQuotedTermsForm: React.FC<VendorQuotedTermsFormProps> = ({
  terms,
  onChange,
  title = 'Quoted Terms & Conditions (Payment, Delivery & Commercial Clauses)',
  badge = 'Editable Commercial Terms',
}) => {
  const handlePaymentPreset = (preset: string): void => {
    let adv = '10%';
    let ret = '10%';
    let cred = '30 Days Net';
    if (preset === 'PRESET_2') {
      adv = '15%';
      ret = '10%';
      cred = '30 Days Net';
    } else if (preset === 'PRESET_3') {
      adv = '0%';
      ret = '5%';
      cred = '30 Days Net';
    } else if (preset === 'PRESET_4') {
      adv = '0%';
      ret = '5%';
      cred = '45 Days Net';
    } else if (preset === 'PRESET_5') {
      adv = '10%';
      ret = '10%';
      cred = '30 Days Net';
    }
    onChange({ ...terms, paymentStructure: preset, advPct: adv, retPct: ret, creditDays: cred });
  };

  return (
    <div className="bg-slate-50/90 rounded-2xl border border-slate-200 p-5 space-y-5">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Part B: {title} :*</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Customize payment milestones, delivery lead times, and warranty terms for your quote submission.
          </p>
        </div>
        <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200">
          {badge}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="md:col-span-2 space-y-1.5">
          <label className="block font-bold text-slate-800">Quoted Payment Milestone Formula :</label>
          <select
            value={terms.paymentStructure}
            onChange={(e) => handlePaymentPreset(e.target.value)}
            className="w-full bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-400"
          >
            <option value="PRESET_1">
              10% Advance | 70% Progress RA | 10% Handover | 10% DLP (30D Credit) [Target Baseline Standard]
            </option>
            <option value="PRESET_2">
              15% Advance | 75% Progress RA | 10% DLP (30D Credit) [Fast Track / Tooling Mobilization]
            </option>
            <option value="PRESET_3">
              30 Days Net Credit from GRN / Site Delivery (0% Advance, 5% Retention) [Credit Standard]
            </option>
            <option value="PRESET_4">
              45 Days Net Credit from Invoice Submission (0% Advance, 5% Retention) [Enterprise Credit]
            </option>
            <option value="PRESET_5">
              10% Advance | 80% Supply & Erection | 10% Retention (30D Credit) [Master Rate Card]
            </option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block font-bold text-slate-800">Credit Days from Certification :</label>
          <input
            type="text"
            value={terms.creditDays}
            onChange={(e) => onChange({ ...terms, creditDays: e.target.value })}
            className="w-full bg-white font-mono font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-800">Advance Payment (%):</label>
          <input
            type="text"
            value={terms.advPct}
            onChange={(e) => onChange({ ...terms, advPct: e.target.value })}
            className="w-full bg-white font-mono font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-800">Retention / DLP Withholding (%):</label>
          <input
            type="text"
            value={terms.retPct}
            onChange={(e) => onChange({ ...terms, retPct: e.target.value })}
            className="w-full bg-white font-mono font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-800">Advance Bank Guarantee (ABG):</label>
          <select
            value={terms.abg}
            onChange={(e) => onChange({ ...terms, abg: e.target.value })}
            className="w-full bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
          >
            <option value="YES">Yes - ABG Submitted for Advance &gt; 10%</option>
            <option value="NO">No - Not Applicable for Empanelled Vendor</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-200">
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-800">Committed Delivery Lead Time :</label>
          <input
            type="text"
            value={terms.leadTime}
            onChange={(e) => onChange({ ...terms, leadTime: e.target.value })}
            className="w-full bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-800">Expected Site Handover Date :</label>
          <input
            type="date"
            value={terms.deliveryDate}
            onChange={(e) => onChange({ ...terms, deliveryDate: e.target.value })}
            className="w-full bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-800">Quoted Price Basis / IncoTerms :</label>
          <select
            value={terms.incoterms}
            onChange={(e) => onChange({ ...terms, incoterms: e.target.value })}
            className="w-full bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
          >
            <option value="FOR_SITE">FOR Site (Freight, Packing, Handling & Transit Insurance Included)</option>
            <option value="EX_WORKS">Ex-Works Factory (Client Arranges Logistics)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200">
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-800">Warranty & DLP Coverage :</label>
          <input
            type="text"
            value={terms.warranty}
            onChange={(e) => onChange({ ...terms, warranty: e.target.value })}
            className="w-full bg-white text-slate-800 border border-slate-300 rounded-lg px-3 py-2 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-800">Commercial Deviations / Specific Scope Notes :</label>
          <textarea
            rows={2}
            value={terms.deviations}
            onChange={(e) => onChange({ ...terms, deviations: e.target.value })}
            className="w-full bg-white text-slate-800 border border-slate-300 rounded-lg px-3 py-2 text-xs"
            placeholder="Specify any technical exceptions, commercial concessions, variances, or scope notes..."
          />
        </div>
      </div>
    </div>
  );
};
