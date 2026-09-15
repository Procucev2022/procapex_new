'use client';

import React from 'react';
import { Check, CheckCircle2, Download } from 'lucide-react';
import type { VendorPPOAwardTabProps } from '@/types';
import { UI_STRINGS } from '@/constants';

export const VendorPPOAwardTab: React.FC<VendorPPOAwardTabProps> = ({
  ppoAccepted,
  onAcceptPPO,
  items,
  activeVendorName,
  terms,
}) => {
  const netTotal = items.reduce((acc, it) => acc + it.qty * (it.rate3 || it.rate2), 0);
  const gst = Math.round(netTotal * 0.18);
  const gross = netTotal + gst;

  return (
    <div className="space-y-5 pt-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs bg-purple-100 text-purple-900 font-bold px-2.5 py-0.5 rounded">
                PPO-2026-0005
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ppoAccepted
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {ppoAccepted ? '✓ PPO Accepted & Order Active' : 'Action Required: Pending Vendor Acceptance'}
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 mt-1">
              Reception Counter Fabrication (Drawing: Counter Elevation D)
            </h3>
            <p className="text-xs text-slate-500">
              Buyer Entity: <strong>L&T Infra & Construction</strong> • Awarded Vendor:{' '}
              <strong className="text-slate-800">{activeVendorName}</strong>
            </p>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">
              Awarded Grand Total (Incl. 18% GST)
            </span>
            <span className="text-2xl font-black text-emerald-700">₹ {gross.toLocaleString()}</span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 font-bold border-b text-slate-800">
              <tr>
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3">Item Code & Specification</th>
                <th className="p-3 text-right">Qty & UOM</th>
                <th className="p-3 text-right font-mono">Awarded Rate (₹)</th>
                <th className="p-3 text-right font-mono font-bold">Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {items.map((it, idx) => {
                const awardedRate = it.rate3 || it.rate2;
                return (
                  <tr key={it.code} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-400 text-center">{idx + 1}</td>
                    <td className="p-3 font-sans font-bold text-slate-900">
                      {it.desc} <span className="font-mono text-sky-700 text-[10px] block">{it.code}</span>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-800">
                      {it.qty} {it.uom}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-800">₹ {awardedRate.toLocaleString()}</td>
                    <td className="p-3 text-right font-black text-emerald-950">
                      ₹ {Math.round(it.qty * awardedRate).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 font-bold font-mono border-t">
              <tr>
                <td colSpan={4} className="p-3 text-right font-sans uppercase text-slate-600">
                  Net Award Subtotal:
                </td>
                <td className="p-3 text-right text-slate-900">₹ {Math.round(netTotal).toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan={4} className="p-3 text-right font-sans uppercase text-slate-500">
                  GST @ 18%:
                </td>
                <td className="p-3 text-right text-slate-700">₹ {gst.toLocaleString()}</td>
              </tr>
              <tr className="bg-purple-100 text-purple-950 font-black text-sm">
                <td colSpan={4} className="p-3 text-right font-sans uppercase">
                  Gross Order Total:
                </td>
                <td className="p-3 text-right text-purple-950">₹ {gross.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Commercial Terms Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Binding Payment Terms:</span>
            <p className="font-bold text-slate-900">
              {terms.advPct} Advance | 70% Progress RA | {terms.retPct} DLP ({terms.creditDays})
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Committed Logistics:</span>
            <p className="font-bold text-sky-900">
              Lead Time: {terms.leadTime} • Target Handover: {terms.deliveryDate}
            </p>
          </div>
        </div>

        {/* Acceptance Actions */}
        <div
          className={`p-5 rounded-xl border ${
            ppoAccepted ? 'bg-emerald-50 border-emerald-300' : 'bg-purple-50 border-purple-200'
          } space-y-4`}
        >
          {ppoAccepted ? (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-950">{UI_STRINGS.vendorPortal.orderAcknowledged}</h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Electronically accepted by <strong>Authorized Signatory</strong> on{' '}
                  <strong>06-Sep-2026 16:00 IST</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-black text-purple-950">Vendor Electronic Acceptance & Contract Confirmation</h4>
              <p className="text-xs text-purple-800 mt-0.5">
                By accepting this Purchase Price Offer, your organization confirms commercial readiness
                to deliver as per contracted terms.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-purple-200">
            <button
              type="button"
              onClick={() => alert('Downloading official signed PO PDF...')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm flex items-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>{UI_STRINGS.vendorPortal.downloadPO}</span>
            </button>

            {!ppoAccepted ? (
              <button
                type="button"
                onClick={onAcceptPPO}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs shadow-md flex items-center space-x-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{UI_STRINGS.vendorPortal.acceptPPO}</span>
              </button>
            ) : (
              <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-300">
                PO Execution in Progress (Site Mobilization Active)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
