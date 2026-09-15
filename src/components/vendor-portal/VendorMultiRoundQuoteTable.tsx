'use client';

import React from 'react';
import { Send } from 'lucide-react';
import type { VendorQuoteItem } from '@/types';
import { UI_STRINGS } from '@/constants';

interface VendorMultiRoundQuoteTableProps {
  items: VendorQuoteItem[];
  activeRound: 1 | 2 | 3 | 'all';
  onRate1Change: (idx: number, val: string) => void;
  onRate2Change: (idx: number, val: string) => void;
  onRate3Change: (idx: number, val: string) => void;
  quote1Submitted: boolean;
  quote2Submitted: boolean;
  quote3Submitted: boolean;
  onSubmitActiveRound: () => void;
}

export const VendorMultiRoundQuoteTable: React.FC<VendorMultiRoundQuoteTableProps> = ({
  items,
  activeRound,
  onRate1Change,
  onRate2Change,
  onRate3Change,
  quote1Submitted,
  quote2Submitted,
  quote3Submitted,
  onSubmitActiveRound,
}) => {
  const net1 = items.reduce((acc, it) => acc + it.qty * it.rate1, 0);
  const netBuyer1 = items.reduce((acc, it) => acc + it.qty * (it.buyerOffer1 || it.targetRate), 0);
  const net2 = items.reduce((acc, it) => acc + it.qty * it.rate2, 0);
  const netBuyer2 = items.reduce((acc, it) => acc + it.qty * (it.buyerOffer2 || it.targetRate * 0.98), 0);
  const net3 = items.reduce((acc, it) => acc + it.qty * (it.rate3 || it.rate2), 0);

  const activeSubtotal = activeRound === 1 ? net1 : activeRound === 2 ? net2 : net3;
  const activeGst = Math.round(activeSubtotal * 0.18);
  const activeGross = activeSubtotal + activeGst;

  const showR1 = activeRound === 2 || activeRound === 3 || activeRound === 'all';
  const showB1 = activeRound === 2 || activeRound === 3 || activeRound === 'all';
  const showR2 = activeRound === 3 || activeRound === 'all';
  const showB2 = activeRound === 3 || activeRound === 'all';

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs bg-white">
      <table className="w-full text-left text-xs text-slate-700">
        <thead className="bg-slate-100 font-bold border-b text-slate-800">
          <tr>
            <th className="p-3 w-10 text-center">#</th>
            <th className="p-3 w-56">Item Code & Specification</th>
            <th className="p-3 w-16 text-center">UOM</th>
            <th className="p-3 w-16 text-right">Qty</th>

            {showR1 && (
              <>
                <th className="p-3 text-right bg-rose-50/90 border-l border-rose-200 min-w-[110px]">
                  <div className="flex items-center justify-end space-x-1">
                    <span>{UI_STRINGS.vendorPortal.round1Header}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 font-extrabold">Q1</span>
                  </div>
                  <span className="block text-[9px] text-rose-700 font-normal">{UI_STRINGS.vendorPortal.rateCol}</span>
                </th>
                <th className="p-3 text-right bg-rose-50/90 min-w-[115px]">
                  <span>{UI_STRINGS.vendorPortal.round1Header}</span>
                  <span className="block text-[9px] text-rose-700 font-normal">{UI_STRINGS.vendorPortal.amtCol}</span>
                </th>
              </>
            )}

            {showB1 && (
              <>
                <th className="p-3 text-right bg-sky-50/90 border-l border-sky-200 min-w-[110px]">
                  <div className="flex items-center justify-end space-x-1">
                    <span>{UI_STRINGS.vendorPortal.buyerOffer1Header}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-200 text-sky-900 font-extrabold">CM</span>
                  </div>
                  <span className="block text-[9px] text-sky-700 font-normal">{UI_STRINGS.vendorPortal.rateCol}</span>
                </th>
                <th className="p-3 text-right bg-sky-50/90 min-w-[115px]">
                  <span>{UI_STRINGS.vendorPortal.buyerOffer1Header}</span>
                  <span className="block text-[9px] text-sky-700 font-normal">{UI_STRINGS.vendorPortal.amtCol}</span>
                </th>
              </>
            )}

            {showR2 && (
              <>
                <th className="p-3 text-right bg-emerald-50/90 border-l border-emerald-200 min-w-[110px]">
                  <div className="flex items-center justify-end space-x-1">
                    <span>{UI_STRINGS.vendorPortal.round2Header}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-extrabold">Q2 BAFO</span>
                  </div>
                  <span className="block text-[9px] text-emerald-700 font-normal">{UI_STRINGS.vendorPortal.rateCol}</span>
                </th>
                <th className="p-3 text-right bg-emerald-50/90 min-w-[115px]">
                  <span>{UI_STRINGS.vendorPortal.round2Header}</span>
                  <span className="block text-[9px] text-emerald-700 font-normal">{UI_STRINGS.vendorPortal.amtCol}</span>
                </th>
              </>
            )}

            {showB2 && (
              <>
                <th className="p-3 text-right bg-amber-50/90 border-l border-amber-200 min-w-[110px]">
                  <div className="flex items-center justify-end space-x-1">
                    <span>{UI_STRINGS.vendorPortal.buyerOffer2Header}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-extrabold">CM</span>
                  </div>
                  <span className="block text-[9px] text-amber-700 font-normal">{UI_STRINGS.vendorPortal.rateCol}</span>
                </th>
                <th className="p-3 text-right bg-amber-50/90 min-w-[115px]">
                  <span>{UI_STRINGS.vendorPortal.buyerOffer2Header}</span>
                  <span className="block text-[9px] text-amber-700 font-normal">{UI_STRINGS.vendorPortal.amtCol}</span>
                </th>
              </>
            )}

            {/* ALWAYS LAST TWO COLUMNS: EDITABLE NEXT QUOTE RATE & AMOUNT */}
            <th className="p-3 text-right bg-purple-100 text-purple-950 font-black border-l border-purple-300 min-w-[145px]">
              <div className="flex items-center justify-end space-x-1">
                <span>
                  {activeRound === 1
                    ? UI_STRINGS.vendorPortal.round1Header
                    : activeRound === 2
                    ? UI_STRINGS.vendorPortal.round2Header
                    : UI_STRINGS.vendorPortal.round3Header}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-600 text-white font-extrabold">
                  {activeRound === 1 ? 'Editable Q1' : activeRound === 2 ? 'Editable Q2' : 'Editable Q3'}
                </span>
              </div>
              <span className="block text-[9px] text-purple-700 font-normal">{UI_STRINGS.vendorPortal.editableRateHeader}</span>
            </th>
            <th className="p-3 text-right bg-purple-100 text-purple-950 font-black min-w-[140px]">
              <span>
                {activeRound === 1
                  ? UI_STRINGS.vendorPortal.round1Header
                  : activeRound === 2
                  ? UI_STRINGS.vendorPortal.round2Header
                  : UI_STRINGS.vendorPortal.round3Header}
              </span>
              <span className="block text-[9px] text-purple-700 font-normal">{UI_STRINGS.vendorPortal.calculatedAmtHeader}</span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200 font-mono">
          {items.map((it, idx) => {
            const amt1 = it.qty * it.rate1;
            const amtBuyer1 = it.qty * (it.buyerOffer1 || it.targetRate);
            const amt2 = it.qty * it.rate2;
            const amtBuyer2 = it.qty * (it.buyerOffer2 || it.targetRate * 0.98);
            const activeRate = activeRound === 1 ? it.rate1 : activeRound === 2 ? it.rate2 : (it.rate3 || it.rate2);
            const activeAmt = it.qty * activeRate;

            const handleRateChange = (val: string): void => {
              if (activeRound === 1) onRate1Change(idx, val);
              else if (activeRound === 2) onRate2Change(idx, val);
              else onRate3Change(idx, val);
            };

            return (
              <tr key={it.code} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 text-slate-400 text-center">{idx + 1}</td>
                <td className="p-3 font-sans">
                  <strong className="text-slate-900 block text-xs font-semibold">{it.desc}</strong>
                  <span className="font-mono text-sky-800 text-[10px]">{it.code}</span>
                </td>
                <td className="p-3 text-center font-bold text-slate-700">{it.uom}</td>
                <td className="p-3 text-right font-black text-slate-900">{it.qty}</td>

                {showR1 && (
                  <>
                    <td className="p-3 text-right bg-rose-50/40 border-l border-rose-200 font-bold text-slate-800">
                      ₹ {it.rate1.toLocaleString()}
                    </td>
                    <td className="p-3 text-right bg-rose-50/40 font-bold text-slate-900">
                      ₹ {Math.round(amt1).toLocaleString()}
                    </td>
                  </>
                )}

                {showB1 && (
                  <>
                    <td className="p-3 text-right bg-sky-50/40 border-l border-sky-200 font-bold text-sky-950">
                      ₹ {(it.buyerOffer1 || it.targetRate).toLocaleString()}
                    </td>
                    <td className="p-3 text-right bg-sky-50/40 font-bold text-sky-900">
                      ₹ {Math.round(amtBuyer1).toLocaleString()}
                    </td>
                  </>
                )}

                {showR2 && (
                  <>
                    <td className="p-3 text-right bg-emerald-50/40 border-l border-emerald-200 font-bold text-emerald-950">
                      ₹ {it.rate2.toLocaleString()}
                    </td>
                    <td className="p-3 text-right bg-emerald-50/40 font-bold text-emerald-900">
                      ₹ {Math.round(amt2).toLocaleString()}
                    </td>
                  </>
                )}

                {showB2 && (
                  <>
                    <td className="p-3 text-right bg-amber-50/40 border-l border-amber-200 font-bold text-amber-950">
                      ₹ {(it.buyerOffer2 || Math.round(it.targetRate * 0.98)).toLocaleString()}
                    </td>
                    <td className="p-3 text-right bg-amber-50/40 font-bold text-amber-900">
                      ₹ {Math.round(amtBuyer2).toLocaleString()}
                    </td>
                  </>
                )}

                {/* EDITABLE ACTIVE RATE (LAST TWO COLUMNS) */}
                <td className="p-3 text-right bg-purple-50/70 border-l border-purple-200">
                  <div className="flex items-center justify-end space-x-1">
                    <span className="text-purple-800 text-xs font-bold">₹</span>
                    <input
                      type="number"
                      value={activeRate}
                      onChange={(e) => handleRateChange(e.target.value)}
                      className="w-24 px-2 py-1 text-xs font-black text-purple-950 font-mono bg-white border border-purple-300 rounded text-right shadow-inner focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                </td>

                {/* CALCULATED ACTIVE AMOUNT (LAST TWO COLUMNS) */}
                <td className="p-3 text-right bg-purple-50/70 font-mono font-black text-purple-950 text-xs">
                  ₹ {Math.round(activeAmt).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>

        {/* TFOOT WITH QUOTE SUBMISSION PROVISION UNDER THE COLUMN */}
        <tfoot className="bg-slate-50 font-bold border-t font-mono">
          <tr>
            <td colSpan={4} className="p-3 text-right font-sans uppercase text-slate-600">
              Totals:
            </td>

            {showR1 && (
              <>
                <td className="p-3 text-right bg-rose-100/70 border-l border-rose-200 text-rose-950">
                  ₹ {Math.round(net1).toLocaleString()}
                </td>
                <td className="p-3 text-right bg-rose-100/70 text-rose-950">1st Sum</td>
              </>
            )}

            {showB1 && (
              <>
                <td className="p-3 text-right bg-sky-100/70 border-l border-sky-200 text-sky-950">
                  ₹ {Math.round(netBuyer1).toLocaleString()}
                </td>
                <td className="p-3 text-right bg-sky-100/70 text-sky-950">Offer 1</td>
              </>
            )}

            {showR2 && (
              <>
                <td className="p-3 text-right bg-emerald-100/70 border-l border-emerald-200 text-emerald-950">
                  ₹ {Math.round(net2).toLocaleString()}
                </td>
                <td className="p-3 text-right bg-emerald-100/70 text-emerald-950">2nd Sum</td>
              </>
            )}

            {showB2 && (
              <>
                <td className="p-3 text-right bg-amber-100/70 border-l border-amber-200 text-amber-950">
                  ₹ {Math.round(netBuyer2).toLocaleString()}
                </td>
                <td className="p-3 text-right bg-amber-100/70 text-amber-950">Offer 2</td>
              </>
            )}

            {/* DIRECT SUBMIT PROVISION UNDER LAST TWO COLUMNS */}
            <td colSpan={2} className="p-3 bg-purple-100 border-l border-purple-300">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-sans font-bold text-purple-900 uppercase">Net Quoted:</span>
                  <span className="text-sm font-black text-purple-950">₹ {Math.round(activeSubtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-purple-800">
                  <span className="font-sans">GST @ 18%:</span>
                  <span>₹ {activeGst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-purple-200 pt-1">
                  <span className="font-sans font-black text-purple-950">Gross Bid:</span>
                  <span className="font-black text-purple-950">₹ {activeGross.toLocaleString()}</span>
                </div>

                <button
                  type="button"
                  onClick={onSubmitActiveRound}
                  className="w-full mt-2 py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {activeRound === 1
                      ? quote1Submitted
                        ? UI_STRINGS.vendorPortal.quote1Submitted
                        : UI_STRINGS.vendorPortal.submitQuote1
                      : activeRound === 2
                      ? quote2Submitted
                        ? UI_STRINGS.vendorPortal.quote2Submitted
                        : UI_STRINGS.vendorPortal.submitQuote2
                      : quote3Submitted
                      ? UI_STRINGS.vendorPortal.quote3Submitted
                      : UI_STRINGS.vendorPortal.submitQuote3}
                  </span>
                </button>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
