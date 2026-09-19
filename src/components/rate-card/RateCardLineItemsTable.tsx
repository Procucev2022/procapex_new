'use client';

import React from 'react';
import type { RateCardLineItemsTableProps } from '@/types';
import { UI_STRINGS } from '@/constants';

export const RateCardLineItemsTable: React.FC<RateCardLineItemsTableProps> = ({
  items,
  status,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
            <th className="py-3 px-4">Item Code</th>
            <th className="py-3 px-4">Standard BOQ Scope Description</th>
            <th className="py-3 px-3 text-center">UOM</th>
            <th className="py-3 px-3 text-right bg-indigo-50/50 text-indigo-900 border-x border-indigo-100/50">
              {UI_STRINGS.rateCards.aiCostHeader}
            </th>
            <th className="py-3 px-3 text-right bg-blue-50/40 text-blue-900 border-r border-blue-100/40">
              {UI_STRINGS.rateCards.recentBestRateHeader}
            </th>
            <th className="py-3 px-3 text-right bg-emerald-50/40 text-emerald-900 border-r border-emerald-100/40">
              {UI_STRINGS.rateCards.lastPpoRateHeader}
            </th>
            <th className="py-3 px-3 text-right">
              {UI_STRINGS.rateCards.proposedRateHeader}
            </th>
            {(status === 'COUNTER_OFFERED' || status === 'ACCEPTED' || status === 'FINALISED') && (
              <th className="py-3 px-3 text-right bg-amber-50/60 text-amber-900 border-x border-amber-100">
                {UI_STRINGS.rateCards.sellerCounterRateHeader}
              </th>
            )}
            <th className="py-3 px-4 text-right bg-emerald-50 font-bold text-emerald-900">
              {UI_STRINGS.rateCards.finalAgreedRateHeader}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((item) => (
            <tr key={item.itemCode} className="hover:bg-slate-50/80 transition-colors">
              <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                {item.itemCode}
              </td>
              <td className="py-3 px-4 font-medium text-slate-700 max-w-xs">
                <div>{item.desc}</div>
                {item.notes && (
                  <div className="text-[11px] text-slate-400 mt-0.5 italic">{item.notes}</div>
                )}
              </td>
              <td className="py-3 px-3 text-center font-semibold text-slate-500 whitespace-nowrap">
                {item.uom}
              </td>
              <td className="py-3 px-3 text-right font-semibold text-indigo-700 bg-indigo-50/30 border-x border-indigo-100/50">
                ₹{item.aiShouldCost.toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-3 text-right font-medium text-blue-700 bg-blue-50/20 border-r border-blue-100/40">
                {item.recentBestRate ? `₹${item.recentBestRate.toLocaleString('en-IN')}` : '—'}
              </td>
              <td className="py-3 px-3 text-right font-medium text-emerald-700 bg-emerald-50/20 border-r border-emerald-100/40">
                {item.lastPpoRate ? `₹${item.lastPpoRate.toLocaleString('en-IN')}` : '—'}
              </td>
              <td className="py-3 px-3 text-right font-semibold text-slate-800">
                ₹{item.proposedRate.toLocaleString('en-IN')}
              </td>
              {(status === 'COUNTER_OFFERED' || status === 'ACCEPTED' || status === 'FINALISED') && (
                <td className="py-3 px-3 text-right font-semibold text-amber-700 bg-amber-50/40 border-x border-amber-100">
                  {item.sellerCounterRate ? `₹${item.sellerCounterRate.toLocaleString('en-IN')}` : '—'}
                </td>
              )}
              <td className="py-3 px-4 text-right font-bold text-emerald-800 bg-emerald-50/60 whitespace-nowrap">
                ₹{item.finalAgreedRate.toLocaleString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
