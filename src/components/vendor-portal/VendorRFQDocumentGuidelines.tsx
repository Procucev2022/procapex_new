'use client';

import React from 'react';
import { Download, FileCheck, ShieldCheck } from 'lucide-react';

export const VendorRFQDocumentGuidelines: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <h5 className="text-xs font-black text-slate-900 uppercase flex items-center space-x-1.5">
          <Download className="w-3.5 h-3.5 text-sky-600" />
          <span>Attached Engineering Drawings & Specifications</span>
        </h5>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-slate-800">Counter Elevation D Approved Drawing.pdf</span>
            </div>
            <button
              type="button"
              onClick={() => alert('Downloading technical drawing Counter Elevation D...')}
              className="text-[11px] font-bold text-sky-700 hover:text-sky-900 underline cursor-pointer"
            >
              Download
            </button>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-slate-800">Millwork Joinery Technical Scope IS-710.pdf</span>
            </div>
            <button
              type="button"
              onClick={() => alert('Downloading IS-710 Joinery Scope...')}
              className="text-[11px] font-bold text-sky-700 hover:text-sky-900 underline cursor-pointer"
            >
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <h5 className="text-xs font-black text-slate-900 uppercase flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Buyer Commercial Guidelines</span>
        </h5>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li>Pricing basis: <strong>FOR Site (Inclusive of Freight & Transit Insurance)</strong>.</li>
          <li>Standard milestone: <strong>10% Advance | 70% Progress RA | 10% Handover | 10% DLP</strong>.</li>
          <li>Warranty commitment: <strong>12 Months DLP + 24 Months Hardware Guarantee</strong>.</li>
          <li>Target delivery timeline: Within <strong>12 to 15 Calendar Days</strong> from PO award.</li>
        </ul>
      </div>
    </div>
  );
};
